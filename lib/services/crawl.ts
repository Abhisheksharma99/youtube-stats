/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './db'
import { getSetting } from './settings'

export async function executeCrawl(crawlJobId: string): Promise<void> {
  const job = await prisma.crawlJob.findUnique({ where: { id: crawlJobId } })
  if (!job) throw new Error(`CrawlJob ${crawlJobId} not found`)

  await prisma.crawlJob.update({
    where: { id: crawlJobId },
    data: { status: 'running' },
  })

  try {
    let rawContent = ''
    let cleanedContent = ''
    const firecrawlKey = await getSetting('firecrawlApiKey').catch(() => null)

    if (firecrawlKey) {
      // Use Firecrawl
      const FirecrawlApp = (await import('@mendable/firecrawl-js')).default
      const app = new FirecrawlApp({ apiKey: firecrawlKey })

      if (job.sourceUrl) {
        const scraper = app as unknown as { scrape: (url: string, opts: any) => Promise<any> }
        const result = await scraper.scrape(job.sourceUrl, { formats: ['markdown'] })
        if (result.success) {
          rawContent = (result.markdown as string) || ''
          cleanedContent = rawContent
        } else {
          throw new Error('Firecrawl scrape failed')
        }
      } else if (job.query) {
        // Search-based crawl
        const result = await (app as any).search(job.query, { limit: 5 })
        if (result.success && result.data) {
          rawContent = result.data.map((r: any) => `## ${r.title}\n${r.url}\n\n${r.markdown || r.description || ''}`).join('\n\n---\n\n')
          cleanedContent = rawContent
        }
      }
    } else {
      // Fallback: fetch + cheerio
      const targetUrl = job.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(job.query)}`

      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentForge/1.0)' },
      })
      const html = await response.text()

      const cheerio = await import('cheerio')
      const $ = cheerio.load(html)

      // Remove scripts, styles, nav, footer
      $('script, style, nav, footer, header, iframe, noscript').remove()

      rawContent = html.substring(0, 50000) // Cap raw content

      // Extract text content
      const title = $('title').text().trim()
      const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get().join('\n')
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 20).join('\n\n')
      const listItems = $('li').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 10).join('\n')

      cleanedContent = `# ${title}\n\n${headings}\n\n${paragraphs}\n\n${listItems}`.trim()
    }

    await prisma.crawlJob.update({
      where: { id: crawlJobId },
      data: {
        status: 'completed',
        rawContent: rawContent.substring(0, 100000),
        cleanedContent: cleanedContent.substring(0, 50000),
        metadata: JSON.stringify({
          source: firecrawlKey ? 'firecrawl' : 'cheerio',
          contentLength: cleanedContent.length,
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
