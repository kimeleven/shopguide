import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopGuide",
  description: "채팅 기반 쇼핑 가이드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
