"use client";

import { useState, useEffect, useCallback } from "react";

interface Application {
  id: string;
  email: string;
  name: string;
  shopName: string;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  inviteToken: string | null;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});

  const fetchApplications = useCallback(async () => {
    const res = await fetch("/api/admin/applications");
    if (res.ok) setApplications(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionId(id);
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok && data.inviteToken) {
      const link = `${window.location.origin}/admin/accept?token=${data.inviteToken}`;
      setInviteLinks((prev) => ({ ...prev, [id]: link }));
    }
    fetchApplications();
    setActionId(null);
  }

  const statusLabel = (status: Application["status"]) => {
    if (status === "PENDING") return <span className="text-yellow-600 font-medium">심사중</span>;
    if (status === "APPROVED") return <span className="text-green-600 font-medium">승인됨</span>;
    return <span className="text-red-500 font-medium">거절됨</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">셀러 신청 관리</h1>

      {loading ? (
        <p className="text-sm text-gray-500">로딩 중...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border p-6 text-sm text-gray-500">신청 내역이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{app.name}</p>
                  <p className="text-sm text-gray-500">{app.email}</p>
                  <p className="text-sm text-gray-700 mt-1">쇼핑몰: <span className="font-medium">{app.shopName}</span></p>
                  {app.description && (
                    <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    신청일: {new Date(app.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="shrink-0">{statusLabel(app.status)}</div>
              </div>

              {app.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(app.id, "approve")}
                    disabled={actionId === app.id}
                    className="px-4 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleAction(app.id, "reject")}
                    disabled={actionId === app.id}
                    className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              )}

              {app.status === "APPROVED" && (app.inviteToken || inviteLinks[app.id]) && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-gray-600">초대 링크 (7일 유효):</p>
                  {(() => {
                    const link = inviteLinks[app.id] || `${typeof window !== "undefined" ? window.location.origin : ""}/admin/accept?token=${app.inviteToken}`;
                    return (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={link}
                          className="flex-1 border rounded px-2 py-1 text-xs bg-white"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(link)}
                          className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 transition"
                        >
                          복사
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
