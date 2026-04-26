"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

interface LogEntry {
  timestamp: string;
  step: string;
  data?: Record<string, unknown>;
  error?: string;
}

export function KakaoAuthDebugger() {
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const addLog = (step: string, data?: Record<string, unknown>, error?: string) => {
    const log: LogEntry = {
      timestamp: new Date().toISOString().split("T")[1].slice(0, 12),
      step,
      data,
      error,
    };
    setDebugLogs((prev) => [log, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const callbackUrl = url.searchParams.get("callbackUrl");

    addLog("PAGE_LOAD", { url: window.location.href, error: error || undefined, callbackUrl: callbackUrl || undefined });

    if (error) {
      addLog("URL_ERROR_DETECTED", { error, callbackUrl: callbackUrl || undefined });
    }
  }, []);

  useEffect(() => {
    addLog("SESSION_STATUS_CHANGED", { status, session: session ? { user: session.user } : null });
  }, [status, session]);

  const handleKakaoLogin = async () => {
    addLog("KAKAO_LOGIN_START");

    try {
      const result = await signIn("kakao", {
        callbackUrl: "/",
        redirect: false,
      });

      addLog("KAKAO_LOGIN_RESULT", { result: result ? { url: result.url, error: result.error } : null });

      if (result?.error) {
        addLog("KAKAO_LOGIN_ERROR", undefined, result.error);
      }

      if (result?.url) {
        addLog("KAKAO_LOGIN_REDIRECT", { url: result.url });
        window.location.href = result.url;
      }
    } catch (error) {
      addLog("KAKAO_LOGIN_EXCEPTION", undefined, String(error));
    }
  };

  const checkEnv = () => {
    addLog("ENV_CHECK", {
      baseUrl: window.location.origin,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm font-medium"
      >
        🔍 Kakao Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[500px] max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-blue-900">Kakao Auth Debugger</span>
          <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{debugLogs.length} logs</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-blue-400 hover:text-blue-600">✕</button>
      </div>

      <div className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50">
        <button
          onClick={handleKakaoLogin}
          className="px-3 py-1.5 bg-yellow-400 text-black text-xs font-medium rounded hover:bg-yellow-500 transition"
        >
          Test Kakao Login
        </button>
        <button
          onClick={checkEnv}
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition"
        >
          Check Env
        </button>
        <button
          onClick={() => setDebugLogs([])}
          className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded hover:bg-red-200 transition ml-auto"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[300px] font-mono text-xs">
        {debugLogs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No debug logs yet...</div>
        ) : (
          debugLogs.map((log, i) => (
            <div
              key={i}
              className={`p-2 rounded border ${
                log.error
                  ? "bg-red-50 border-red-200"
                  : log.step.includes("ERROR")
                  ? "bg-red-50 border-red-200"
                  : log.step.includes("KAKAO")
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    log.error || log.step.includes("ERROR")
                      ? "bg-red-200 text-red-800"
                      : log.step.includes("KAKAO")
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {log.step}
                </span>
              </div>
              {log.data && (
                <pre className="mt-1 text-[10px] text-gray-600 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(log.data, null, 2).slice(0, 500)}
                </pre>
              )}
              {log.error && <div className="text-[10px] text-red-600 mt-1">{log.error}</div>}
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center p-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <span className="text-[10px] text-gray-400">
          Session: {status}
        </span>
        <span className="text-[10px] text-gray-400">
          {debugLogs.length} logs
        </span>
      </div>
    </div>
  );
}
