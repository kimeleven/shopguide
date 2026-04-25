"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AcceptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setError("토큰이 없습니다."); setChecking(false); return; }
    fetch(`/api/invite/accept?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEmail(d.email);
        setChecking(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "오류가 발생했습니다."); setLoading(false); return; }
    router.push("/admin/login?welcome=1");
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center">확인 중...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">초대 수락</h1>
          {email && <p className="text-sm text-gray-500 mt-1">{email}</p>}
        </div>
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <input
              type="password"
              placeholder="사용할 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "처리 중..." : "계정 생성 완료"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function AcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <AcceptForm />
    </Suspense>
  );
}
