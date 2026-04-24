"use client";

import { useEffect, useState, useRef, use } from "react";

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

type Step = "browse" | "select_product" | "select_options" | "shipping" | "payment" | "done";

export default function ShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: "",
    recipientPhone: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    memo: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/products?shopId=${shopId}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        if (data.length > 0) {
          const productList = data
            .map((p: Product, i: number) => `${i + 1}. ${p.name} - ${p.price.toLocaleString()}원`)
            .join("\n");
          setMessages([
            {
              role: "assistant",
              content: `안녕하세요! 쇼핑을 도와드릴게요.\n\n상품 목록입니다:\n${productList}\n\n원하시는 상품 번호를 입력해주세요.`,
            },
          ]);
        }
      })
      .catch(() => {});
  }, [shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    addMessage("user", text);

    if (step === "browse") {
      const num = parseInt(text);
      if (num >= 1 && num <= products.length) {
        const product = products[num - 1];
        setSelectedProduct(product);

        const options = [
          product.option1Name ? `${product.option1Name}: ${product.option1Values}` : null,
          product.option2Name ? `${product.option2Name}: ${product.option2Values}` : null,
          product.option3Name ? `${product.option3Name}: ${product.option3Values}` : null,
        ].filter(Boolean);

        if (options.length > 0) {
          setTimeout(() => {
            addMessage(
              "assistant",
              `"${product.name}"을(를) 선택하셨습니다.\n\n선택사항을 골라주세요:\n${options.join("\n")}\n\n예: 빨강, L, 기본`
            );
            setStep("select_options");
          }, 300);
        } else {
          setTimeout(() => {
            addMessage("assistant", `"${product.name}"을(를) 선택하셨습니다.\n\n배송지 정보를 입력해주세요.\n이름, 전화번호, 우편번호, 주소, 상세주소\n\n예: 홍길동, 010-1234-5678, 12345, 서울시 강남구 테헤란로 1, 101호`);
            setStep("shipping");
          }, 300);
        }
      } else {
        setTimeout(() => addMessage("assistant", "올바른 상품 번호를 입력해주세요."), 300);
      }
    } else if (step === "select_options") {
      const parts = text.split(",").map((s) => s.trim());
      const opts: Record<string, string> = {};
      if (selectedProduct?.option1Name) opts[selectedProduct.option1Name] = parts[0] || "";
      if (selectedProduct?.option2Name) opts[selectedProduct.option2Name] = parts[1] || "";
      if (selectedProduct?.option3Name) opts[selectedProduct.option3Name] = parts[2] || "";
      setSelectedOptions(opts);

      setTimeout(() => {
        addMessage("assistant", `선택하신 옵션:\n${Object.entries(opts).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n배송지 정보를 입력해주세요.\n이름, 전화번호, 우편번호, 주소, 상세주소\n\n예: 홍길동, 010-1234-5678, 12345, 서울시 강남구 테헤란로 1, 101호`);
        setStep("shipping");
      }, 300);
    } else if (step === "shipping") {
      const parts = text.split(",").map((s) => s.trim());
      if (parts.length >= 4) {
        const info = {
          recipientName: parts[0],
          recipientPhone: parts[1],
          zipCode: parts[2],
          address: parts[3],
          addressDetail: parts[4] || "",
          memo: parts[5] || "",
        };
        setShippingInfo(info);

        setTimeout(() => {
          addMessage(
            "assistant",
            `주문 확인:\n\n상품: ${selectedProduct?.name}\n${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join("\n")}\n가격: ${selectedProduct?.price.toLocaleString()}원\n\n배송지:\n${info.recipientName} / ${info.recipientPhone}\n(${info.zipCode}) ${info.address} ${info.addressDetail}\n\n결제 방법을 선택해주세요:\n1. 카카오로 보내기\n2. 토스로 보내기\n3. 직접 계좌이체`
          );
          setStep("payment");
        }, 300);
      } else {
        setTimeout(() => addMessage("assistant", "이름, 전화번호, 우편번호, 주소, 상세주소를 쉼표로 구분해서 입력해주세요."), 300);
      }
    } else if (step === "payment") {
      const num = parseInt(text);
      const methodMap: Record<number, string> = { 1: "KAKAO_SEND", 2: "TOSS_SEND", 3: "BANK_TRANSFER" };
      const labelMap: Record<number, string> = { 1: "카카오로 보내기", 2: "토스로 보내기", 3: "직접 계좌이체" };

      if (methodMap[num]) {
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopId,
            paymentMethod: methodMap[num],
            ...shippingInfo,
            items: [
              {
                productId: selectedProduct?.id,
                quantity: 1,
                option1: selectedOptions[selectedProduct?.option1Name || ""] || null,
                option2: selectedOptions[selectedProduct?.option2Name || ""] || null,
                option3: selectedOptions[selectedProduct?.option3Name || ""] || null,
                price: selectedProduct?.price || 0,
              },
            ],
          }),
        })
          .then((r) => {
            if (r.ok) {
              addMessage("assistant", `주문이 완료되었습니다!\n\n결제 방법: ${labelMap[num]}\n\n셀러에게 송금 후 주문이 확정됩니다.\n감사합니다!`);
              setStep("done");
            } else {
              addMessage("assistant", "주문 처리 중 오류가 발생했습니다. 로그인이 필요합니다.");
            }
          })
          .catch(() => {
            addMessage("assistant", "네트워크 오류가 발생했습니다.");
          });
      } else {
        setTimeout(() => addMessage("assistant", "1, 2, 3 중에서 선택해주세요."), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 text-center font-bold text-lg">
        ShopGuide
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-line text-sm ${
                msg.role === "user"
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-gray-800 shadow"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {step !== "done" && (
        <div className="border-t bg-white p-4 max-w-2xl mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
