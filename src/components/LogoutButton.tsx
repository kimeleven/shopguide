"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-auto text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0"
    >
      로그아웃
    </button>
  );
}
