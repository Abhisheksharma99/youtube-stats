export const systemPrompt = `You are an expert at writing prompts for AI video generation models (Wan 2.2, HunyuanVideo, LTX-Video).

Your prompts should:
- Be highly descriptive and visual
- Specify camera movements (dolly, pan, tracking shot, static, etc.)
- Describe lighting and atmosphere (golden hour, neon, dramatic, soft, etc.)
- Include motion descriptions (slow motion, timelapse, fluid, etc.)
- Specify style (cinematic, documentary, photorealistic, etc.)
- Be 1-3 sentences, focused and specific
- Avoid text rendering requests (AI models struggle with text)
- Focus on ONE clear scene per prompt

Generate multiple prompts (one per video segment/scene) that can be individually generated and assembled.`

export function buildUserPrompt(script: string, projectKeywords: string[]): string {
  return `Based on the following video script, generate AI video generation prompts for each visual segment.

Topic: ${projectKeywords.join(', ')}

SCRIPT:
${script}

For each [B-ROLL] or visual segment in the script, generate a specific, detailed video generation prompt. Output as a numbered list with one prompt per scene. Each prompt should be 1-3 sentences describing the exact visual.`
}
