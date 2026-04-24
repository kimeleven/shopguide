"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileSetupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userPhone = (session?.user as any)?.phone;

  useEffect(() => {
    if (!session) return;
    if (userPhone) {
      // Phone already set, redirect home
      router.replace("/");
    }
  }, [session, userPhone, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setError("올바른 전화번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleaned }),
    });
    if (res.ok) {
      await update();
      router.replace("/");
    } else {
      setError("저장에 실패했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연락처 등록</h1>
          <p className="mt-1 text-sm text-gray-500">
            주문 알림 및 배송 안내를 위해 전화번호를 입력해 주세요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              전화번호 *
            </label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
