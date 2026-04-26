"use client";

import { useState, useEffect } from "react";
import './globals.css';

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/status');
    return res.ok;
  } catch {
    return false;
  }
}

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);

  return (
    <html lang="ko">
      <body className="min-h-screen">
        <header className="bg-zinc-900 p-4 flex justify-between items-center">
          <h1 className="text-white font-bold">ShopGuide</h1>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 transition-colors"
            >
              로그아웃
            </button>
          )}
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
