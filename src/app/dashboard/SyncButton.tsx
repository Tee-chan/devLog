"use client";

import { useState } from "react";

export function SyncButton({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [branch, setBranch] = useState("");

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      const bodyPayload = { owner, repo, ...(branch.trim() ? { branch: branch.trim() } : {}) };
      const res = await fetch("/api/commits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
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
    <div className="flex flex-col items-start gap-2 sm:items-end animate-in fade-in">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Branch (e.g. main)"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="bg-[#0d1117]/80 border border-[#30363d] px-3 py-2 text-xs font-mono rounded-lg text-[#e6edf3] focus:outline-none focus:border-[#1f6feb] transition-colors w-32 shadow-inner"
        />
        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Syncing…</span>
            </>
          ) : "Sync commits"}
        </button>
      </div>
      {message && (
        <p className="text-xs text-[#8b949e] sm:text-right">{message}</p>
      )}
    </div>
  );
}
