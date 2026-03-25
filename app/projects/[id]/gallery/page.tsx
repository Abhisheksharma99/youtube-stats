'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  Image,
  Video,
  Download,
  Trash2,
  Share2,
  Filter,
  CheckSquare,
  Square,
  Play,
  Clock,
  Monitor,
  Cpu,
  X,
  Eye,
} from 'lucide-react';

type MediaItem = {
  id: string;
  type: 'video' | 'image' | 'thumbnail';
  prompt: string;
  modelUsed: string;
  duration: number;
  resolution: string;
  status: 'completed' | 'generating' | 'queued' | 'failed';
  progress: number;
  createdAt: string;
  thumbnailUrl?: string;
};

const mockMedia: MediaItem[] = [
  {
    id: '1',
    type: 'video',
    prompt: 'A cinematic drone shot over neon-lit Tokyo streets at night, rain reflecting city lights',
    modelUsed: 'Wan 2.2 14B',
    duration: 5,
    resolution: '1280x720',
    status: 'completed',
    progress: 100,
    createdAt: '2026-03-25T10:00:00Z',
  },
  {
    id: '2',
    type: 'video',
    prompt: 'Close-up of hands typing on a mechanical keyboard with RGB lighting, shallow depth of field',
    modelUsed: 'HunyuanVideo 1.5',
    duration: 4,
    resolution: '1920x1080',
    status: 'completed',
    progress: 100,
    createdAt: '2026-03-25T09:30:00Z',
  },
  {
    id: '3',
    type: 'video',
    prompt: 'A robot assembling a circuit board in a futuristic factory, timelapse style',
    modelUsed: 'LTX-Video 2.3',
    duration: 8,
    resolution: '1280x720',
    status: 'generating',
    progress: 67,
    createdAt: '2026-03-25T11:00:00Z',
  },
  {
    id: '4',
    type: 'image',
    prompt: 'YouTube thumbnail: Bold text "AI VIDEO REVOLUTION" with futuristic background',
    modelUsed: 'FLUX.2 dev',
    duration: 0,
    resolution: '1280x720',
    status: 'completed',
    progress: 100,
    createdAt: '2026-03-24T14:00:00Z',
  },
  {
    id: '5',
    type: 'video',
    prompt: 'Smooth camera pan through a digital neural network visualization, abstract particles',
    modelUsed: 'FramePack',
    duration: 12,
    resolution: '1280x720',
    status: 'queued',
    progress: 0,
    createdAt: '2026-03-25T11:30:00Z',
  },
  {
    id: '6',
    type: 'video',
    prompt: 'Person walking through a field of sunflowers at golden hour, cinematic slow motion',
    modelUsed: 'Wan 2.2 14B',
    duration: 5,
    resolution: '1920x1080',
    status: 'failed',
    progress: 45,
    createdAt: '2026-03-24T16:00:00Z',
  },
];

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  generating: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  queued: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function GalleryPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [selectMode, setSelectMode] = useState(false);

  const filtered = mockMedia.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Media Gallery</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {mockMedia.length} items — {mockMedia.filter((m) => m.status === 'completed').length} ready
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectMode(!selectMode)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {selectMode ? 'Done' : 'Select'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {(['all', 'video', 'image'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type === 'video' ? 'Videos' : 'Images'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {['all', 'completed', 'generating', 'queued', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <Filter className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Bulk Actions */}
        {selectMode && selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-indigo-950/50 border border-indigo-800 rounded-lg">
            <button onClick={selectAll} className="text-sm text-indigo-400 hover:text-indigo-300">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-zinc-400">{selected.size} selected</span>
            <div className="flex-1" />
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-500">
              <Share2 className="w-3.5 h-3.5" /> Publish Selected
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 text-zinc-200 rounded-md text-sm hover:bg-zinc-600">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 text-red-400 rounded-md text-sm hover:bg-red-900/80">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-zinc-800 cursor-pointer"
                onClick={() => (selectMode ? toggleSelect(item.id) : setPreviewItem(item))}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.type === 'video' ? (
                    <Video className="w-10 h-10 text-zinc-600" />
                  ) : (
                    <Image className="w-10 h-10 text-zinc-600" />
                  )}
                </div>
                {item.status === 'completed' && item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                )}
                {item.status === 'generating' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {selectMode && (
                  <div className="absolute top-2 left-2">
                    {selected.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                {item.type === 'video' && item.duration > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-200">
                    {item.duration}s
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-sm text-zinc-200 line-clamp-2">{item.prompt}</p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {item.modelUsed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    {item.resolution}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Image className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">No media found</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Run the pipeline to generate videos and images
            </p>
          </div>
        )}

        {/* Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h3 className="font-medium text-zinc-100">Media Preview</h3>
                <button onClick={() => setPreviewItem(null)} className="text-zinc-400 hover:text-zinc-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                {previewItem.type === 'video' ? (
                  <div className="text-center">
                    <Play className="w-16 h-16 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Video preview placeholder</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Eye className="w-16 h-16 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Image preview placeholder</p>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-zinc-200">{previewItem.prompt}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 text-xs">Model</span>
                    <p className="text-zinc-200">{previewItem.modelUsed}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 text-xs">Resolution</span>
                    <p className="text-zinc-200">{previewItem.resolution}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 text-xs">Duration</span>
                    <p className="text-zinc-200">{previewItem.duration}s</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-2">
                    <span className="text-zinc-500 text-xs">Status</span>
                    <p className="text-zinc-200">{previewItem.status}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500">
                    <Share2 className="w-4 h-4" /> Publish
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-700 text-zinc-200 rounded-lg text-sm hover:bg-zinc-600">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
