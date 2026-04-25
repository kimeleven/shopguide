"use client";

import { useState, useEffect, useCallback } from "react";

interface Invite {
  id: string;
  email: string;
  role: string;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SELLER");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);

  const fetchInvites = useCallback(async () => {
    const res = await fetch("/api/admin/invite");
    if (res.ok) setInvites(await res.json());
  }, []);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setInviteLink("");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (res.ok) {
      const link = `${window.location.origin}/admin/accept?token=${data.token}`;
      setInviteLink(link);
      setEmail("");
      fetchInvites();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">사용자 초대</h1>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">초대 링크 생성</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="초대할 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="SELLER">셀러</option>
            <option value="ADMIN">관리자</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "생성 중..." : "초대 링크 생성"}
          </button>
        </form>
        {inviteLink && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-sm text-gray-600">아래 링크를 복사해서 전달하세요 (7일 유효):</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 border rounded px-2 py-1 text-xs bg-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 transition"
              >
                복사
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">초대 목록</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-gray-500">초대 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">이메일</th>
                  <th className="pb-2 pr-4">역할</th>
                  <th className="pb-2 pr-4">상태</th>
                  <th className="pb-2">만료</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invites.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 pr-4">{inv.email}</td>
                    <td className="py-2 pr-4">{inv.role === "ADMIN" ? "관리자" : "셀러"}</td>
                    <td className="py-2 pr-4">
                      {inv.usedAt ? (
                        <span className="text-green-600">사용됨</span>
                      ) : new Date(inv.expiresAt) < new Date() ? (
                        <span className="text-red-500">만료</span>
                      ) : (
                        <span className="text-blue-600">대기중</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-400">{new Date(inv.expiresAt).toLocaleDateString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
