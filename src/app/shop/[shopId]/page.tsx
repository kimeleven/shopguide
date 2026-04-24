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
          const productList = data
            .map((p: Product, i: number) => `${i + 1}. ${p.name} - ${p.price.toLocaleString()}원`)
            .join("\n");
          setMessages([
            {
              role: "assistant",
              content: `안녕하세요! 쇼핑을 도와드릴게요.\n\n상품 목록입니다:\n${productList}\n\n원하시는 상품을 말씀해주세요.`,
            },
          ]);
        }
      })
      .catch(() => {});
  }, [shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      // 상품 선택 처리
      let newSelectedProduct = selectedProduct;
      if (
        nextStep === "select_options" &&
        data.productIndex !== null &&
        data.productIndex !== undefined
      ) {
        newSelectedProduct = products[data.productIndex];
        setSelectedProduct(newSelectedProduct);
      }

      // 옵션 선택 처리
      let newSelectedOptions = selectedOptions;
      if (nextStep === "shipping" && data.options) {
        newSelectedOptions = data.options;
        setSelectedOptions(newSelectedOptions);
      }

      // 배송지 처리
      let activeShippingInfo = shippingInfo;
      if (nextStep === "payment" && data.shippingInfo) {
        activeShippingInfo = data.shippingInfo;
        setShippingInfo(activeShippingInfo);
      }

      // 결제 처리 — 주문 API 호출
      if (data.paymentMethod && (newSelectedProduct || selectedProduct)) {
        const product = newSelectedProduct || selectedProduct;
        const opts = Object.keys(newSelectedOptions).length > 0 ? newSelectedOptions : selectedOptions;
        const shipping = activeShippingInfo;

        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopId,
            paymentMethod: data.paymentMethod,
            ...shipping,
            items: [
              {
                productId: product!.id,
                quantity: 1,
                option1: opts[product!.option1Name || ""] || null,
                option2: opts[product!.option2Name || ""] || null,
                option3: opts[product!.option3Name || ""] || null,
                price: product!.price,
              },
            ],
          }),
        });

        if (orderRes.ok) {
          setStep("done");
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message },
            { role: "assistant", content: "로그인이 필요합니다. 로그인 후 다시 시도해주세요." },
          ]);
          setIsLoading(false);
          return;
        }
      } else {
        setStep(nextStep);
      }

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
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 shadow px-4 py-3 rounded-2xl text-sm">
              ···
            </div>
          </div>
        )}
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
