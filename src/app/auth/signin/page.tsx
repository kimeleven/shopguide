"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 로그인되어 있으면 홈으로
    if (status === "authenticated" && session) {
      console.log("[SignIn] Already authenticated, redirecting to home");
      router.replace("/");
    }
  }, [status, session, router]);

  const handleKakaoSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    console.log("[SignIn] Starting Kakao sign in...");

    try {
      // 카카오 로그인 - 리다이렉트 방식 사용
      await signIn("kakao", {
        callbackUrl: "/",
        redirect: true,
      });

      // redirect: true이므로 아래 코드는 실행되지 않음
      console.log("[SignIn] This should not appear if redirect works");
    } catch (error) {
      console.error("[SignIn] Error:", error);
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 인증 중일 때
  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-600">
            {isLoading ? "카카오 로그인 중..." : "로딩 중..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="text-gray-500">카카오 계정으로 간편하게 시작하세요</p>

        <button
          onClick={handleKakaoSignIn}
          disabled={isLoading}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              로그인 중...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3C5.58 3 2 5.79 2 9.25C2 11.39 3.44 13.27 5.62 14.31L4.88 17.15C4.83 17.34 5.05 17.49 5.22 17.38L8.55 15.3C9.02 15.36 9.5 15.4 10 15.4C14.42 15.4 18 12.61 18 9.17C18 5.79 14.42 3 10 3Z"
                  fill="black"
                />
              </svg>
              카카오로 시작하기
            </>
          )}
        </button>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            로그인하면 서비스 이용약관에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
