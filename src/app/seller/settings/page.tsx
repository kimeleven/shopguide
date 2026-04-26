"use client";

import { useEffect, useState } from "react";

interface ShopForm {
  name: string;
  description: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

const emptyForm: ShopForm = {
  name: "",
  description: "",
  bankName: "",
  bankAccount: "",
  bankHolder: "",
};

export default function SellerSettingsPage() {
  const [form, setForm] = useState<ShopForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/shops")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setForm({
            name: data.name ?? "",
            description: data.description ?? "",
            bankName: data.bankName ?? "",
            bankAccount: data.bankAccount ?? "",
            bankHolder: data.bankHolder ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">쇼핑몰 설정</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">쇼핑몰 이름 *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">쇼핑몰 소개</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 resize-none"
          />
        </div>
        <hr />
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">계좌이체 정보</p>
          <p className="text-xs text-gray-400 mb-3">
            구매자가 계좌이체를 선택하면 아래 정보가 표시됩니다.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">은행명</label>
              <input
                type="text"
                placeholder="예: 카카오뱅크"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">계좌번호</label>
              <input
                type="text"
                placeholder="예: 1234-56-7890123"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">예금주</label>
              <input
                type="text"
                placeholder="예: 홍길동"
                value={form.bankHolder}
                onChange={(e) => setForm({ ...form, bankHolder: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? "저장 완료!" : saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
