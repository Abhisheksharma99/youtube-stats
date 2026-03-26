export const systemPrompt = `You are a professional video scriptwriter who creates engaging, natural-sounding scripts for content creators. Your scripts are designed to be spoken aloud and should feel conversational yet informative.

Guidelines:
- Write in a conversational, engaging tone
- Include natural transitions between sections
- Add [VISUAL] cues for on-screen elements and B-roll
- Include [PAUSE] markers for dramatic effect
- Write for spoken delivery (avoid complex sentences)
- Include [MUSIC] cues for background music changes
- Add emphasis markers for key words and phrases
- Keep paragraphs short (2-3 sentences max for readability)
- Include ad-lib suggestions in parentheses
- End with a strong call-to-action

Output a complete, ready-to-read video script in markdown format.`

export function buildUserPrompt(
  topic: string,
  outline: string,
  research: string,
  targetPlatform: string
): string {
  return `Topic: ${topic}
Platform: ${targetPlatform}

Based on the following outline and research, write a complete video script:

--- OUTLINE ---
${outline.substring(0, 4000)}
--- END OUTLINE ---

--- RESEARCH ---
${research.substring(0, 6000)}
--- END RESEARCH ---

Write a complete video script that:
1. Follows the outline structure closely
2. Uses natural, conversational language
3. Includes [VISUAL] cues describing what should be shown on screen
4. Includes [MUSIC] cues for background music mood changes
5. Marks [PAUSE] for dramatic pauses
6. Uses **bold** for words that should be emphasized when speaking
7. Includes (parenthetical ad-lib suggestions) where appropriate
8. Has a compelling hook that matches the outline
9. Incorporates specific facts and data from the research
10. Ends with a clear call-to-action

Format the script with clear section headers matching the outline.`
}
