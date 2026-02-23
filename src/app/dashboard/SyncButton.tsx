"use client";

import { useState } from "react";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/commits", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Sync failed");
        return;
      }
      setMessage(
        data.updated > 0
          ? `Synced ${data.updated} commit(s). Reload to see them.`
          : "Already up to date."
      );
    } catch {
      setMessage("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Sync commits"}
      </button>
      {message && (
        <p className="text-xs text-[#8b949e] sm:text-right">{message}</p>
      )}
    </div>
  );
}
