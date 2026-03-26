"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Send,
  Video,
  Camera,
  MessageSquare,
  Hash,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Share2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface SocialAccount {
  id: string;
  platform: string;
  name: string;
  connected: boolean;
}

const platforms = [
  { key: "youtube", label: "YouTube", icon: Video, color: "text-red-400 bg-red-500/10" },
  { key: "instagram", label: "Instagram", icon: Camera, color: "text-pink-400 bg-pink-500/10" },
  { key: "tiktok", label: "TikTok", icon: Video, color: "text-cyan-400 bg-cyan-500/10" },
  { key: "x", label: "X (Twitter)", icon: MessageSquare, color: "text-zinc-300 bg-zinc-500/10" },
  { key: "linkedin", label: "LinkedIn", icon: Briefcase, color: "text-blue-400 bg-blue-500/10" },
];

export default function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const { data: accounts = [] } = useQuery<SocialAccount[]>({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/social");
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          platforms: Array.from(enabledPlatforms),
          caption,
          hashtags: hashtags
            .split(/[,\s]+/)
            .filter(Boolean)
            .map((t) => (t.startsWith("#") ? t : `#${t}`)),
          schedule: scheduleEnabled
            ? { date: scheduleDate, time: scheduleTime }
            : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      return res.json();
    },
  });

  const togglePlatform = (key: string) => {
    setEnabledPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const connectedPlatforms = new Set(
    accounts.filter((a) => a.connected).map((a) => a.platform)
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Publish</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Distribute your content across social platforms
          </p>
        </div>

        {/* Platform toggles */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Share2 className="h-4 w-4 text-indigo-400" />
            Platforms
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const connected = connectedPlatforms.has(platform.key);
              const enabled = enabledPlatforms.has(platform.key);

              return (
                <button
                  key={platform.key}
                  onClick={() => togglePlatform(platform.key)}
                  disabled={!connected && accounts.length > 0}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all",
                    enabled
                      ? "border-indigo-500 bg-indigo-600/10"
                      : "border-zinc-800 hover:border-zinc-700",
                    !connected &&
                      accounts.length > 0 &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      platform.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {platform.label}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {connected || accounts.length === 0
                        ? enabled
                          ? "Selected"
                          : "Click to select"
                        : "Not connected"}
                    </p>
                  </div>
                  {enabled && (
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
          {accounts.length === 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              No social accounts connected yet. Connect accounts in Settings to
              see connection status.
            </p>
          )}
        </div>

        {/* Caption and hashtags */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption..."
              rows={5}
              className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
            <p className="mt-1.5 text-right text-xs text-zinc-600">
              {caption.length} characters
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Hash className="h-4 w-4 text-emerald-400" />
              Hashtags
            </label>
            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#contentcreator #ai #video"
              rows={3}
              className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Separate with spaces or commas
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Calendar className="h-4 w-4 text-amber-400" />
              Schedule
            </div>
            <button
              onClick={() => setScheduleEnabled(!scheduleEnabled)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                scheduleEnabled ? "bg-indigo-600" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  scheduleEnabled && "translate-x-5"
                )}
              />
            </button>
          </div>
          {scheduleEnabled && (
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-400">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-400">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publish button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => publishMutation.mutate()}
            disabled={
              enabledPlatforms.size === 0 || publishMutation.isPending
            }
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {publishMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {scheduleEnabled ? "Schedule Publish" : "Publish Now"}
          </button>

          {publishMutation.isSuccess && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Published successfully!
            </span>
          )}
          {publishMutation.isError && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              Failed to publish. Try again.
            </span>
          )}
        </div>
      </div>
    </AppShell>
  );
}
