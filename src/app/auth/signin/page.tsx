"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[SIGNIN PAGE] ${msg}`);
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    addLog(`Session status: ${status}`);
    if (session) {
      addLog(`Session user: ${JSON.stringify(session.user)}`);
    }

    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    if (error) {
      addLog(`Error from URL: ${error}`);
    }
  }, [session, status]);

  const handleKakaoSignIn = async () => {
    addLog("Starting Kakao sign in...");
    try {
      addLog(`Environment: ${process.env.NODE_ENV}`);
      addLog(`Current URL: ${window.location.href}`);
      addLog(`Origin: ${window.location.origin}`);

      const result = await signIn("kakao", {
        callbackUrl: "/",
        redirect: false,
      });

      addLog(`SignIn result: ${JSON.stringify(result)}`);

      if (result?.error) {
        addLog(`SignIn error: ${result.error}`);
      }

      if (result?.url) {
        addLog(`Redirecting to: ${result.url}`);
        window.location.href = result.url;
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex-1 text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-500">카카오 계정으로 간편하게 시작하세요</p>

          {status === "authenticated" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">이미 로그인되어 있습니다!</p>
              <p className="text-sm text-green-600 mt-1">{session?.user?.email || session?.user?.name}</p>
              <a href="/" className="block mt-3 text-blue-600 hover:underline">홈으로</a>
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

        <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg w-full lg:w-96 font-mono text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-green-400">Debug Logs ({logs.length})</span>
            <button onClick={() => setLogs([])} className="text-red-400 hover:text-red-300">Clear</button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No logs yet. Click &quot;카카오로 시작하기&quot;...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={log.includes("error") ? "text-red-400" : log.includes("→") ? "text-blue-400" : "text-gray-300"}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
