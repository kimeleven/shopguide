"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";

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

interface ShopInfo {
  name: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
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

const EMPTY_SHIPPING: ShippingInfo = {
  recipientName: "",
  recipientPhone: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  memo: "",
};

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

function QuantityControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (q: number) => void;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-2 font-medium">수량</div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-yellow-400 hover:text-black flex items-center justify-center text-lg font-semibold transition"
        >
          −
        </button>
        <span className="w-8 text-center font-semibold text-gray-800">{quantity}</span>
        <button
          onClick={() => onChange(Math.min(99, quantity + 1))}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-yellow-400 hover:text-black flex items-center justify-center text-lg font-semibold transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

function OptionSelector({
  product,
  selectedOptions,
  quantity,
  onOptionChange,
  onQuantityChange,
  onConfirm,
  onBack,
}: {
  product: Product;
  selectedOptions: Record<string, string>;
  quantity: number;
  onOptionChange: (name: string, value: string) => void;
  onQuantityChange: (q: number) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const optionGroups = [
    { name: product.option1Name, values: product.option1Values },
    { name: product.option2Name, values: product.option2Values },
    { name: product.option3Name, values: product.option3Values },
  ].filter((o): o is { name: string; values: string } => !!o.name && !!o.values);

  const allSelected = optionGroups.every((o) => selectedOptions[o.name]);

  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-gray-700">
          <span className="text-yellow-600">{product.name}</span> 옵션 선택
        </div>
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-600 underline transition"
        >
          ← 다른 상품 보기
        </button>
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
      <QuantityControl quantity={quantity} onChange={onQuantityChange} />
      <button
        onClick={onConfirm}
        disabled={!allSelected}
        className="w-full py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        선택 완료 · {(product.price * quantity).toLocaleString()}원
      </button>
    </div>
  );
}

function ShippingForm({
  shippingInfo,
  onChange,
  onSubmit,
  onBack,
  quantity,
  onQuantityChange,
  showQuantity,
}: {
  shippingInfo: ShippingInfo;
  onChange: (info: ShippingInfo) => void;
  onSubmit: () => void;
  onBack: () => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  showQuantity: boolean;
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
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-gray-700">배송지 정보 입력</div>
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-600 underline transition"
        >
          ← 옵션 다시 선택
        </button>
      </div>
      {showQuantity && (
        <QuantityControl quantity={quantity} onChange={onQuantityChange} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

function PaymentButtons({
  onSelect,
  onBack,
  disabled,
}: {
  onSelect: (method: string) => void;
  onBack: () => void;
  disabled?: boolean;
}) {
  const methods = [
    { label: "카카오페이로 보내기", value: "KAKAO_SEND", color: "bg-yellow-400 hover:bg-yellow-500 text-black" },
    { label: "토스로 보내기", value: "TOSS_SEND", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "직접 계좌이체", value: "BANK_TRANSFER", color: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300" },
  ];
  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-sm text-gray-700">결제 방법을 선택해주세요</div>
        <button
          onClick={onBack}
          disabled={disabled}
          className="text-xs text-gray-400 hover:text-gray-600 underline transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← 배송지 수정
        </button>
      </div>
      {methods.map(({ label, value, color }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          disabled={disabled}
          className={`w-full py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface CompletedOrder {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

function DoneCard({
  onRestart,
  paymentMethod,
  shopInfo,
  completedOrder,
}: {
  onRestart: () => void;
  paymentMethod: string | null;
  shopInfo: ShopInfo | null;
  completedOrder: CompletedOrder | null;
}) {
  const showBankInfo =
    paymentMethod === "BANK_TRANSFER" &&
    shopInfo?.bankAccount;

  return (
    <div className="border rounded-xl p-6 bg-white shadow text-center space-y-4">
      <div className="text-3xl">🎉</div>
      <div className="font-semibold text-gray-800">주문이 완료되었습니다!</div>
      {completedOrder && (
        <div className="text-left bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1 text-sm">
          <p className="text-xs text-yellow-600 font-medium mb-2">
            주문번호: <span className="font-mono font-bold">{completedOrder.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <div className="flex justify-between text-gray-700">
            <span>{completedOrder.productName}{completedOrder.quantity > 1 && ` × ${completedOrder.quantity}`}</span>
            <span className="font-semibold">{completedOrder.totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      )}
      {showBankInfo ? (
        <div className="text-left bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <p className="font-semibold text-gray-700 mb-2">계좌이체 안내</p>
          {shopInfo?.bankName && (
            <p className="text-gray-600">
              은행: <span className="font-medium text-gray-800">{shopInfo.bankName}</span>
            </p>
          )}
          <p className="text-gray-600">
            계좌번호: <span className="font-medium text-gray-800">{shopInfo?.bankAccount}</span>
          </p>
          {shopInfo?.bankHolder && (
            <p className="text-gray-600">
              예금주: <span className="font-medium text-gray-800">{shopInfo.bankHolder}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            위 계좌로 입금 완료 후 셀러가 확인하여 연락드립니다.
          </p>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          셀러가 확인 후 연락드릴 예정입니다.
          <br />
          감사합니다.
        </div>
      )}
      <button
        onClick={onRestart}
        className="w-full py-2.5 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition"
      >
        다시 주문하기
      </button>
    </div>
  );
}

const PENDING_ORDER_KEY = (shopId: string) => `shopguide_pending_${shopId}`;

export default function ShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(EMPTY_SHIPPING);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const makeGreeting = (data: Product[]) => ({
    role: "assistant" as const,
    content:
      data.length > 0
        ? "안녕하세요! 쇼핑을 도와드릴게요.\n아래 상품 중 원하시는 것을 선택해주세요."
        : "안녕하세요! 현재 등록된 상품이 없습니다.",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = fetch(`/api/products?shopId=${shopId}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!cancelled) {
          setProducts(data);
          setMessages([makeGreeting(data)]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([{
            role: "assistant",
            content: "상품 정보를 불러오지 못했습니다.\n잠시 후 페이지를 새로고침 해주세요.",
          }]);
        }
      });

    const fetchShop = fetch(`/api/shops/${shopId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.id) setShopInfo(data);
      })
      .catch(() => {});

    Promise.all([fetchProducts, fetchShop]).finally(() => {
      if (!cancelled) setIsInitialLoading(false);
    });

    return () => { cancelled = true; };
  }, [shopId]);

  // 카카오 로그인 후 복귀 시 저장된 주문 정보 복원
  useEffect(() => {
    if (!session || isInitialLoading) return;
    const saved = localStorage.getItem(PENDING_ORDER_KEY(shopId));
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setSelectedProduct(data.selectedProduct);
      setSelectedOptions(data.selectedOptions);
      setShippingInfo(data.shippingInfo);
      if (data.quantity) setQuantity(data.quantity);
      setStep("payment");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "로그인되었습니다. 결제 방법을 선택해주세요." },
      ]);
    } catch {
      // ignore corrupted data
    } finally {
      localStorage.removeItem(PENDING_ORDER_KEY(shopId));
    }
  }, [session, isInitialLoading, shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  const handleRestart = useCallback(() => {
    setStep("browse");
    setSelectedProduct(null);
    setSelectedOptions({});
    setShippingInfo(EMPTY_SHIPPING);
    setSelectedPaymentMethod(null);
    setQuantity(1);
    setInput("");
    setCompletedOrder(null);
    setMessages([makeGreeting(products)]);
  }, [products]);

  // 상품 카드 클릭
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    const hasOptions = product.option1Name || product.option2Name || product.option3Name;
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

  // 옵션 → browse 뒤로가기
  const handleBackToBrowse = () => {
    setStep("browse");
    setSelectedProduct(null);
    setSelectedOptions({});
    setQuantity(1);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "다른 상품을 선택해주세요." },
    ]);
  };

  // shipping → select_options 뒤로가기
  const handleBackToOptions = () => {
    if (!selectedProduct) return;
    const hasOptions = selectedProduct.option1Name || selectedProduct.option2Name || selectedProduct.option3Name;
    if (hasOptions) {
      setStep("select_options");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "옵션을 다시 선택해주세요." },
      ]);
    } else {
      handleBackToBrowse();
    }
  };

  // payment → shipping 뒤로가기
  const handleBackToShipping = () => {
    setStep("shipping");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "배송지 정보를 수정해주세요." },
    ]);
  };

  // 옵션 확인
  const handleOptionsConfirm = () => {
    setStep("shipping");
    const optionSummary = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const quantityText = quantity > 1 ? ` · ${quantity}개` : "";
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `옵션 선택: ${optionSummary}${quantityText}` },
      { role: "assistant", content: "옵션을 선택하셨습니다.\n배송지 정보를 입력해주세요." },
    ]);
  };

  // 배송지 폼 제출
  const handleShippingSubmit = () => {
    setStep("payment");
    const { recipientName, recipientPhone, address } = shippingInfo;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `배송지: ${recipientName} ${recipientPhone} ${address}` },
      { role: "assistant", content: "배송지를 입력하셨습니다.\n결제 방법을 선택해주세요." },
    ]);
  };

  // 결제 방법 선택
  const handlePaymentSelect = async (paymentMethod: string) => {
    if (!selectedProduct) return;
    setSelectedPaymentMethod(paymentMethod);
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
              quantity,
              option1: selectedOptions[selectedProduct.option1Name || ""] || null,
              option2: selectedOptions[selectedProduct.option2Name || ""] || null,
              option3: selectedOptions[selectedProduct.option3Name || ""] || null,
              price: selectedProduct.price,
            },
          ],
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setCompletedOrder({
          id: order.id,
          productName: selectedProduct.name,
          quantity,
          totalPrice: selectedProduct.price * quantity,
        });
        setStep("done");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "주문이 완료되었습니다!\n셀러가 확인 후 연락드릴 예정입니다.\n감사합니다.",
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
        {shopInfo?.name || "ShopGuide"}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full pb-24">
        {isInitialLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 shadow px-4 py-3 rounded-2xl text-sm animate-pulse">
              쇼핑몰 정보를 불러오는 중...
            </div>
          </div>
        )}
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
            quantity={quantity}
            onOptionChange={(name, value) =>
              setSelectedOptions((prev) => ({ ...prev, [name]: value }))
            }
            onQuantityChange={setQuantity}
            onConfirm={handleOptionsConfirm}
            onBack={handleBackToBrowse}
          />
        )}

        {/* 배송지 폼 */}
        {step === "shipping" && (
          <ShippingForm
            shippingInfo={shippingInfo}
            onChange={setShippingInfo}
            onSubmit={handleShippingSubmit}
            onBack={handleBackToOptions}
            quantity={quantity}
            onQuantityChange={setQuantity}
            showQuantity={!selectedProduct?.option1Name && !selectedProduct?.option2Name && !selectedProduct?.option3Name}
          />
        )}

        {/* 결제 버튼 */}
        {step === "payment" && (
          !session ? (
            <div className="border rounded-xl p-6 bg-white shadow text-center space-y-4">
              <div className="text-2xl">🔐</div>
              <div className="font-semibold text-gray-800">결제를 위해 로그인이 필요합니다</div>
              <div className="text-sm text-gray-500">카카오 로그인 후 주문이 완료됩니다.</div>
              <button
                onClick={() => {
                  localStorage.setItem(PENDING_ORDER_KEY(shopId), JSON.stringify({
                    selectedProduct,
                    selectedOptions,
                    shippingInfo,
                    quantity,
                  }));
                  signIn("kakao", { callbackUrl: window.location.href });
                }}
                className="w-full py-2.5 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition"
              >
                카카오로 로그인하기
              </button>
            </div>
          ) : (
            <PaymentButtons onSelect={handlePaymentSelect} onBack={handleBackToShipping} disabled={isLoading} />
          )
        )}

        {/* 주문 완료 */}
        {step === "done" && (
          <DoneCard
            onRestart={handleRestart}
            paymentMethod={selectedPaymentMethod}
            shopInfo={shopInfo}
            completedOrder={completedOrder}
          />
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
        <div className="border-t bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto w-full fixed bottom-0 left-0 right-0">
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
