"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  option1Name: string | null;
  option1Values: string | null;
  option2Name: string | null;
  option2Values: string | null;
  option3Name: string | null;
  option3Values: string | null;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    option1Name: "",
    option1Values: "",
    option2Name: "",
    option2Values: "",
    option3Name: "",
    option3Values: "",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseInt(form.price) || 0,
      }),
    });
    if (res.ok) {
      const product = await res.json();
      setProducts((prev) => [product, ...prev]);
      setForm({ name: "", price: "", option1Name: "", option1Values: "", option2Name: "", option2Values: "", option3Name: "", option3Values: "" });
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? "취소" : "+ 상품 등록"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">선택사항{n} 이름</label>
                <input
                  type="text"
                  placeholder={`예: 색상, 사이즈`}
                  value={form[`option${n}Name` as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [`option${n}Name`]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">선택사항{n} 값 (쉼표 구분)</label>
                <input
                  type="text"
                  placeholder={`예: 빨강,파랑,검정`}
                  value={form[`option${n}Values` as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [`option${n}Values`]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          ))}
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            등록하기
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">상품명</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">가격</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">선택사항</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  등록된 상품이 없습니다
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.price.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {[p.option1Name, p.option2Name, p.option3Name].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "판매중" : "숨김"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
