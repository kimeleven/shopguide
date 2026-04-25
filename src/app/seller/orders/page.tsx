"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  paymentMethod: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  address: string | null;
  addressDetail: string | null;
  zipCode: string | null;
  memo: string | null;
  items: OrderItem[];
  buyer: { name: string | null; email: string | null };
  createdAt: string;
}

const statusLabel: Record<string, string> = {
  PENDING: "대기",
  PAID: "결제완료",
  CONFIRMED: "확인",
  SHIPPED: "배송중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    const res = await fetch("/api/orders/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    }
    setUpdatingId(null);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shrink-0"
        >
          엑셀 다운로드
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            주문이 없습니다
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow p-4 space-y-3">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString("ko-KR")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {order.paymentMethod === "KAKAO_SEND" ? "카카오송금" :
                     order.paymentMethod === "TOSS_SEND" ? "토스송금" :
                     order.paymentMethod === "BANK_TRANSFER" ? "계좌이체" : "-"}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1 bg-white cursor-pointer disabled:opacity-50"
                  >
                    {Object.entries(statusLabel).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-sm space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name}
                      {item.option1 && ` / ${item.option1}`}
                      {item.option2 && ` / ${item.option2}`}
                      {item.option3 && ` / ${item.option3}`}
                      {" x "}{item.quantity}
                    </span>
                    <span>{item.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 border-t pt-2">
                <p>{order.recipientName} / {order.recipientPhone}</p>
                <p>{order.zipCode && `(${order.zipCode}) `}{order.address} {order.addressDetail}</p>
                {order.memo && <p className="text-gray-400">메모: {order.memo}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
