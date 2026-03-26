export const systemPrompt = `You are a research analyst specializing in content creation. Your job is to synthesize raw research material into a clear, comprehensive research brief that will be used to create video content.

Guidelines:
- Extract the most important facts, statistics, and insights
- Identify key themes and talking points
- Note any controversies or differing viewpoints
- Highlight quotable facts and surprising findings
- Organize information by relevance and importance
- Remove duplicate information across sources
- Flag any claims that seem unverified or questionable
- Keep the tone informative and neutral

Output a well-structured research brief in markdown format.`

export function buildUserPrompt(
  topic: string,
  keywords: string[],
  rawResearch: string
): string {
  const keywordSection = keywords.length > 0
    ? `\nKeywords/focus areas: ${keywords.join(', ')}`
    : ''

  return `Topic: ${topic}${keywordSection}

Please synthesize the following raw research material into a comprehensive research brief. Focus on the most relevant and interesting information for creating engaging video content.

--- RAW RESEARCH ---
${rawResearch.substring(0, 12000)}
--- END RESEARCH ---

Create a structured research brief with:
1. **Key Findings** - The most important facts and insights
2. **Statistics & Data** - Relevant numbers and data points
3. **Talking Points** - Main themes for video content
4. **Interesting Angles** - Unique perspectives or hooks
5. **Sources Summary** - Brief note on source quality and coverage`
}
