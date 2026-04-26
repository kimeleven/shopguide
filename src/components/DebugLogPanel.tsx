"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  timestamp: string;
  type: "info" | "error" | "warn" | "kakao";
  message: string;
  data?: unknown;
}

export function DebugLogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "error" | "kakao">("all");

  useEffect(() => {
    // Override console methods to capture logs
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };

    const addLog = (type: LogEntry["type"], message: string, data?: unknown) => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString().split("T")[1].slice(0, 12),
        type,
        message: String(message).slice(0, 200),
        data,
      };
      setLogs((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      const isKakao = args.some(
        (a) =>
          typeof a === "string" &&
          (a.toLowerCase().includes("kakao") ||
            a.toLowerCase().includes("auth") ||
            a.toLowerCase().includes("nextauth"))
      );
      addLog(isKakao ? "kakao" : "info", args[0], args.slice(1));
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog("error", args[0], args.slice(1));
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog("warn", args[0], args.slice(1));
    };

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "error") return log.type === "error";
    if (filter === "kakao") return log.type === "kakao" || log.message.toLowerCase().includes("kakao");
    return true;
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 text-sm font-medium"
      >
        🐛 Debug ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Debug Logs</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{logs.length}</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-1 p-2 border-b border-gray-100">
        {(["all", "error", "kakao"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2 py-1 rounded ${
              filter === f ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "error" ? "Errors" : "Kakao"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[400px]">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">No logs yet...</div>
        ) : (
          filteredLogs.map((log, i) => (
            <div
              key={i}
              className={`text-xs p-2 rounded border ${
                log.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : log.type === "kakao"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : log.type === "warn"
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-gray-50 border-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] opacity-60">{log.timestamp}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    log.type === "error"
                      ? "bg-red-200 text-red-800"
                      : log.type === "kakao"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {log.type}
                </span>
              </div>
              <div className="break-all font-mono">{log.message}</div>
              {log.data && (
                <pre className="mt-1 text-[10px] opacity-70 overflow-x-auto">
                  {JSON.stringify(log.data, null, 2).slice(0, 200)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center p-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => setLogs([])}
          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
        >
          Clear
        </button>
        <span className="text-[10px] text-gray-400">
          Showing {filteredLogs.length} of {logs.length}
        </span>
      </div>
    </div>
  );
}
