"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="text-gray-500">카카오 계정으로 간편하게 시작하세요</p>
        <button
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
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
      </div>
    </main>
  );
}
