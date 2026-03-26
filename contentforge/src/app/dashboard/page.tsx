"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Video,
  Send,
  Cpu,
  Plus,
  ArrowRight,
  Zap,
  FileText,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface StatsCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  color: string;
}

function ComfyUIStatusBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        online
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-emerald-400 animate-pulse" : "bg-red-400"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export default function DashboardPage() {
  const [comfyOnline, setComfyOnline] = useState(false);

  const { data: comfyStatus } = useQuery({
    queryKey: ["comfyui-status"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/comfyui/status");
        if (!res.ok) return { online: false };
        return res.json();
      } catch {
        return { online: false };
      }
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (comfyStatus) {
      setComfyOnline(comfyStatus.online ?? false);
    }
  }, [comfyStatus]);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const projectList = Array.isArray(projects) ? projects : [];

  const stats: StatsCard[] = [
    {
      label: "Projects",
      value: projectList.length,
      icon: FolderKanban,
      color: "text-indigo-400",
    },
    {
      label: "Videos Generated",
      value: projectList.reduce(
        (acc: number, p: { videoCount?: number }) => acc + (p.videoCount ?? 0),
        0
      ),
      icon: Video,
      color: "text-purple-400",
    },
    {
      label: "Published",
      value: projectList.reduce(
        (acc: number, p: { publishedCount?: number }) =>
          acc + (p.publishedCount ?? 0),
        0
      ),
      icon: Send,
      color: "text-emerald-400",
    },
    {
      label: "ComfyUI",
      value: comfyOnline ? "Connected" : "Disconnected",
      icon: Cpu,
      color: comfyOnline ? "text-emerald-400" : "text-red-400",
    },
  ];

  const quickActions = [
    {
      label: "New Project",
      description: "Start a new content project",
      icon: Plus,
      href: "/projects?new=true",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      label: "Run Pipeline",
      description: "Generate content with AI",
      icon: Zap,
      href: "/projects",
      color: "from-purple-600 to-purple-700",
    },
    {
      label: "Setup ComfyUI",
      description: "Configure video generation",
      icon: Cpu,
      href: "/settings/comfyui",
      color: "from-emerald-600 to-emerald-700",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Overview of your content creation workflow
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="animate-fade-in rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{stat.label}</span>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-bold text-zinc-100">
                    {stat.value}
                  </span>
                  {stat.label === "ComfyUI" && (
                    <ComfyUIStatusBadge online={comfyOnline} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ComfyUI Connection Status Card */}
        <div
          className={cn(
            "rounded-xl border p-5",
            comfyOnline
              ? "border-emerald-800/50 bg-emerald-950/20"
              : "border-amber-800/50 bg-amber-950/20"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  comfyOnline ? "bg-emerald-500/15" : "bg-amber-500/15"
                )}
              >
                <Cpu
                  className={cn(
                    "h-5 w-5",
                    comfyOnline ? "text-emerald-400" : "text-amber-400"
                  )}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-100">
                  ComfyUI Connection
                </h3>
                <p className="text-xs text-zinc-400">
                  {comfyOnline
                    ? "ComfyUI is running and ready for video generation"
                    : "ComfyUI is not connected. Start it or check settings."}
                </p>
              </div>
            </div>
            <Link
              href="/settings/comfyui"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                comfyOnline
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : "bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
              )}
            >
              {comfyOnline ? "View Status" : "Setup Guide"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Projects */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-100">
                Recent Projects
              </h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {projectList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-8 w-8 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-400">
                    No projects yet. Create your first one!
                  </p>
                  <Link
                    href="/projects?new=true"
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    Create Project
                  </Link>
                </div>
              ) : (
                projectList.slice(0, 5).map(
                  (project: {
                    id: string;
                    name: string;
                    status?: string;
                    updatedAt?: string;
                  }) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                          <Wand2 className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {project.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {project.status ?? "draft"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600" />
                    </Link>
                  )
                )
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-zinc-100">
              Quick Actions
            </h2>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors group"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                      action.color
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                      {action.label}
                    </p>
                    <p className="text-xs text-zinc-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
