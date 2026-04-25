"use client";

import { useState } from "react";

export default function SellerApplyPage() {
  const [form, setForm] = useState({ email: "", name: "", shopName: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/seller/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "오류가 발생했습니다.");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-gray-900">신청 완료</h1>
          <p className="text-sm text-gray-500">
            셀러 신청이 접수되었습니다. 관리자 승인 후 초대 링크를 이메일로 안내드립니다.
          </p>
          <a href="/" className="block text-sm text-gray-500 underline">
            홈으로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">셀러 신청</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 승인 후 셀러 계정이 생성됩니다.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            type="text"
            name="shopName"
            placeholder="쇼핑몰 이름"
            value={form.shopName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <textarea
            name="description"
            placeholder="쇼핑몰 소개 (선택)"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "신청 중..." : "셀러 신청하기"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          이미 계정이 있나요?{" "}
          <a href="/admin/login" className="underline">
            로그인
          </a>
        </p>
      </div>
    </main>
  );
}
