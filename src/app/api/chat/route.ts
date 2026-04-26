import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Product {
  id: string;
  name: string;
  price: number;
  option1Name: string | null;
  option1Values: string | null;
  option2Name: string | null;
  option2Values: string | null;
  option3Name: string | null;
  option3Values: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  products: Product[];
  step: string;
  selectedProduct: Product | null;
  selectedOptions: Record<string, string>;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "GEMINI_API_KEY가 설정되지 않았습니다.", nextStep: "browse" },
      { status: 500 }
    );
  }

  const body: ChatRequest = await req.json();
  const { messages, products, step, selectedProduct, selectedOptions } = body;

  const productList = products
    .map((p, i) => {
      const opts = [
        p.option1Name ? `${p.option1Name}(${p.option1Values})` : null,
        p.option2Name ? `${p.option2Name}(${p.option2Values})` : null,
        p.option3Name ? `${p.option3Name}(${p.option3Values})` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return `index ${i}: "${p.name}" - ${p.price.toLocaleString()}원${opts ? ` [옵션: ${opts}]` : " [옵션 없음]"}`;
    })
    .join("\n");

  const selectedProductInfo = selectedProduct
    ? `선택된 상품: "${selectedProduct.name}" (${selectedProduct.price.toLocaleString()}원)` +
      (selectedProduct.option1Name
        ? `\n옵션 구성: ${[
            selectedProduct.option1Name ? `${selectedProduct.option1Name}(${selectedProduct.option1Values})` : null,
            selectedProduct.option2Name ? `${selectedProduct.option2Name}(${selectedProduct.option2Values})` : null,
            selectedProduct.option3Name ? `${selectedProduct.option3Name}(${selectedProduct.option3Values})` : null,
          ]
            .filter(Boolean)
            .join(", ")}`
        : "")
    : "선택된 상품 없음";

  const selectedOptionsInfo =
    Object.keys(selectedOptions).length > 0
      ? `선택된 옵션: ${JSON.stringify(selectedOptions)}`
      : "선택된 옵션 없음";

  const systemInstruction = `당신은 ShopGuide의 친절한 쇼핑 도우미입니다. 고객이 대화를 통해 상품을 주문할 수 있도록 자연스럽게 안내합니다.

[판매 상품 목록 (0-based index)]
${productList}

[현재 상태]
단계: ${step}
${selectedProductInfo}
${selectedOptionsInfo}

[단계별 안내]
- browse: 상품 목록을 보여주고 고객이 원하는 상품을 선택하도록 안내
- select_options: 선택된 상품의 옵션을 선택하도록 안내 (옵션이 없으면 이 단계 건너뜀)
- shipping: 배송지 정보(이름, 전화번호, 우편번호, 주소, 상세주소) 입력 안내
- payment: 결제 방법 선택 안내 (1.카카오로 보내기, 2.토스로 보내기, 3.직접 계좌이체)
- done: 주문 완료

[규칙]
1. 반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이 순수 JSON)
2. message는 친절한 한국어로 작성
3. 상품에 옵션이 없으면 select_options 단계 건너뛰고 바로 shipping으로
4. 배송지 정보는 자연어에서 추출 (예: "홍길동 010-1234-5678 12345 서울시...")
5. 옵션 선택 시 반드시 상품의 실제 옵션명을 키로 사용

[응답 JSON 형식]
{
  "message": "고객에게 보낼 메시지",
  "nextStep": "browse|select_options|shipping|payment|done",
  "productIndex": null,
  "options": null,
  "shippingInfo": null,
  "paymentMethod": null
}

productIndex: browse 단계에서 상품 선택 시 0-based 숫자 (그 외 null)
options: select_options 완료 시 {"옵션명": "선택값"} (그 외 null)
shippingInfo: shipping 완료 시 {"recipientName":"","recipientPhone":"","zipCode":"","address":"","addressDetail":"","memo":""} (그 외 null)
paymentMethod: payment 단계에서 선택 시 "KAKAO_SEND"|"TOSS_SEND"|"BANK_TRANSFER" (그 외 null)`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const history = messages
      .filter((m, i) => !(i === 0 && m.role === "assistant"))
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        message: "죄송합니다, 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        nextStep: step,
        productIndex: null,
        options: null,
        shippingInfo: null,
        paymentMethod: null,
      },
      { status: 500 }
    );
  }
}
