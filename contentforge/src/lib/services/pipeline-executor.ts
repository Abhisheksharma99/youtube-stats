/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from './db'
import { eventBus, type PipelineEvent } from './event-bus'
import { callGroq } from './groq'
import { searchAndCrawl, crawlForProject } from './crawl'
import { generateVideoWithComfyUI } from './comfyui'
import { systemPrompt as researchSystemPrompt, buildUserPrompt as buildResearchPrompt } from '../prompts/research'
import { systemPrompt as outlineSystemPrompt, buildUserPrompt as buildOutlinePrompt } from '../prompts/outline'
import { systemPrompt as scriptSystemPrompt, buildUserPrompt as buildScriptPrompt } from '../prompts/script'
import { systemPrompt as videoPromptSystemPrompt, buildUserPrompt as buildVideoPromptPrompt } from '../prompts/video-prompt'

type PipelineStage = 'research' | 'outline' | 'script' | 'prompt' | 'generate' | 'upscale'

const STAGES: PipelineStage[] = ['research', 'outline', 'script', 'prompt', 'generate', 'upscale']

interface PipelineInput {
  projectId: string
  topic: string
  keywords?: string[]
  sourceUrls?: string[]
  targetPlatform?: string
  resolution?: string
  stages?: PipelineStage[]
}

function emitEvent(runId: string, event: PipelineEvent) {
  eventBus.emit(runId, event)
}

function stageStart(runId: string, stage: string, message: string) {
  emitEvent(runId, {
    type: 'stage_start',
    stage,
    progress: 0,
    message,
    timestamp: new Date().toISOString(),
  })
}

function stageComplete(runId: string, stage: string, message: string, data?: unknown) {
  emitEvent(runId, {
    type: 'stage_complete',
    stage,
    progress: 100,
    message,
    data,
    timestamp: new Date().toISOString(),
  })
}

function stageError(runId: string, stage: string, message: string) {
  emitEvent(runId, {
    type: 'stage_error',
    stage,
    message,
    timestamp: new Date().toISOString(),
  })
}

function log(runId: string, message: string) {
  emitEvent(runId, {
    type: 'log',
    message,
    timestamp: new Date().toISOString(),
  })
}

// ── Stage: Research ──

async function runResearch(
  runId: string,
  projectId: string,
  topic: string,
  keywords: string[],
  sourceUrls: string[]
): Promise<string> {
  stageStart(runId, 'research', `Starting research on: ${topic}`)

  let researchContent = ''

  // Crawl provided URLs
  if (sourceUrls.length > 0) {
    log(runId, `Crawling ${sourceUrls.length} provided URLs...`)
    const crawlResults = await crawlForProject(projectId, sourceUrls, runId)
    researchContent += crawlResults
      .map((r) => `## ${r.title}\nSource: ${r.url}\n\n${r.content}`)
      .join('\n\n---\n\n')
  }

  // Search and crawl based on topic
  if (keywords.length > 0 || topic) {
    const query = keywords.length > 0 ? `${topic} ${keywords.join(' ')}` : topic
    log(runId, `Searching for: "${query}"`)
    const searchResults = await searchAndCrawl(projectId, query, 5, runId)
    if (searchResults.length > 0) {
      researchContent +=
        '\n\n---\n\n' +
        searchResults
          .map((r) => `## ${r.title}\nSource: ${r.url}\n\n${r.content}`)
          .join('\n\n---\n\n')
    }
  }

  // Use Groq to synthesize research
  if (researchContent) {
    log(runId, 'Synthesizing research with Groq...')
    const synthesized = await callGroq(
      researchSystemPrompt,
      buildResearchPrompt(topic, keywords, researchContent),
      { maxTokens: 4096, temperature: 0.3 }
    )

    // Save research as content piece
    await prisma.contentPiece.create({
      data: {
        projectId,
        type: 'research',
        content: synthesized,
      },
    })

    stageComplete(runId, 'research', 'Research completed', {
      sourceCount: sourceUrls.length,
      contentLength: synthesized.length,
    })

    return synthesized
  }

  const fallback = `Topic: ${topic}\nKeywords: ${keywords.join(', ')}\n\nNo external sources were found. The content will be generated based on the topic and keywords provided.`

  await prisma.contentPiece.create({
    data: {
      projectId,
      type: 'research',
      content: fallback,
    },
  })

  stageComplete(runId, 'research', 'Research completed (no external sources)')
  return fallback
}

// ── Stage: Outline ──

async function runOutline(
  runId: string,
  projectId: string,
  topic: string,
  research: string,
  targetPlatform: string
): Promise<string> {
  stageStart(runId, 'outline', 'Generating content outline...')

  const outline = await callGroq(
    outlineSystemPrompt,
    buildOutlinePrompt(topic, research, targetPlatform),
    { maxTokens: 2048, temperature: 0.7 }
  )

  await prisma.contentPiece.create({
    data: {
      projectId,
      type: 'outline',
      content: outline,
    },
  })

  stageComplete(runId, 'outline', 'Outline generated')
  return outline
}

// ── Stage: Script ──

