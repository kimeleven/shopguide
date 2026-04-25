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

type Step = "browse" | "select_options" | "shipping" | "payment" | "done";

interface ShippingInfo {
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  memo: string;
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const options = [product.option1Name, product.option2Name, product.option3Name].filter(Boolean);
  return (
    <button
      onClick={() => onSelect(product)}
      className="text-left border rounded-xl p-3 bg-white hover:border-yellow-400 hover:shadow-md transition w-full"
    >
      <div className="font-semibold text-sm text-gray-800">{product.name}</div>
      <div className="text-yellow-600 font-bold text-sm mt-1">
        {product.price.toLocaleString()}원
      </div>
      {options.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">{options.join(" · ")}</div>
      )}
    </button>
  );
}

function OptionSelector({
  product,
  selectedOptions,
  onOptionChange,
  onConfirm,
}: {
  product: Product;
  selectedOptions: Record<string, string>;
  onOptionChange: (name: string, value: string) => void;
  onConfirm: () => void;
}) {
  const optionGroups = [
    { name: product.option1Name, values: product.option1Values },
    { name: product.option2Name, values: product.option2Values },
    { name: product.option3Name, values: product.option3Values },
  ].filter((o): o is { name: string; values: string } => !!o.name && !!o.values);

  const allSelected = optionGroups.every((o) => selectedOptions[o.name]);

  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-4">
      <div className="font-semibold text-sm text-gray-700">
        <span className="text-yellow-600">{product.name}</span> 옵션 선택
      </div>
      {optionGroups.map(({ name, values }) => (
        <div key={name}>
          <div className="text-xs text-gray-500 mb-2 font-medium">{name}</div>
          <div className="flex flex-wrap gap-2">
            {values
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .map((val) => (
                <button
                  key={val}
                  onClick={() => onOptionChange(name, val)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    selectedOptions[name] === val
                      ? "bg-yellow-400 border-yellow-400 text-black font-semibold"
                      : "bg-white border-gray-300 text-gray-700 hover:border-yellow-400"
                  }`}
                >
                  {val}
                </button>
              ))}
          </div>
        </div>
      ))}
      <button
        onClick={onConfirm}
        disabled={!allSelected}
        className="w-full py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        옵션 선택 완료
      </button>
    </div>
  );
}

function ShippingForm({
  shippingInfo,
  onChange,
  onSubmit,
}: {
  shippingInfo: ShippingInfo;
  onChange: (info: ShippingInfo) => void;
  onSubmit: () => void;
}) {
  const set = (field: keyof ShippingInfo, value: string) =>
    onChange({ ...shippingInfo, [field]: value });

  const isValid =
    shippingInfo.recipientName.trim() &&
    shippingInfo.recipientPhone.trim() &&
    shippingInfo.zipCode.trim() &&
    shippingInfo.address.trim();

  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-3">
      <div className="font-semibold text-sm text-gray-700">배송지 정보 입력</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">받는 분 *</label>
          <input
            type="text"
            value={shippingInfo.recipientName}
            onChange={(e) => set("recipientName", e.target.value)}
            placeholder="홍길동"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">전화번호 *</label>
          <input
            type="tel"
            value={shippingInfo.recipientPhone}
            onChange={(e) => set("recipientPhone", e.target.value)}
            placeholder="010-1234-5678"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">우편번호 *</label>
        <input
          type="text"
          value={shippingInfo.zipCode}
          onChange={(e) => set("zipCode", e.target.value)}
          placeholder="12345"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">주소 *</label>
        <input
          type="text"
          value={shippingInfo.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="서울시 강남구..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">상세주소</label>
        <input
          type="text"
          value={shippingInfo.addressDetail}
          onChange={(e) => set("addressDetail", e.target.value)}
          placeholder="101동 202호"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">배송 메모</label>
        <input
          type="text"
          value={shippingInfo.memo}
          onChange={(e) => set("memo", e.target.value)}
          placeholder="문 앞에 놔주세요"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!isValid}
        className="w-full py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        배송지 입력 완료
      </button>
    </div>
  );
}

function PaymentButtons({ onSelect }: { onSelect: (method: string) => void }) {
  const methods = [
    { label: "카카오페이로 보내기", value: "KAKAO_SEND", color: "bg-yellow-400 hover:bg-yellow-500 text-black" },
    { label: "토스로 보내기", value: "TOSS_SEND", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "직접 계좌이체", value: "BANK_TRANSFER", color: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300" },
  ];
  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-2">
      <div className="font-semibold text-sm text-gray-700 mb-3">결제 방법을 선택해주세요</div>
      {methods.map(({ label, value, color }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`w-full py-2.5 rounded-full text-sm font-semibold transition ${color}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function ShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    recipientName: "",
    recipientPhone: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    memo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/products?shopId=${shopId}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        if (data.length > 0) {
          setMessages([
            {
              role: "assistant",
              content: "안녕하세요! 쇼핑을 도와드릴게요.\n아래 상품 중 원하시는 것을 선택해주세요.",
            },
          ]);
        }
      })
      .catch(() => {});
  }, [shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  // 상품 카드 클릭 — Gemini 없이 직접 처리
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    const hasOptions =
      product.option1Name || product.option2Name || product.option3Name;
    const nextStep: Step = hasOptions ? "select_options" : "shipping";
    setStep(nextStep);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `${product.name} 선택` },
      {
        role: "assistant",
        content: hasOptions
          ? `${product.name}을(를) 선택하셨습니다.\n옵션을 선택해주세요.`
          : `${product.name}을(를) 선택하셨습니다.\n배송지 정보를 입력해주세요.`,
      },
    ]);
  };

  // 옵션 확인 — Gemini 없이 직접 처리
  const handleOptionsConfirm = () => {
    setStep("shipping");
    const optionSummary = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `옵션 선택: ${optionSummary}` },
      { role: "assistant", content: "옵션을 선택하셨습니다.\n배송지 정보를 입력해주세요." },
    ]);
  };

  // 배송지 폼 제출 — Gemini 없이 직접 처리
  const handleShippingSubmit = () => {
    setStep("payment");
    const { recipientName, recipientPhone, address } = shippingInfo;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `배송지: ${recipientName} ${recipientPhone} ${address}` },
      { role: "assistant", content: "배송지를 입력하셨습니다.\n결제 방법을 선택해주세요." },
    ]);
  };

  // 결제 방법 선택 — /api/orders 직접 호출
  const handlePaymentSelect = async (paymentMethod: string) => {
    if (!selectedProduct) return;
    setIsLoading(true);

    const methodLabel: Record<string, string> = {
      KAKAO_SEND: "카카오페이",
      TOSS_SEND: "토스",
      BANK_TRANSFER: "계좌이체",
    };

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `${methodLabel[paymentMethod] || paymentMethod}로 결제` },
    ]);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          paymentMethod,
          ...shippingInfo,
          items: [
            {
              productId: selectedProduct.id,
              quantity: 1,
              option1: selectedOptions[selectedProduct.option1Name || ""] || null,
              option2: selectedOptions[selectedProduct.option2Name || ""] || null,
              option3: selectedOptions[selectedProduct.option3Name || ""] || null,
              price: selectedProduct.price,
            },
          ],
        }),
      });

      if (res.ok) {
        setStep("done");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "주문이 완료되었습니다!\n셀러가 확인 후 연락드릴 예정입니다.\n감사합니다.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "주문 처리 중 오류가 발생했습니다. 로그인 후 다시 시도해주세요." },
        ]);
        setStep("payment");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 텍스트 채팅 — browse 단계 자유 대화용
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          products,
          step,
          selectedProduct,
          selectedOptions,
        }),
      });

      const data = await res.json();
      const nextStep: Step = data.nextStep || step;

      if (nextStep === "select_options" && data.productIndex != null) {
        setSelectedProduct(products[data.productIndex]);
      }

      setStep(nextStep);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const showTextInput = step === "browse";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 text-center font-bold text-lg sticky top-0 z-10">
        ShopGuide
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full pb-24">
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

        {/* 상품 카드 — browse 단계 */}
        {step === "browse" && products.length > 0 && (
          <div className="space-y-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleProductSelect} />
            ))}
          </div>
        )}

        {/* 옵션 선택 UI */}
        {step === "select_options" && selectedProduct && (
          <OptionSelector
            product={selectedProduct}
            selectedOptions={selectedOptions}
            onOptionChange={(name, value) =>
              setSelectedOptions((prev) => ({ ...prev, [name]: value }))
            }
            onConfirm={handleOptionsConfirm}
          />
        )}

        {/* 배송지 폼 */}
        {step === "shipping" && (
          <ShippingForm
            shippingInfo={shippingInfo}
            onChange={setShippingInfo}
            onSubmit={handleShippingSubmit}
          />
        )}

        {/* 결제 버튼 */}
        {step === "payment" && (
          <PaymentButtons onSelect={handlePaymentSelect} />
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 shadow px-4 py-3 rounded-2xl text-sm">
              ···
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 텍스트 입력 — browse 단계만 */}
      {showTextInput && (
        <div className="border-t bg-white p-4 max-w-2xl mx-auto w-full fixed bottom-0 left-0 right-0">
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
              placeholder="상품에 대해 질문하거나 직접 입력하세요..."
              disabled={isLoading}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition disabled:opacity-50"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
