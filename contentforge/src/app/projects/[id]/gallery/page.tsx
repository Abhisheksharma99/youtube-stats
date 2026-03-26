"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Image,
  Video,
  Filter,
  CheckSquare,
  Square,
  Send,
  Play,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface MediaItem {
  id: string;
  type: "video" | "image";
  filename: string;
  status: "completed" | "processing" | "failed";
  duration?: number;
  resolution?: string;
  createdAt?: string;
  thumbnailUrl?: string;
}

export default function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["media", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/media?projectId=${projectId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filtered = media.filter(
    (m) => filter === "all" || m.type === filter
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.id)));
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Gallery</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Browse and manage generated media
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectionMode && selected.size > 0 && (
              <a
                href={`/projects/${projectId}/publish?ids=${Array.from(selected).join(",")}`}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                <Send className="h-4 w-4" />
                Publish Selected ({selected.size})
              </a>
            )}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelected(new Set());
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                selectionMode
                  ? "border-indigo-500 bg-indigo-600/15 text-indigo-400"
                  : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              Select
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          {(["all", "video", "image"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {selectionMode && (
            <button
              onClick={selectAll}
              className="ml-auto text-xs text-indigo-400 hover:text-indigo-300"
            >
              {selected.size === filtered.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video animate-shimmer rounded-xl border border-zinc-800"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16">
            <Image className="h-10 w-10 text-zinc-600" />
            <p className="mt-4 text-sm text-zinc-400">
              No media generated yet. Run the pipeline to create content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-zinc-900 transition-all",
                  selected.has(item.id)
                    ? "border-indigo-500 ring-1 ring-indigo-500/50"
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                {/* Thumbnail / Player */}
                <div className="relative aspect-video bg-zinc-800">
                  {playingId === item.id && item.type === "video" ? (
                    <div className="relative h-full w-full">
                      <video
                        src={`/api/media/file/${item.id}`}
                        className="h-full w-full object-cover"
                        controls
                        autoPlay
                      />
                      <button
                        onClick={() => setPlayingId(null)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {item.type === "video" ? (
                            <Video className="h-8 w-8 text-zinc-600" />
                          ) : (
                            <Image className="h-8 w-8 text-zinc-600" />
                          )}
                        </div>
                      )}
                      {/* Play button overlay for videos */}
                      {item.type === "video" &&
                        item.status === "completed" && (
                          <button
                            onClick={() => setPlayingId(item.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                              <Play className="h-5 w-5 text-white" />
                            </div>
                          </button>
                        )}
                      {/* Processing overlay */}
                      {item.status === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Selection checkbox */}
                  {selectionMode && (
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="absolute left-2 top-2 z-10"
                    >
                      {selected.has(item.id) ? (
                        <CheckSquare className="h-5 w-5 text-indigo-400" />
                      ) : (
                        <Square className="h-5 w-5 text-zinc-400" />
                      )}
                    </button>
                  )}

                  {/* Type badge */}
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-300">
                    {item.type}
                  </span>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <p className="truncate text-xs font-medium text-zinc-300">
                    {item.filename}
                  </p>
                  <a
                    href={`/api/media/file/${item.id}`}
                    download
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </AppShell>
  );
}
