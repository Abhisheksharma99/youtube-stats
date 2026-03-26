// ── Status Enums ──

export const ProjectStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const CrawlStatus = {
  PENDING: 'pending',
  CRAWLING: 'crawling',
  CLEANING: 'cleaning',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const
export type CrawlStatus = (typeof CrawlStatus)[keyof typeof CrawlStatus]

export const MediaStatus = {
  QUEUED: 'queued',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const
export type MediaStatus = (typeof MediaStatus)[keyof typeof MediaStatus]

export const PublishStatus = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const
export type PublishStatus = (typeof PublishStatus)[keyof typeof PublishStatus]

export const PipelineStage = {
  CRAWL: 'crawl',
  CLEAN: 'clean',
  SCRIPT: 'script',
  MEDIA: 'media',
  REVIEW: 'review',
  PUBLISH: 'publish',
} as const
export type PipelineStage = (typeof PipelineStage)[keyof typeof PipelineStage]

// ── Platform Type ──

export type PlatformType = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook'

// ── Model Types ──

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  keywords: string
  targetPlatforms: string
  createdAt: Date
  updatedAt: Date
  crawlJobs?: CrawlJob[]
  contentPieces?: ContentPiece[]
  generatedMedia?: GeneratedMedia[]
  publishJobs?: PublishJob[]
  pipelineRuns?: PipelineRun[]
}

export interface CrawlJob {
  id: string
  projectId: string
  query: string
  sourceUrl: string
  status: CrawlStatus
  rawContent: string
  cleanedContent: string
  metadata: string
  createdAt: Date
  project?: Project
}

export interface ContentPiece {
  id: string
  projectId: string
  type: string
  content: string
  version: number
  createdAt: Date
  project?: Project
}

export interface GeneratedMedia {
  id: string
  projectId: string
  type: string
  prompt: string
  modelUsed: string
  filePath: string
  thumbnailPath: string
  duration: number | null
  resolution: string
  status: MediaStatus
  progress: number
  metadata: string
  createdAt: Date
  project?: Project
  publishJobs?: PublishJob[]
}

export interface PublishJob {
  id: string
  projectId: string
  mediaId: string
  platform: PlatformType
  status: PublishStatus
  scheduledAt: Date | null
  publishedAt: Date | null
  publishedUrl: string
  platformPostId: string
  caption: string
  hashtags: string
  metadata: string
  createdAt: Date
  project?: Project
  media?: GeneratedMedia
}

export interface SocialAccount {
  id: string
  platform: PlatformType
  accountName: string
  accessToken: string
  refreshToken: string
  expiresAt: Date | null
  metadata: string
  createdAt: Date
}

export interface PipelineRun {
  id: string
  projectId: string
  stage: PipelineStage
  status: string
  input: string
  output: string
  logs: string
  startedAt: Date | null
  completedAt: Date | null
  project?: Project
}

export interface Setting {
  id: string
  key: string
  value: string
}

// ── Config Interfaces ──

export interface CrawlConfig {
  query: string
  maxResults: number
  sourceUrls: string[]
  includeImages: boolean
  language: string
}

export interface VideoGenerationConfig {
  prompt: string
  duration: number
  resolution: string
  model: string
  style: string
  comfyui?: ComfyUIConfig
}

export interface PublishConfig {
  platform: PlatformType
  caption: string
  hashtags: string[]
  scheduledAt?: Date
  visibility: 'public' | 'private' | 'unlisted'
}

export interface PipelineConfig {
  stages: PipelineStage[]
  autoAdvance: boolean
  crawl?: CrawlConfig
  video?: VideoGenerationConfig
  publish?: PublishConfig
}

export interface ComfyUIConfig {
  host: string
  port: number
  workflow: string
}

export interface GroqConfig {
  model: string
  maxTokens: number
  temperature: number
}

// ── SSE Pipeline Event ──

export interface PipelineEvent {
  type: 'stage_start' | 'stage_complete' | 'progress' | 'error' | 'done'
  stage?: PipelineStage
  progress?: number
  message: string
  data?: unknown
  timestamp: number
}
