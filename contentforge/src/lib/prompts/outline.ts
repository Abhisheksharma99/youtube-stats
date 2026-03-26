export const systemPrompt = `You are a video content strategist who creates compelling video outlines. You specialize in structuring content for maximum engagement and retention.

Guidelines:
- Create a clear narrative arc (hook, build, climax, resolution)
- Front-load the most engaging content
- Include specific timing suggestions for each section
- Plan for visual elements and transitions
- Consider the target platform's best practices
- Include suggestions for thumbnails and titles
- Keep sections concise and punchable
- Plan natural break points for editing

Output a detailed video outline in markdown format.`

export function buildUserPrompt(
  topic: string,
  research: string,
  targetPlatform: string
): string {
  const platformGuidance: Record<string, string> = {
    youtube: 'YouTube (8-15 minutes ideal, strong hook in first 30 seconds, end screen CTA)',
    tiktok: 'TikTok (60-180 seconds, immediate hook, fast-paced, trend-aware)',
    instagram: 'Instagram Reels (30-90 seconds, visually striking, caption-friendly)',
    twitter: 'Twitter/X (under 2:20, punchy, shareable, conversation-starting)',
    facebook: 'Facebook (3-5 minutes, emotional hook, shareable moments)',
  }

  const platform = platformGuidance[targetPlatform] || platformGuidance.youtube

  return `Topic: ${topic}
Target Platform: ${platform}

Based on the following research, create a detailed video outline:

--- RESEARCH BRIEF ---
${research.substring(0, 8000)}
--- END RESEARCH ---

Create an outline with:
1. **Title Options** - 3 compelling title ideas (with click-worthy hooks)
2. **Hook** (0:00-0:30) - Opening that grabs attention immediately
3. **Introduction** - Brief context setting
4. **Main Sections** - 3-5 key segments with:
   - Section title
   - Key points to cover
   - Suggested visuals/B-roll
   - Estimated duration
5. **Climax/Key Revelation** - The most impactful moment
6. **Conclusion & CTA** - Wrap-up and call to action
7. **Thumbnail Concepts** - 2-3 thumbnail ideas
8. **SEO Tags** - 10-15 relevant tags/keywords`
}
