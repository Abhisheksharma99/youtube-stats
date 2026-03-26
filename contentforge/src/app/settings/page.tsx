"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Key,
  Cpu,
  Brain,
  Bell,
  HardDrive,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

interface AppSettings {
  general: {
    projectName: string;
    defaultLanguage: string;
  };
  apiKeys: {
    groqApiKey: string;
    firecrawlApiKey: string;
    youtubeClientId: string;
    youtubeClientSecret: string;
  };
  comfyui: {
    host: string;
    port: number;
  };
  aiModels: {
    defaultModel: string;
  };
  notifications: {
    emailEnabled: boolean;
    pipelineAlerts: boolean;
  };
  storage: {
    mediaPath: string;
    maxStorageGb: number;
  };
}

const defaultSettings: AppSettings = {
  general: {
    projectName: "ContentForge",
    defaultLanguage: "en",
  },
  apiKeys: {
    groqApiKey: "",
    firecrawlApiKey: "",
    youtubeClientId: "",
    youtubeClientSecret: "",
  },
  comfyui: {
    host: "127.0.0.1",
    port: 8188,
  },
  aiModels: {
    defaultModel: "llama-3.3-70b-versatile",
  },
  notifications: {
    emailEnabled: false,
    pipelineAlerts: true,
  },
  storage: {
    mediaPath: "./media",
    maxStorageGb: 50,
  },
};

const groqModels = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B 32K" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B IT" },
];

