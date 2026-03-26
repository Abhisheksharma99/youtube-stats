import { prisma } from './db'
import { eventBus, type PipelineEvent } from './event-bus'
import { callClaude } from './llm'
import { generateVideo } from './video-gen'
import * as researchPrompt from '@/lib/prompts/research'
import * as outlinePrompt from '@/lib/prompts/outline'
import * as scriptPrompt from '@/lib/prompts/script'
import * as videoPromptGen from '@/lib/prompts/video-prompt'

const STAGES = ['research', 'outline', 'script', 'prompt', 'generate', 'upscale'] as const
type Stage = typeof STAGES[number]

function emit(runId: string, event: Omit<PipelineEvent, 'timestamp'>) {
  eventBus.emit(runId, { ...event, timestamp: new Date().toISOString() })
}

async function getProjectKeywords(projectId: string): Promise<string[]> {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return []
  try { return JSON.parse(project.keywords) } catch { return [] }
}

async function getLatestContentPiece(projectId: string, type: string): Promise<string> {
  const piece = await prisma.contentPiece.findFirst({
    where: { projectId, type },
    orderBy: { createdAt: 'desc' },
  })
  return piece?.content || ''
}

async function executeResearch(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'research', message: 'Gathering crawled content...' })

  const crawlJobs = await prisma.crawlJob.findMany({
    where: { projectId, status: 'completed' },
  })

  if (crawlJobs.length === 0) {
    emit(runId, { type: 'log', stage: 'research', message: 'No crawled content found. Using project keywords for research.' })
  }

  const combinedContent = crawlJobs
    .map(j => j.cleanedContent)
    .filter(Boolean)
    .join('\n\n---\n\n')

  const keywords = await getProjectKeywords(projectId)
  const userPrompt = researchPrompt.buildUserPrompt(
    combinedContent || `Research topic: ${keywords.join(', ')}`,
    keywords
  )

  emit(runId, { type: 'log', stage: 'research', message: 'Analyzing content with Claude...' })
  const result = await callClaude(researchPrompt.systemPrompt, userPrompt)

  await prisma.contentPiece.create({
    data: { projectId, type: 'research', content: result },
  })

  emit(runId, { type: 'log', stage: 'research', message: `Research complete (${result.length} chars)` })
  return result
}

async function executeOutline(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'outline', message: 'Reading research findings...' })

  const research = await getLatestContentPiece(projectId, 'research')
  const keywords = await getProjectKeywords(projectId)
  const userPrompt = outlinePrompt.buildUserPrompt(research, keywords)

  emit(runId, { type: 'log', stage: 'outline', message: 'Generating video outline...' })
  const result = await callClaude(outlinePrompt.systemPrompt, userPrompt)

  await prisma.contentPiece.create({
    data: { projectId, type: 'outline', content: result },
  })

  emit(runId, { type: 'log', stage: 'outline', message: `Outline complete (${result.length} chars)` })
  return result
}

async function executeScript(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'script', message: 'Reading outline...' })

  const outline = await getLatestContentPiece(projectId, 'outline')
  const userPrompt = scriptPrompt.buildUserPrompt(outline)

  emit(runId, { type: 'log', stage: 'script', message: 'Writing video script...' })
  const result = await callClaude(scriptPrompt.systemPrompt, userPrompt, { maxTokens: 8192 })

  await prisma.contentPiece.create({
    data: { projectId, type: 'script', content: result },
  })

  emit(runId, { type: 'log', stage: 'script', message: `Script complete (${result.length} chars)` })
  return result
}

async function executeVideoPrompt(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'prompt', message: 'Reading script...' })

  const script = await getLatestContentPiece(projectId, 'script')
  const keywords = await getProjectKeywords(projectId)
  const userPrompt = videoPromptGen.buildUserPrompt(script, keywords)

  emit(runId, { type: 'log', stage: 'prompt', message: 'Generating video prompts...' })
  const result = await callClaude(videoPromptGen.systemPrompt, userPrompt)

  await prisma.contentPiece.create({
    data: { projectId, type: 'prompt', content: result },
  })

  emit(runId, { type: 'log', stage: 'prompt', message: `Video prompts generated (${result.length} chars)` })
  return result
}

