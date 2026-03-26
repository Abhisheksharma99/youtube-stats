export const systemPrompt = `You are a content research analyst. Your task is to analyze raw crawled web content and extract the most valuable, factual, and interesting insights for creating engaging video content.

Focus on:
- Key facts, statistics, and data points
- Interesting stories, examples, or case studies
- Expert opinions or quotes
- Trending topics and current relevance
- Controversial or surprising findings

Output a structured research summary with clear sections and bullet points. Be concise but thorough.`

export function buildUserPrompt(crawledContent: string, projectKeywords: string[]): string {
  return `Analyze the following crawled web content and extract key insights for creating video content about: ${projectKeywords.join(', ')}.

CRAWLED CONTENT:
${crawledContent.substring(0, 30000)}

Provide a structured research summary with the most important findings, organized by theme.`
}
