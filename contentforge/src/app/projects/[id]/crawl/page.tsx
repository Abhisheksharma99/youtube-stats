"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Plus,
  X,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Link2,
  Tag,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface CrawlJob {
  id: string;
  query?: string;
  url?: string;
  status: "pending" | "running" | "completed" | "failed";
  resultCount?: number;
  error?: string;
  createdAt?: string;
}

export default function CrawlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: crawlJobs = [] } = useQuery<CrawlJob[]>({
    queryKey: ["crawl-jobs", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/crawl?projectId=${projectId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const hasPending = crawlJobs.some(
    (j) => j.status === "pending" || j.status === "running"
  );

  // Poll while jobs are pending
  useEffect(() => {
    if (hasPending) {
      pollRef.current = setInterval(() => {
        queryClient.invalidateQueries({
          queryKey: ["crawl-jobs", projectId],
        });
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [hasPending, projectId, queryClient]);

  const crawlMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, keywords, urls }),
      });
      if (!res.ok) throw new Error("Failed to start crawl");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawl-jobs", projectId] });
    },
  });

  const addKeyword = useCallback(() => {
    const val = keywordInput.trim();
    if (val && !keywords.includes(val)) {
      setKeywords((prev) => [...prev, val]);
      setKeywordInput("");
    }
  }, [keywordInput, keywords]);

  const addUrl = useCallback(() => {
    const val = urlInput.trim();
    if (val && !urls.includes(val)) {
      setUrls((prev) => [...prev, val]);
      setUrlInput("");
    }
  }, [urlInput, urls]);

  const statusIcon = (status: CrawlJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Crawl Sources</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Define keywords and URLs to crawl for research material
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Keywords input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Tag className="h-4 w-4 text-indigo-400" />
              Keywords / Queries
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Add a keyword..."
                className="h-9 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={addKeyword}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-600/15 px-3 py-1 text-xs font-medium text-indigo-300"
                >
                  {kw}
                  <button
                    onClick={() =>
                      setKeywords((prev) => prev.filter((k) => k !== kw))
                    }
                    className="hover:text-indigo-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {keywords.length === 0 && (
                <p className="text-xs text-zinc-600">
                  No keywords added yet
                </p>
              )}
            </div>
          </div>

          {/* URLs input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Link2 className="h-4 w-4 text-purple-400" />
              Source URLs
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                placeholder="https://example.com/article"
                className="h-9 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={addUrl}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {urls.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-1.5"
                >
                  <span className="truncate text-xs text-zinc-300">{url}</span>
                  <button
                    onClick={() =>
                      setUrls((prev) => prev.filter((u) => u !== url))
                    }
                    className="ml-2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {urls.length === 0 && (
                <p className="text-xs text-zinc-600">No URLs added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Start Crawl button */}
        <button
          onClick={() => crawlMutation.mutate()}
          disabled={
            (keywords.length === 0 && urls.length === 0) ||
            crawlMutation.isPending
          }
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {crawlMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Start Crawl
        </button>

        {/* Results panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-100">
              Crawl Results
            </h2>
          </div>
          {crawlJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Globe className="h-8 w-8 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">
                No crawl jobs yet. Add keywords or URLs and start crawling.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {crawlJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {job.query || job.url || "Crawl Job"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {job.status === "completed"
                          ? `${job.resultCount ?? 0} results`
                          : job.status === "failed"
                          ? job.error ?? "Failed"
                          : job.status}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      job.status === "completed" &&
                        "bg-emerald-500/10 text-emerald-400",
                      job.status === "failed" && "bg-red-500/10 text-red-400",
                      job.status === "running" &&
                        "bg-indigo-500/10 text-indigo-400",
                      job.status === "pending" && "bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
