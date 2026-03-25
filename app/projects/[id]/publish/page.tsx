'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  Video,
  Camera,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link2,
  Hash,
  Type,
  Loader2,
  Plus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

type Platform = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  accountName?: string;
};

type PublishRecord = {
  id: string;
  platform: string;
  status: 'published' | 'scheduled' | 'failed' | 'publishing';
  mediaTitle: string;
  publishedAt?: string;
  scheduledAt?: string;
  publishedUrl?: string;
};

const platforms: Platform[] = [
  { id: 'youtube', name: 'YouTube', icon: <Video className="w-5 h-5" />, color: 'text-red-500', connected: true, accountName: '@mychannel' },
  { id: 'instagram', name: 'Instagram', icon: <Camera className="w-5 h-5" />, color: 'text-pink-500', connected: true, accountName: '@myaccount' },
  { id: 'tiktok', name: 'TikTok', icon: <Video className="w-5 h-5" />, color: 'text-cyan-400', connected: false },
  { id: 'x', name: 'X / Twitter', icon: <Type className="w-5 h-5" />, color: 'text-zinc-100', connected: true, accountName: '@myhandle' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Link2 className="w-5 h-5" />, color: 'text-blue-400', connected: false },
  { id: 'facebook', name: 'Facebook', icon: <Send className="w-5 h-5" />, color: 'text-blue-500', connected: false },
];

const publishHistory: PublishRecord[] = [
  { id: '1', platform: 'YouTube', status: 'published', mediaTitle: 'AI Revolution - Episode 1', publishedAt: '2026-03-24T15:00:00Z', publishedUrl: '#' },
  { id: '2', platform: 'Instagram', status: 'published', mediaTitle: 'Quick AI Demo Reel', publishedAt: '2026-03-24T15:05:00Z', publishedUrl: '#' },
  { id: '3', platform: 'X / Twitter', status: 'scheduled', mediaTitle: 'Behind the scenes clip', scheduledAt: '2026-03-26T09:00:00Z' },
  { id: '4', platform: 'TikTok', status: 'failed', mediaTitle: 'Tutorial snippet', publishedAt: '2026-03-23T12:00:00Z' },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  published: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400' },
  scheduled: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-400' },
  failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
  publishing: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-indigo-400' },
};

export default function PublishPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['youtube']));
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const togglePlatform = (id: string) => {
    const platform = platforms.find((p) => p.id === id);
    if (!platform?.connected) return;
    const next = new Set(selectedPlatforms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlatforms(next);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setTimeout(() => setIsPublishing(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Publish</h1>
          <p className="text-sm text-zinc-400 mt-1">Distribute your content across platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Media Preview */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-300">Selected Media</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Select media from Gallery</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-zinc-300">No media selected</p>
                <p className="text-xs text-zinc-500 mt-1">Go to Gallery to select media for publishing</p>
              </div>
            </div>

            {/* Connected Accounts */}
            <h2 className="text-sm font-medium text-zinc-300 pt-4">Connected Accounts</h2>
            <div className="space-y-2">
              {platforms.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={p.color}>{p.icon}</span>
                    <div>
                      <p className="text-sm text-zinc-200">{p.name}</p>
                      {p.accountName && <p className="text-xs text-zinc-500">{p.accountName}</p>}
                    </div>
                  </div>
                  {p.connected ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center — Publishing Form */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-300">Publishing Settings</h2>

            {/* Platform Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <label className="text-xs text-zinc-400 font-medium">Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    disabled={!p.connected}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${
                      selectedPlatforms.has(p.id)
                        ? 'border-indigo-500 bg-indigo-950/50 text-zinc-100'
                        : p.connected
                        ? 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className={p.connected ? p.color : 'text-zinc-600'}>{p.icon}</span>
                    {p.name}
                    {!p.connected && <AlertCircle className="w-3 h-3 ml-auto text-zinc-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <label className="text-xs text-zinc-400 font-medium">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{caption.length} characters</span>
                <span>Recommended: 150-300</span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Hash className="w-3 h-3" /> Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#ai #video #content"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Schedule */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <label className="text-xs text-zinc-400 font-medium">Timing</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScheduleMode('now')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scheduleMode === 'now'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => setScheduleMode('schedule')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    scheduleMode === 'schedule'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </button>
              </div>
              {scheduleMode === 'schedule' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={selectedPlatforms.size === 0 || isPublishing}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing to {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? 's' : ''}...
                </>
              ) : scheduleMode === 'schedule' ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule for {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish to {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>

          {/* Right — History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">Publishing History</h2>
              <button className="text-xs text-zinc-500 hover:text-zinc-300">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {publishHistory.map((record) => {
                const cfg = statusConfig[record.status];
                return (
                  <div key={record.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">{record.platform}</span>
                      <span className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                        {cfg.icon} {record.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200">{record.mediaTitle}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {record.publishedAt
                          ? new Date(record.publishedAt).toLocaleDateString()
                          : record.scheduledAt
                          ? `Scheduled: ${new Date(record.scheduledAt).toLocaleDateString()}`
                          : ''}
                      </span>
                      {record.publishedUrl && (
                        <a href={record.publishedUrl} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
