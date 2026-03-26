"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Globe,
  Cog,
  Image,
  Send,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

const tabs = [
  { label: "Overview", href: "", icon: FileText },
  { label: "Crawl", href: "/crawl", icon: Globe },
  { label: "Pipeline", href: "/pipeline", icon: Cog },
  { label: "Gallery", href: "/gallery", icon: Image },
  { label: "Publish", href: "/publish", icon: Send },
];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : !project ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-zinc-400">Project not found.</p>
          </div>
        ) : (
          <>
            {/* Project Header */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 text-sm text-zinc-400">
                  {project.description}
                </p>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-zinc-800">
              {tabs.map((tab) => {
                const fullHref = `/projects/${id}${tab.href}`;
                const isActive =
                  tab.href === ""
                    ? pathname === `/projects/${id}`
                    : pathname.startsWith(fullHref);
                const Icon = tab.icon;

                return (
                  <Link
                    key={tab.label}
                    href={fullHref}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Overview content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-base font-semibold text-zinc-100">
                  Project Details
                </h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-zinc-500">Status</dt>
                    <dd className="font-medium text-zinc-200">
                      {project.status ?? "Draft"}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-zinc-500">Created</dt>
                    <dd className="font-medium text-zinc-200">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-base font-semibold text-zinc-100">
                  Workflow
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Use the tabs above to navigate through the content creation
                  pipeline: Crawl sources, run the AI pipeline, review in the
                  gallery, then publish.
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/projects/${id}/crawl`}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    Start Crawling
                  </Link>
                  <Link
                    href={`/projects/${id}/pipeline`}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    Run Pipeline
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
