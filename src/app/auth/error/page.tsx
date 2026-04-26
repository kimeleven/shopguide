"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    console.error("[AUTH ERROR] Error:", error, "URL:", window.location.href);
  }, [error]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "인증 설정에 문제가 있습니다.";
      case "OAuthSignin":
        return "카카오 로그인 시작 중 오류가 발생했습니다.";
      case "OAuthCallback":
        return "카카오 인증 콜백 처리 중 오류가 발생했습니다.";
      case "OAuthCreateAccount":
        return "카카오 계정으로 사용자 생성 중 오류가 발생했습니다.";
      case "AccessDenied":
        return "접근이 거부되었습니다.";
      default:
        return `인증 중 오류가 발생했습니다. (${errorCode || "unknown"})`;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">로그인 오류</h1>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{getErrorMessage(error)}</p>
          {error && <p className="text-red-500 text-sm mt-2 font-mono">{error}</p>}
        </div>

        <div className="space-y-3">
          <Link href="/auth/signin" className="block w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition">
            다시 로그인하기
          </Link>
          <Link href="/" className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
