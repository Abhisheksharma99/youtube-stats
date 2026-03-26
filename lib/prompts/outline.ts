export const systemPrompt = `You are a video content strategist and scriptwriter. Your task is to create a compelling video outline based on research findings.

Create an outline that:
- Has a strong hook in the first 5 seconds
- Follows a clear narrative arc (problem → exploration → solution/insight)
- Includes timestamps for each section
- Suggests visual descriptions for each segment
- Targets 3-5 minutes of content
- Is engaging for social media audiences

Output a numbered outline with sections, timestamps, talking points, and visual suggestions.`

export function buildUserPrompt(research: string, projectKeywords: string[]): string {
  return `Based on the following research, create a detailed video outline for a video about: ${projectKeywords.join(', ')}.

RESEARCH FINDINGS:
${research}

Create an engaging video outline with sections, timestamps, talking points, and visual descriptions for each segment.`
}
