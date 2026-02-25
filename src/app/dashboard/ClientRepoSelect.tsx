"use client";

import { useState, useEffect } from "react";
import type { GithubRepo } from "@/lib/github";
import { SyncButton } from "./SyncButton";
import { format } from "date-fns";
import { CheckCircle2, GitCommitHorizontal, Users, Calendar } from "lucide-react";

type Commit = {
    id: string;
    sha: string;
    message: string;
    authorName: string;
    authoredAt: string;
    summary: string | null;
    url: string;
};

type Stats = {
    totalCommits: number;
    authors: number;
    lastCommit: string | null;
};

export function ClientRepoSelect({ repos, showTimeline = true }: { repos: GithubRepo[]; showTimeline?: boolean }) {
    const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<"all" | "1d" | "7d" | "30d">("all");

    const fetchDocs = async (repo: GithubRepo, range: string) => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/commits?owner=${repo.owner.login}&repo=${repo.name}&range=${range}`
            );
            if (res.ok) {
                const data = await res.json();
                setCommits(data.commits);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch commits", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRepo && showTimeline) {
            fetchDocs(selectedRepo, dateRange);
        }
    }, [selectedRepo, showTimeline, dateRange]);

    return (
        <div className="space-y-6">
            <section className="bg-[#161b22]/50 backdrop-blur-sm border border-[#21262d] rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-mono font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#8b949e]" />
                    Repositories
                </h2>
                {repos.length === 0 ? (
                    <div className="text-[#8b949e] border border-dashed border-[#30363d] rounded-lg p-12 text-center font-mono text-sm">
                        No repositories found. Ensure your GitHub account has public or allowed repos.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {repos.map((repo) => (
                            <button
                                key={repo.id}
                                onClick={() => setSelectedRepo(repo)}
                                className={`text-left p-4 rounded-xl border transition-all duration-200 ${selectedRepo?.id === repo.id
                                    ? "bg-[#1f6feb]/10 border-[#1f6feb] text-[#e6edf3] shadow-[0_0_15px_rgba(31,111,235,0.15)] ring-1 ring-[#1f6feb]/50"
                                    : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e6edf3] hover:shadow-md"
                                    }`}
                            >
                                <div className="font-mono text-sm font-semibold truncate">
                                    {repo.full_name}
                                </div>
                                <div className="text-xs mt-2 truncate flex items-center gap-1 opacity-80">
                                    <CheckCircle2 className="w-3 h-3 text-[#2ea043]" />
                                    Updated {format(new Date(repo.updated_at), "MMM d, yyyy")}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {selectedRepo && stats && (
                <section className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#161b22]/80 backdrop-blur-md border border-[#21262d] rounded-2xl p-5 text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1f6feb]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <GitCommitHorizontal className="w-4 h-4 text-[#8b949e]" />
                            <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">Synced Commits</p>
                        </div>
                        <p className="text-3xl font-mono font-bold text-[#e6edf3] drop-shadow-sm">
                            {stats.totalCommits || "0"}
                        </p>
                    </div>

                    <div className="bg-[#161b22]/80 backdrop-blur-md border border-[#21262d] rounded-2xl p-5 text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8957e5]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-[#8b949e]" />
                            <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">Authors</p>
                        </div>
                        <p className="text-3xl font-mono font-bold text-[#e6edf3] drop-shadow-sm">
                            {stats.authors || "0"}
                        </p>
                    </div>

                    <div className="bg-[#161b22]/80 backdrop-blur-md border border-[#21262d] rounded-2xl p-5 text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2ea043]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#8b949e]" />
                            <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">Last Sync</p>
                        </div>
                        <p className="text-lg font-mono font-bold text-[#e6edf3] drop-shadow-sm mt-1">
                            {stats.lastCommit ? format(new Date(stats.lastCommit), "MMM d") : "—"}
                        </p>
                    </div>
                </section>
            )}

            {showTimeline && (
                <section className="bg-[#161b22]/50 backdrop-blur-md border border-[#21262d] rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-mono font-semibold text-[#e6edf3] flex items-center gap-2">
                            <GitCommitHorizontal className="w-5 h-5 text-[#8b949e]" />
                            Activity Timeline
                        </h2>
                        {selectedRepo && (
                            <div className="flex items-center gap-3">
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as any)}
                                    className="bg-[#0d1117] border border-[#30363d] text-sm text-[#c9d1d9] rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-[#1f6feb] transition-colors cursor-pointer"
                                >
                                    <option value="all">All Time</option>
                                    <option value="1d">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                                <div onClick={() => setTimeout(() => fetchDocs(selectedRepo, dateRange), 1500)}>
                                    <SyncButton
                                        owner={selectedRepo.owner.login}
                                        repo={selectedRepo.name}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {!selectedRepo ? (
                        <div className="text-[#8b949e] border border-dashed border-[#30363d] rounded-xl p-16 text-center bg-[#0d1117]/50">
                            <GitCommitHorizontal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-mono text-sm">No repository selected.</p>
                            <p className="text-xs mt-2 opacity-70">Pick one above to start tracking commits.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f6feb]"></div>
                        </div>
                    ) : commits.length === 0 ? (
                        <div className="text-[#8b949e] border border-dashed border-[#30363d] rounded-xl p-12 text-center bg-[#0d1117]/50">
                            <p className="font-mono text-sm">No commits synced yet.</p>
                            <p className="text-xs mt-2 opacity-70">Click the Sync button to fetch up to 50 recent commits.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#30363d] before:to-transparent">
                            {commits.map((commit, index) => (
                                <div key={commit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#161b22] bg-[#0d1117] text-[#8b949e] group-hover:text-[#1f6feb] group-hover:border-[#1f6feb]/30 transition-colors shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <GitCommitHorizontal className="w-4 h-4" />
                                    </div>

                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-[#30363d] bg-[#0d1117]/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-[#8b949e]/50 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-xs text-[#1f6feb] font-medium bg-[#1f6feb]/10 px-2 py-0.5 rounded-full ring-1 ring-[#1f6feb]/20">
                                                {commit.sha.substring(0, 7)}
                                            </span>
                                            <time className="text-xs text-[#8b949e] font-mono whitespace-nowrap">
                                                {format(new Date(commit.authoredAt), "MMM d, h:mm a")}
                                            </time>
                                        </div>
                                        <p className="text-sm font-medium text-[#e6edf3] mb-3 leading-snug">
                                            {commit.message}
                                        </p>

                                        {commit.summary && (
                                            <div className="mt-4 pt-3 border-t border-[#30363d]/50 bg-gradient-to-b from-[#161b22]/50 to-transparent p-3 rounded-lg -mx-1 -mb-1">
                                                <div className="text-xs font-mono font-semibold text-[#8957e5] mb-2 flex items-center gap-1.5 opacity-90">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8957e5] animate-pulse" />
                                                    AI Summary
                                                </div>
                                                <div className="text-xs text-[#8b949e] prose prose-invert prose-p:leading-relaxed prose-pre:bg-transparent max-w-none prose-li:my-0">
                                                    {commit.summary.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-1">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#21262d]/50">
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1f6feb] to-[#2ea043] flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                {commit.authorName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-[#8b949e] truncate max-w-[120px]">{commit.authorName}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