async function executeGenerate(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'generate', message: 'Reading video prompts...' })

  const promptContent = await getLatestContentPiece(projectId, 'prompt')

  // Parse numbered prompts and create media records for the first one
  const prompts = promptContent
    .split(/\n\d+[\.\)]\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 20)

  const firstPrompt = prompts[0] || promptContent.substring(0, 500)

  emit(runId, { type: 'log', stage: 'generate', message: `Creating video from prompt: "${firstPrompt.substring(0, 80)}..."` })

  const media = await prisma.generatedMedia.create({
    data: {
      projectId,
      type: 'video',
      prompt: firstPrompt,
      modelUsed: 'wan-2.1-14b',
      resolution: '1280x720',
      status: 'generating',
    },
  })

  try {
    await generateVideo(media.id, runId)
    emit(runId, { type: 'log', stage: 'generate', message: 'Video generated successfully!' })
    return media.id
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Generation failed'
    emit(runId, { type: 'log', stage: 'generate', message: `Video generation failed: ${msg}. You can retry from the Gallery.` })
    return media.id // Still return the media ID so it's tracked
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function executeUpscale(runId: string, projectId: string): Promise<string> {
  emit(runId, { type: 'log', stage: 'upscale', message: 'Upscaling is not yet implemented. Skipping.' })
  return 'skipped'
}

const stageExecutors: Record<Stage, (runId: string, projectId: string) => Promise<string>> = {
  research: executeResearch,
  outline: executeOutline,
  script: executeScript,
  prompt: executeVideoPrompt,
  generate: executeGenerate,
  upscale: executeUpscale,
}

export async function executePipeline(pipelineRunId: string): Promise<void> {
  const run = await prisma.pipelineRun.findUnique({ where: { id: pipelineRunId } })
  if (!run) throw new Error(`PipelineRun ${pipelineRunId} not found`)

  // Determine which stages to run
  const requestedStages = run.stage === 'all'
    ? STAGES.filter(s => s !== 'upscale') // Skip upscale by default
    : [run.stage as Stage]

  await prisma.pipelineRun.update({
    where: { id: pipelineRunId },
    data: { status: 'running', startedAt: new Date() },
  })

  emit(pipelineRunId, {
    type: 'stage_start',
    message: `Starting pipeline with stages: ${requestedStages.join(' → ')}`
  })

  let logs = ''

  for (const stage of requestedStages) {
    const executor = stageExecutors[stage]
    if (!executor) continue

    emit(pipelineRunId, { type: 'stage_start', stage, message: `Starting ${stage}...` })

    await prisma.pipelineRun.update({
      where: { id: pipelineRunId },
      data: { stage, status: 'running' },
    })

    try {
      const output = await executor(pipelineRunId, run.projectId)
      logs += `[${stage}] Completed successfully\n`

      emit(pipelineRunId, {
        type: 'stage_complete',
        stage,
        message: `${stage} completed`,
        data: { outputLength: output.length },
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      logs += `[${stage}] Failed: ${msg}\n`

      emit(pipelineRunId, { type: 'stage_error', stage, message: `${stage} failed: ${msg}` })

      // Update run as failed and stop
      await prisma.pipelineRun.update({
        where: { id: pipelineRunId },
        data: { status: 'failed', logs, completedAt: new Date() },
      })
      return
    }
  }

  // All stages completed
  await prisma.pipelineRun.update({
    where: { id: pipelineRunId },
    data: { status: 'completed', logs, completedAt: new Date() },
  })

  // Update project status
  await prisma.project.update({
    where: { id: run.projectId },
    data: { status: 'ready' },
  })

  emit(pipelineRunId, { type: 'pipeline_complete', message: 'Pipeline completed successfully!' })
}
