import Groq from 'groq-sdk'
import { getApiKey } from './settings'

export async function callGroq(
  systemPrompt: string,
  userContent: string,
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = await getApiKey('groqApiKey')
  const groq = new Groq({ apiKey })

  const model = options?.model || 'llama-3.3-70b-versatile' // Best free model on Groq

  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
      })
      return response.choices[0]?.message?.content || ''
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if ((error as { status?: number })?.status === 429 && attempt < 2) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 3000))
        continue
      }
      throw error
    }
  }
  throw lastError || new Error('Max retries exceeded')
}
