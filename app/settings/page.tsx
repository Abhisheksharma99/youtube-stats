'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  Settings,
  Key,
  Cpu,
  Bell,
  Palette,
  Database,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type SettingSection = 'general' | 'api-keys' | 'models' | 'notifications' | 'storage';

const sections: { id: SettingSection; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
  { id: 'models', label: 'AI Models', icon: <Cpu className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'storage', label: 'Storage', icon: <Database className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('general');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    appName: 'ContentForge',
    defaultResolution: '1280x720',
    defaultFps: '24',
    defaultModel: 'wan-2.2-14b',
    theme: 'dark',
    crawlApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    youtubeClientId: '',
    youtubeClientSecret: '',
    instagramToken: '',
    tiktokApiKey: '',
    notifyOnComplete: true,
    notifyOnFail: true,
    notifyOnPublish: true,
    storagePath: './generated',
    maxStorageGb: '50',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
            <p className="text-sm text-zinc-400 mt-1">Configure your ContentForge instance</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Nav */}
          <div className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'general' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" /> General Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">App Name</label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) => updateSetting('appName', e.target.value)}
                      className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                      className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Default Resolution</label>
                    <select
                      value={settings.defaultResolution}
                      onChange={(e) => updateSetting('defaultResolution', e.target.value)}
                      className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="480x832">480p (480x832)</option>
                      <option value="720x1280">720p (720x1280)</option>
                      <option value="1280x720">720p Landscape (1280x720)</option>
                      <option value="1080x1920">1080p Portrait (1080x1920)</option>
                      <option value="1920x1080">1080p Landscape (1920x1080)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Default FPS</label>
                    <select
                      value={settings.defaultFps}
                      onChange={(e) => updateSetting('defaultFps', e.target.value)}
                      className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="16">16 fps</option>
                      <option value="24">24 fps</option>
                      <option value="30">30 fps</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api-keys' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" /> API Keys
                </h2>
                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">API keys are stored locally and never sent to external servers. Keep them secure.</p>
                </div>
                {[
                  { key: 'anthropicApiKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
                  { key: 'openaiApiKey', label: 'OpenAI API Key', placeholder: 'sk-...' },
                  { key: 'crawlApiKey', label: 'Firecrawl API Key', placeholder: 'fc-...' },
                  { key: 'youtubeClientId', label: 'YouTube Client ID', placeholder: 'xxxx.apps.googleusercontent.com' },
                  { key: 'youtubeClientSecret', label: 'YouTube Client Secret', placeholder: 'GOCSPX-...' },
                  { key: 'instagramToken', label: 'Instagram Access Token', placeholder: 'IGQV...' },
                  { key: 'tiktokApiKey', label: 'TikTok API Key', placeholder: 'tt-...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-zinc-400 font-medium">{label}</label>
                    <div className="relative mt-1">
                      <input
                        type={showKeys[key] ? 'text' : 'password'}
                        value={(settings as Record<string, string | boolean>)[key] as string}
                        onChange={(e) => updateSetting(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(key)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showKeys[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'models' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" /> AI Model Configuration
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Default Video Model</label>
                  <select
                    value={settings.defaultModel}
                    onChange={(e) => updateSetting('defaultModel', e.target.value)}
                    className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="wan-2.2-14b">Wan 2.2 14B (Best Quality)</option>
                    <option value="wan-2.2-1.3b">Wan 2.2 1.3B (Fast, Low VRAM)</option>
                    <option value="hunyuan-1.5">HunyuanVideo 1.5 (Motion Quality)</option>
                    <option value="ltx-video-2.3">LTX-Video 2.3 (Fastest + Audio)</option>
                    <option value="framepack">FramePack (Long Videos, Low VRAM)</option>
                    <option value="cogvideox-5b">CogVideoX 5B (Accessible)</option>
                    <option value="mochi-1">Mochi 1 (Photorealistic)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { model: 'Wan 2.2 14B', vram: '24GB (FP16) / 8GB (GGUF Q4)', quality: 'Highest', speed: 'Slow' },
                    { model: 'HunyuanVideo 1.5', vram: '14GB (Offload) / 8GB (GGUF)', quality: 'High', speed: 'Medium' },
                    { model: 'LTX-Video 2.3', vram: '12GB (FP8)', quality: 'Good', speed: 'Fastest' },
                    { model: 'FramePack', vram: '6GB minimum', quality: 'High', speed: 'Medium' },
                  ].map((m) => (
                    <div key={m.model} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-1">
                      <p className="text-sm font-medium text-zinc-200">{m.model}</p>
                      <p className="text-xs text-zinc-500">VRAM: {m.vram}</p>
                      <div className="flex gap-3 text-xs">
                        <span className="text-emerald-400">Quality: {m.quality}</span>
                        <span className="text-amber-400">Speed: {m.speed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" /> Notification Preferences
                </h2>
                {[
                  { key: 'notifyOnComplete', label: 'Video generation completed', desc: 'Get notified when a video finishes generating' },
                  { key: 'notifyOnFail', label: 'Generation failed', desc: 'Get notified when a generation job fails' },
                  { key: 'notifyOnPublish', label: 'Content published', desc: 'Get notified when content is published to a platform' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-200">{label}</p>
                      <p className="text-xs text-zinc-500">{desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(key, !(settings as Record<string, string | boolean>)[key])}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        (settings as Record<string, string | boolean>)[key] ? 'bg-indigo-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          (settings as Record<string, string | boolean>)[key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'storage' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" /> Storage Configuration
                </h2>
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Generated Media Path</label>
                  <input
                    type="text"
                    value={settings.storagePath}
                    onChange={(e) => updateSetting('storagePath', e.target.value)}
                    className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Max Storage (GB)</label>
                  <input
                    type="number"
                    value={settings.maxStorageGb}
                    onChange={(e) => updateSetting('maxStorageGb', e.target.value)}
                    className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Storage Used</span>
                    <span className="text-zinc-200">12.4 GB / {settings.maxStorageGb} GB</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(12.4 / Number(settings.maxStorageGb)) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