const sections = [
  { key: "general", label: "General", icon: Settings },
  { key: "apiKeys", label: "API Keys", icon: Key },
  { key: "comfyui", label: "ComfyUI", icon: Cpu },
  { key: "aiModels", label: "AI Models", icon: Brain },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "storage", label: "Storage", icon: HardDrive },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [comfyTestResult, setComfyTestResult] = useState<
    "idle" | "testing" | "success" | "failed"
  >("idle");
  const [portError, setPortError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const { data: loadedSettings } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return defaultSettings;
      return res.json();
    },
  });

  useEffect(() => {
    if (loadedSettings) {
      setSettings({
        ...defaultSettings,
        ...loadedSettings,
        apiKeys: { ...defaultSettings.apiKeys, ...loadedSettings.apiKeys },
        comfyui: { ...defaultSettings.comfyui, ...loadedSettings.comfyui },
        aiModels: { ...defaultSettings.aiModels, ...loadedSettings.aiModels },
        general: { ...defaultSettings.general, ...loadedSettings.general },
        notifications: {
          ...defaultSettings.notifications,
          ...loadedSettings.notifications,
        },
        storage: { ...defaultSettings.storage, ...loadedSettings.storage },
      });
    }
  }, [loadedSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    },
  });

  const testComfyUI = async () => {
    setComfyTestResult("testing");
    try {
      const res = await fetch("/api/comfyui/status");
      if (res.ok) {
        const data = await res.json();
        setComfyTestResult(data.online ? "success" : "failed");
      } else {
        setComfyTestResult("failed");
      }
    } catch {
      setComfyTestResult("failed");
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNested = <K extends keyof AppSettings>(
    section: K,
    key: string,
    value: unknown
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Configure your ContentForge instance
          </p>
        </div>

        <div className="flex gap-6">
          {/* Section nav */}
          <div className="w-48 shrink-0 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeSection === section.key
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {/* General */}
            {activeSection === "general" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">General</h2>
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.projectName}
                    onChange={(e) =>
                      updateNested("general", "projectName", e.target.value)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Default Language
                  </label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={(e) =>
                      updateNested("general", "defaultLanguage", e.target.value)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeSection === "apiKeys" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">
                  API Keys
                </h2>
                <p className="text-sm text-zinc-500">
                  Configure API keys for external services. Keys are stored
                  securely.
                </p>
                {[
                  {
                    key: "groqApiKey",
                    label: "Groq API Key",
                    placeholder: "gsk_...",
                  },
                  {
                    key: "firecrawlApiKey",
                    label: "Firecrawl API Key",
                    placeholder: "fc-...",
                  },
                  {
                    key: "youtubeClientId",
                    label: "YouTube Client ID",
                    placeholder: "xxxx.apps.googleusercontent.com",
                  },
                  {
                    key: "youtubeClientSecret",
                    label: "YouTube Client Secret",
                    placeholder: "GOCSPX-...",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-zinc-300">
                      {field.label}
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showKeys[field.key] ? "text" : "password"}
                        value={
                          settings.apiKeys[
                            field.key as keyof AppSettings["apiKeys"]
                          ]
                        }
                        onChange={(e) =>
                          updateNested("apiKeys", field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showKeys[field.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ComfyUI */}
            {activeSection === "comfyui" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">
                  ComfyUI Configuration
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Host
                    </label>
                    <input
                      type="text"
                      value={settings.comfyui.host}
                      onChange={(e) =>
                        updateNested("comfyui", "host", e.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Port
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={65535}
                      value={settings.comfyui.port}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          updateNested("comfyui", "port", 0);
                          setPortError("Port is required");
                          return;
                        }
                        const num = Number(val);
                        if (!Number.isInteger(num) || num < 1 || num > 65535) {
                          setPortError("Port must be between 1 and 65535");
                        } else {
                          setPortError("");
                        }
                        updateNested("comfyui", "port", num);
                      }}
                      className={cn(
                        "mt-1.5 h-10 w-full rounded-lg border bg-zinc-800 px-3 text-sm text-zinc-200 focus:outline-none",
                        portError
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-700 focus:border-indigo-500"
                      )}
                    />
                    {portError && (
                      <p className="mt-1 text-xs text-red-400">{portError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={testComfyUI}
                    disabled={comfyTestResult === "testing"}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    {comfyTestResult === "testing" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Test Connection
                  </button>
                  {comfyTestResult === "success" && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </span>
                  )}
                  {comfyTestResult === "failed" && (
                    <span className="flex items-center gap-1.5 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Connection failed
                    </span>
                  )}
                </div>
                <Link
                  href="/settings/comfyui"
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View full setup guide
                </Link>
              </div>
            )}

            {/* AI Models */}
            {activeSection === "aiModels" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">
                  AI Models
                </h2>
                <p className="text-sm text-zinc-500">
                  Select the default Groq model for content generation.
                </p>
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Default Model
                  </label>
                  <select
                    value={settings.aiModels.defaultModel}
                    onChange={(e) =>
                      updateNested("aiModels", "defaultModel", e.target.value)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {groqModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <h3 className="text-sm font-medium text-zinc-200">
                    Model Details
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    All models are accessed through the Groq Cloud API (free
                    tier). Models are optimized for different tasks - larger
                    models produce higher quality output but may have slower
                    response times.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Notifications
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: "emailEnabled",
                      label: "Email Notifications",
                      desc: "Receive email updates about your projects",
                    },
                    {
                      key: "pipelineAlerts",
                      label: "Pipeline Alerts",
                      desc: "Get notified when pipelines complete or fail",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {item.label}
                        </p>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          updateNested(
                            "notifications",
                            item.key,
                            !settings.notifications[
                              item.key as keyof AppSettings["notifications"]
                            ]
                          )
                        }
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          settings.notifications[
                            item.key as keyof AppSettings["notifications"]
                          ]
                            ? "bg-indigo-600"
                            : "bg-zinc-700"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            settings.notifications[
                              item.key as keyof AppSettings["notifications"]
                            ] && "translate-x-5"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storage */}
            {activeSection === "storage" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-zinc-100">Storage</h2>
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Media Storage Path
                  </label>
                  <input
                    type="text"
                    value={settings.storage.mediaPath}
                    onChange={(e) =>
                      updateNested("storage", "mediaPath", e.target.value)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Max Storage (GB)
                  </label>
                  <input
                    type="number"
                    value={settings.storage.maxStorageGb}
                    onChange={(e) =>
                      updateNested(
                        "storage",
                        "maxStorageGb",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 flex items-center gap-3 border-t border-zinc-800 pt-5">
              <button
                onClick={() => {
                  if (activeSection === "apiKeys") {
                    setShowConfirmDialog(true);
                  } else {
                    saveMutation.mutate();
                  }
                }}
                disabled={saveMutation.isPending || !!portError}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </button>
              {saveMutation.isSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
              {saveMutation.isError && (
                <span className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Failed to save
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation dialog for API keys */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-100">
              Confirm Save
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Are you sure you want to update your API keys? This will overwrite
              existing keys.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  saveMutation.mutate();
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-emerald-800/50 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-400 shadow-lg backdrop-blur-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved successfully
        </div>
      )}
    </AppShell>
  );
}