async function runScript(
  runId: string,
  projectId: string,
  topic: string,
  outline: string,
  research: string,
  targetPlatform: string
): Promise<string> {
  stageStart(runId, 'script', 'Writing video script...')

  const script = await callGroq(
    scriptSystemPrompt,
    buildScriptPrompt(topic, outline, research, targetPlatform),
    { maxTokens: 4096, temperature: 0.7 }
  )

  await prisma.contentPiece.create({
    data: {
      projectId,
      type: 'script',
      content: script,
    },
  })

  stageComplete(runId, 'script', 'Script written')
  return script
}

// ── Stage: Video Prompt ──

async function runVideoPrompt(
  runId: string,
  projectId: string,
  topic: string,
  script: string,
  resolution: string
): Promise<string> {
  stageStart(runId, 'prompt', 'Generating video prompt for ComfyUI...')

  const videoPrompt = await callGroq(
    videoPromptSystemPrompt,
    buildVideoPromptPrompt(topic, script, resolution),
    { maxTokens: 2048, temperature: 0.6 }
  )

  await prisma.contentPiece.create({
    data: {
      projectId,
      type: 'video-prompt',
      content: videoPrompt,
    },
  })

  stageComplete(runId, 'prompt', 'Video prompt generated')
  return videoPrompt
}

// ── Stage: Generate Video ──

async function runGenerate(
  runId: string,
  projectId: string,
  videoPrompt: string,
  resolution: string
): Promise<string> {
  stageStart(runId, 'generate', 'Starting video generation with ComfyUI...')

  // Create a GeneratedMedia record
  const media = await prisma.generatedMedia.create({
    data: {
      projectId,
      type: 'video',
      prompt: videoPrompt,
      modelUsed: 'wan2.1_t2v_14B',
      resolution,
      status: 'queued',
      progress: 0,
    },
  })

  await generateVideoWithComfyUI(media.id, runId)

  stageComplete(runId, 'generate', 'Video generated', { mediaId: media.id })
  return media.id
}

// ── Stage: Upscale (placeholder) ──

async function runUpscale(
  runId: string,
  projectId: string,
  mediaId: string
): Promise<string> {
  stageStart(runId, 'upscale', 'Upscaling video...')

  // Upscaling is a placeholder for future implementation
  // Could integrate with ComfyUI upscale workflows or external tools
  log(runId, 'Upscaling stage is not yet implemented. Skipping...')

  stageComplete(runId, 'upscale', 'Upscale stage skipped (not implemented)')
  return mediaId
}

// ── Main Pipeline Executor ──

export async function executePipeline(input: PipelineInput): Promise<string> {
  const {
    projectId,
    topic,
    keywords = [],
    sourceUrls = [],
    targetPlatform = 'youtube',
    resolution = '1280x720',
    stages = STAGES,
  } = input

  // Create a pipeline run record
  const pipelineRun = await prisma.pipelineRun.create({
    data: {
      projectId,
      stage: stages[0],
      status: 'running',
      input: JSON.stringify(input),
      startedAt: new Date(),
    },
  })

  const runId = pipelineRun.id

  // Update project status
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'active' },
  })

  let research = ''
  let outline = ''
  let script = ''
  let videoPrompt = ''
  let mediaId = ''

  try {
    // ── Research ──
    if (stages.includes('research')) {
      research = await runResearch(runId, projectId, topic, keywords, sourceUrls)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'research' },
      })
    }

    // ── Outline ──
    if (stages.includes('outline')) {
      outline = await runOutline(runId, projectId, topic, research, targetPlatform)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'outline' },
      })
    }

    // ── Script ──
    if (stages.includes('script')) {
      script = await runScript(runId, projectId, topic, outline, research, targetPlatform)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'script' },
      })
    }

    // ── Video Prompt ──
    if (stages.includes('prompt')) {
      videoPrompt = await runVideoPrompt(runId, projectId, topic, script, resolution)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'prompt' },
      })
    }

    // ── Generate ──
    if (stages.includes('generate')) {
      mediaId = await runGenerate(runId, projectId, videoPrompt, resolution)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'generate' },
      })
    }

    // ── Upscale ──
    if (stages.includes('upscale')) {
      mediaId = await runUpscale(runId, projectId, mediaId)
      await prisma.pipelineRun.update({
        where: { id: runId },
        data: { stage: 'upscale' },
      })
    }

    // ── Pipeline Complete ──
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify({
          research: research.substring(0, 500),
          outline: outline.substring(0, 500),
          script: script.substring(0, 500),
          videoPrompt: videoPrompt.substring(0, 500),
          mediaId,
        }),
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'completed' },
    })

    emitEvent(runId, {
      type: 'pipeline_complete',
      message: 'Pipeline completed successfully!',
      data: { mediaId },
      timestamp: new Date().toISOString(),
    })

    return runId
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        logs: message,
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'draft' },
    })

    emitEvent(runId, {
      type: 'stage_error',
      message: `Pipeline failed: ${message}`,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

export async function getPipelineStatus(runId: string) {
  const run = await prisma.pipelineRun.findUnique({
    where: { id: runId },
    include: { project: true },
  })

  if (!run) throw new Error(`Pipeline run ${runId} not found`)

  return {
    id: run.id,
    projectId: run.projectId,
    projectName: run.project.name,
    stage: run.stage,
    status: run.status,
    input: JSON.parse(run.input),
    output: run.output ? JSON.parse(run.output) : null,
    logs: run.logs,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  }
}
