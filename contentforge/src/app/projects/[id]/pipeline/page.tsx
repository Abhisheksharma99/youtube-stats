"use client";

import { use, useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Search,
  FileText,
  ScrollText,
  Video,
  Wand2,
  ArrowUpCircle,
  Play,
  Loader2,
  CheckCircle2,
  Circle,
  Cpu,
  Settings2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

const stages = [
  { key: "research", label: "Research", icon: Search },
  { key: "outline", label: "Outline", icon: FileText },
  { key: "script", label: "Script", icon: ScrollText },
  { key: "video_prompt", label: "Video Prompt", icon: Video },
  { key: "generate", label: "Generate", icon: Wand2 },
  { key: "upscale", label: "Upscale", icon: ArrowUpCircle },
];

const groqModels = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B IT" },
];

const resolutions = [
  { value: "480p", label: "480p (854x480)" },
  { value: "720p", label: "720p (1280x720)" },
  { value: "1080p", label: "1080p (1920x1080)" },
];

export default function PipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [model, setModel] = useState(groqModels[0].id);
  const [resolution, setResolution] = useState("720p");
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7);
  const [currentStage, setCurrentStage] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

  const comfyOnline = comfyStatus?.online ?? false;

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Subscribe to SSE stream
  useEffect(() => {
    if (!pipelineId || !isRunning) return;

    const es = new EventSource(`/api/pipeline/${pipelineId}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.stage !== undefined) {
          setCurrentStage(data.stage);
        }
        if (data.log) {
          setLogs((prev) => [...prev, data.log]);
        }
        if (data.status === "completed" || data.status === "failed") {
          setIsRunning(false);
          es.close();
        }
      } catch {
        if (event.data) {
          setLogs((prev) => [...prev, event.data]);
        }
      }
    };

    es.onerror = () => {
      setIsRunning(false);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [pipelineId, isRunning]);

  const createPipeline = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          model,
          resolution,
          steps,
          cfg,
        }),
      });
      if (!res.ok) throw new Error("Failed to create pipeline");
      return res.json();
    },
  });

  const executePipeline = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pipeline/${id}/execute`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to execute pipeline");
      return res.json();
    },
  });

  const handleRunPipeline = async () => {
    setLogs([]);
    setCurrentStage(0);
    setIsRunning(true);

    try {
      const pipeline = await createPipeline.mutateAsync();
      setPipelineId(pipeline.id);
      setLogs((prev) => [...prev, `Pipeline created: ${pipeline.id}`]);
      await executePipeline.mutateAsync(pipeline.id);
    } catch (err) {
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      ]);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Content Pipeline
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              AI-powered content generation workflow
            </p>
          </div>
          {/* ComfyUI Status */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              comfyOnline
                ? "border-emerald-800/50 bg-emerald-950/20 text-emerald-400"
                : "border-red-800/50 bg-red-950/20 text-red-400"
            )}
          >
            <Cpu className="h-4 w-4" />
            ComfyUI: {comfyOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Stage stepper */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const state =
                i < currentStage
                  ? "done"
                  : i === currentStage
                  ? "active"
                  : "pending";

              return (
                <div key={stage.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        state === "done" &&
                          "border-emerald-500 bg-emerald-500/15",
                        state === "active" &&
                          "border-indigo-500 bg-indigo-500/15 animate-pulse-glow",
                        state === "pending" && "border-zinc-700 bg-zinc-800"
                      )}
                    >
                      {state === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : state === "active" && isRunning ? (
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                      ) : (
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            state === "active"
                              ? "text-indigo-400"
                              : "text-zinc-500"
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        state === "done" && "text-emerald-400",
                        state === "active" && "text-indigo-400",
                        state === "pending" && "text-zinc-500"
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 w-12 lg:w-20",
                        i < currentStage ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Settings */}
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Settings2 className="h-4 w-4 text-indigo-400" />
                Model Selection
              </div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-3 h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                {groqModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Video className="h-4 w-4 text-purple-400" />
                Generation Settings
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Wan 2.2 via ComfyUI
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {resolutions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Steps: {steps}
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="mt-1 w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    CFG Scale: {cfg}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={cfg}
                    onChange={(e) => setCfg(Number(e.target.value))}
                    className="mt-1 w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? "Running Pipeline..." : "Run Pipeline"}
            </button>
          </div>

          {/* Live logs */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-zinc-200">
                Pipeline Logs
              </h2>
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-400">
                  <Circle className="h-2 w-2 animate-pulse fill-current" />
                  Live
                </span>
              )}
            </div>
            <div className="h-[400px] overflow-y-auto p-4 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-zinc-600">
                  Pipeline logs will appear here when you run the pipeline...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      "py-0.5",
                      log.startsWith("Error")
                        ? "text-red-400"
                        : log.startsWith("Pipeline created")
                        ? "text-emerald-400"
                        : "text-zinc-400"
                    )}
                  >
                    <span className="text-zinc-600 select-none">
                      [{String(i + 1).padStart(3, "0")}]{" "}
                    </span>
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
