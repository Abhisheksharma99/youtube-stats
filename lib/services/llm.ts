/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from './settings'

let clientInstance: Anthropic | null = null

async function getClient(): Promise<Anthropic> {
  const apiKey = await getApiKey('anthropicApiKey')
  // Recreate client if key might have changed
  clientInstance = new Anthropic({ apiKey })
  return clientInstance
}

export async function callClaude(
  systemPrompt: string,
  userContent: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  const client = await getClient()
  const maxRetries = 3

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: options?.model || 'claude-sonnet-4-20250514',
        max_tokens: options?.maxTokens || 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      })

      const textBlock = response.content.find(b => b.type === 'text')
      return textBlock?.text || ''
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries - 1) {
        // Rate limited — exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded for Claude API call')
}
