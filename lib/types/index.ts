// ---------------------------------------------------------------------------
// ContentForge — shared types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Status & stage enums (as const objects for runtime + type usage)
// ---------------------------------------------------------------------------

export const ProjectStatus = {
  DRAFT: "draft",
  CRAWLING: "crawling",
  PROCESSING: "processing",
  READY: "ready",
  PUBLISHED: "published",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const CrawlStatus = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CrawlStatus = (typeof CrawlStatus)[keyof typeof CrawlStatus];

export const MediaStatus = {
  QUEUED: "queued",
  GENERATING: "generating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type MediaStatus = (typeof MediaStatus)[keyof typeof MediaStatus];

export const PublishStatus = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PUBLISHING: "publishing",
  PUBLISHED: "published",
  FAILED: "failed",
} as const;

export type PublishStatus = (typeof PublishStatus)[keyof typeof PublishStatus];

export const PipelineStage = {
  RESEARCH: "research",
  OUTLINE: "outline",
  SCRIPT: "script",
  PROMPT: "prompt",
  GENERATE: "generate",
  UPSCALE: "upscale",
} as const;

export type PipelineStage = (typeof PipelineStage)[keyof typeof PipelineStage];

// ---------------------------------------------------------------------------
// Platform type
// ---------------------------------------------------------------------------

export type PlatformType =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "facebook";

// ---------------------------------------------------------------------------
// Content piece type
// ---------------------------------------------------------------------------

export type ContentPieceType = "script" | "prompt" | "caption";

// ---------------------------------------------------------------------------
// Generated media type
// ---------------------------------------------------------------------------

export type MediaType = "video" | "image" | "thumbnail";

// ---------------------------------------------------------------------------
// Model interfaces (matching Prisma schema)
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  keywords: string[];
  targetPlatforms: PlatformType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CrawlJob {
  id: string;
  projectId: string;
  query: string;
  sourceUrl: string;
  status: CrawlStatus;
  rawContent: string;
  cleanedContent: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ContentPiece {
  id: string;
  projectId: string;
  type: ContentPieceType;
  content: string;
  version: number;
  createdAt: Date;
}

export interface GeneratedMedia {
  id: string;
  projectId: string;
  type: MediaType;
  prompt: string;
  modelUsed: string;
  filePath: string;
  thumbnailPath: string;
  duration: number | null;
  resolution: string;
  status: MediaStatus;
  progress: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface PublishJob {
  id: string;
  projectId: string;
  mediaId: string;
  platform: PlatformType;
  status: PublishStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  publishedUrl: string;
  platformPostId: string;
  caption: string;
  hashtags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface SocialAccount {
  id: string;
  platform: PlatformType;
  accountName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface PipelineRun {
  id: string;
  projectId: string;
  stage: PipelineStage;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  logs: string;
  startedAt: Date | null;
  completedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Configuration interfaces
// ---------------------------------------------------------------------------

export interface CrawlConfig {
  queries: string[];
  maxPages: number;
  sources: string[];
}

export interface VideoGenerationConfig {
  model: string;
  resolution: string;
  duration: number;
  fps: number;
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
}

export interface PublishConfig {
  platforms: PlatformType[];
  caption: string;
  hashtags: string[];
  scheduledAt?: Date;
}

export interface PipelineConfig {
  crawl: CrawlConfig;
  video: VideoGenerationConfig;
  publish: PublishConfig;
}
