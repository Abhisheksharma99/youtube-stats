/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './db'
import { getSetting } from './settings'
import { eventBus } from './event-bus'

interface CrawlResult {
  url: string
  title: string
  content: string
  metadata: Record<string, unknown>
}

// ── Firecrawl (primary) ──

async function crawlWithFirecrawl(url: string): Promise<CrawlResult> {
  const apiKey = await getSetting('firecrawlApiKey')
  if (!apiKey) throw new Error('Firecrawl API key not configured')

  const { default: FirecrawlApp } = await import('@mendable/firecrawl-js')
  const firecrawl = new FirecrawlApp({ apiKey })

  const result = await (firecrawl as any).scrape(url, {
    formats: ['markdown'],
  }) as any

  if (!result.success) {
    throw new Error(`Firecrawl error: ${result.error || 'Unknown error'}`)
  }

  return {
    url,
    title: result.metadata?.title || '',
    content: result.markdown || result.content || '',
    metadata: {
      sourceLength: (result.markdown || result.content || '').length,
      description: result.metadata?.description || '',
      language: result.metadata?.language || '',
      provider: 'firecrawl',
    },
  }
}

// ── Cheerio fallback ──

async function crawlWithCheerio(url: string): Promise<CrawlResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ContentForge/1.0)',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const html = await response.text()
  const { load } = await import('cheerio')
  const $ = load(html)

  // Remove non-content elements
  $('script, style, nav, footer, header, aside, .ad, .sidebar, .menu, .nav').remove()

  const title = $('title').text().trim() || $('h1').first().text().trim() || ''

  // Extract main content
  const selectors = ['article', 'main', '[role="main"]', '.post-content', '.entry-content', '.content']
  let content = ''

  for (const selector of selectors) {
    const el = $(selector)
    if (el.length > 0) {
      content = el.text().trim()
      break
    }
  }

  if (!content) {
    content = $('body').text().trim()
  }

  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

  return {
    url,
    title,
    content,
    metadata: {
      sourceLength: content.length,
      provider: 'cheerio',
    },
  }
}

// ── Public API ──

export async function crawlUrl(url: string): Promise<CrawlResult> {
  // Try Firecrawl first, fall back to cheerio
  try {
    return await crawlWithFirecrawl(url)
  } catch (firecrawlError: any) {
    console.warn(`Firecrawl failed for ${url}, falling back to cheerio:`, firecrawlError.message)
    try {
      return await crawlWithCheerio(url)
    } catch (cheerioError: any) {
      throw new Error(
        `All crawl methods failed for ${url}. ` +
        `Firecrawl: ${firecrawlError.message}. ` +
        `Cheerio: ${cheerioError.message}`
      )
    }
  }
}

export async function crawlForProject(
  projectId: string,
  urls: string[],
  pipelineRunId?: string
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = []

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]

    if (pipelineRunId) {
      eventBus.emit(pipelineRunId, {
        type: 'stage_progress',
        stage: 'research',
        progress: Math.round(((i + 1) / urls.length) * 100),
        message: `Crawling ${i + 1}/${urls.length}: ${url}`,
        timestamp: new Date().toISOString(),
      })
    }

    // Create crawl job record
    const crawlJob = await prisma.crawlJob.create({
      data: {
        projectId,
        query: url,
        sourceUrl: url,
        status: 'crawling',
      },
    })

    try {
      const result = await crawlUrl(url)
      results.push(result)

      await prisma.crawlJob.update({
        where: { id: crawlJob.id },
        data: {
          status: 'completed',
          rawContent: result.content,
          cleanedContent: result.content,
          metadata: JSON.stringify(result.metadata),
        },
      })
    } catch (error: any) {
      await prisma.crawlJob.update({
        where: { id: crawlJob.id },
        data: {
          status: 'failed',
          metadata: JSON.stringify({ error: error.message }),
        },
      })
      console.error(`Failed to crawl ${url}:`, error.message)
    }
  }

  return results
}

export async function searchAndCrawl(
  projectId: string,
  query: string,
  maxResults: number = 5,
  pipelineRunId?: string
): Promise<CrawlResult[]> {
  if (pipelineRunId) {
    eventBus.emit(pipelineRunId, {
      type: 'stage_progress',
      stage: 'research',
      progress: 0,
      message: `Starting research for: "${query}"`,
      timestamp: new Date().toISOString(),
    })
  }

  // Try Firecrawl search first
  try {
    const apiKey = await getSetting('firecrawlApiKey')
    if (apiKey) {
      const { default: FirecrawlApp } = await import('@mendable/firecrawl-js')
      const firecrawl = new FirecrawlApp({ apiKey })

      const searchResult = await (firecrawl as any).search(query, {
        limit: maxResults,
      }) as any

      if (searchResult?.data && searchResult.data.length > 0) {
        const urls = searchResult.data
          .filter((r: any) => r.url)
          .map((r: any) => r.url)
          .slice(0, maxResults)

        return await crawlForProject(projectId, urls, pipelineRunId)
      }
    }
  } catch (error: any) {
    console.warn('Firecrawl search failed:', error.message)
  }

  // Fallback: no search results
  if (pipelineRunId) {
    eventBus.emit(pipelineRunId, {
      type: 'log',
      stage: 'research',
      message: 'No search API available. Provide URLs directly for crawling.',
      timestamp: new Date().toISOString(),
    })
  }

  return []
}

/**
 * Execute a single CrawlJob by ID — reads the job from DB, crawls, updates status.
 * Used by the crawl API route (fire-and-forget pattern).
 */
export async function executeCrawl(crawlJobId: string): Promise<void> {
  const job = await prisma.crawlJob.findUnique({ where: { id: crawlJobId } })
  if (!job) throw new Error(`CrawlJob ${crawlJobId} not found`)

  await prisma.crawlJob.update({ where: { id: crawlJobId }, data: { status: 'running' } })

  try {
    const url = job.sourceUrl || job.query
    const result = await crawlUrl(url)

    await prisma.crawlJob.update({
      where: { id: crawlJobId },
      data: {
        status: 'completed',
        rawContent: result.content.substring(0, 100000),
        cleanedContent: result.content.substring(0, 50000),
        metadata: JSON.stringify({
          source: 'crawl',
          contentLength: result.content.length,
          crawledAt: new Date().toISOString(),
        }),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await prisma.crawlJob.update({
      where: { id: crawlJobId },
      data: {
        status: 'failed',
        metadata: JSON.stringify({ error: message, failedAt: new Date().toISOString() }),
      },
    })
  }
}
