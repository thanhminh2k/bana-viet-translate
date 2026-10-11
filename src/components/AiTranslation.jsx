import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function AiTranslation({ text, direction }) {
  const [translation, setTranslation] = useState("");
  const [cached, setCached] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function translate() {
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
        signal: controller.signal,
      });

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
      }

      if (!response.ok) {
        throw new Error(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error
            : `Yêu cầu dịch thất bại (HTTP ${response.status}).`
        );
      }

      if (typeof payload.translation !== "string" || !payload.translation.trim()) {
        throw new Error("Máy chủ không trả về bản dịch hợp lệ.");
      }

      setTranslation(payload.translation);
      setCached(payload.cached === true);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(
        requestError instanceof TypeError
          ? "Không kết nối được máy chủ API. Hãy kiểm tra backend và cấu hình kết nối."
          : requestError instanceof Error
            ? requestError.message
            : "Không dịch được lúc này."
      );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }

  if (!text) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={translate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-teal-700 hover:to-emerald-700 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? "Đang dịch…" : "Dịch cả câu bằng AI"}
      </button>

      <div aria-live="polite">
        {error && (
          <div role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {translation && (
          <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50/80 p-3">
            <div className="mb-1 text-xs font-semibold text-teal-700">
              Bản dịch AI{cached ? " (đã lưu)" : ""}
            </div>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800">
              {translation}
            </div>
            <div className="mt-2 text-xs text-stone-500">
              AI có thể sai với câu xa dữ liệu. Hãy đối chiếu với phần dịch từng từ ở trên.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
