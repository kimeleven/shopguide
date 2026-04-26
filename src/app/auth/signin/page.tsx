"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("[SignIn] Already authenticated, redirecting to home");
      router.push("/");
    }
  }, [status, session, router]);

  const handleKakaoSignIn = async () => {
    console.log("[SignIn] Starting Kakao sign in...");
    try {
      const result = await signIn("kakao", {
        callbackUrl: "/",
        redirect: true,
      });
      console.log("[SignIn] Result:", result);
    } catch (error) {
      console.error("[SignIn] Error:", error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="text-gray-500">카카오 계정으로 간편하게 시작하세요</p>

        {status === "loading" ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">로딩 중...</p>
          </div>
        ) : status === "authenticated" ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">이미 로그인되어 있습니다!</p>
            <button
              onClick={() => router.push("/")}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              홈으로 이동
            </button>
          </div>
        ) : (
          <button
            onClick={handleKakaoSignIn}
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3C5.58 3 2 5.79 2 9.25C2 11.39 3.44 13.27 5.62 14.31L4.88 17.15C4.83 17.34 5.05 17.49 5.22 17.38L8.55 15.3C9.02 15.36 9.5 15.4 10 15.4C14.42 15.4 18 12.61 18 9.17C18 5.79 14.42 3 10 3Z"
                fill="black"
              />
            </svg>
            카카오로 시작하기
          </button>
        )}
      </div>
    </main>
  );
}
