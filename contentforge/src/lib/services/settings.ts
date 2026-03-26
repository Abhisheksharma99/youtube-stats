import crypto from 'crypto'
import { prisma } from './db'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.SETTINGS_ENCRYPTION_KEY
  if (!key) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY environment variable is required. Generate one with: openssl rand -hex 32'
    )
  }
  return Buffer.from(key, 'hex')
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(':')
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted value format')
  }
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

const SENSITIVE_KEYS = [
  'groqApiKey',
  'firecrawlApiKey',
  'youtubeClientSecret',
  'youtubeRefreshToken',
  'youtubeAccessToken',
]

function isSensitive(key: string): boolean {
  return SENSITIVE_KEYS.includes(key) || key.toLowerCase().includes('secret') || key.toLowerCase().includes('apikey')
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } })
  if (!setting || !setting.value) return null

  if (isSensitive(key)) {
    try {
      return decrypt(setting.value)
    } catch {
      // Value may not be encrypted yet (legacy), return as-is
      return setting.value
    }
  }

  return setting.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  const storedValue = isSensitive(key) ? encrypt(value) : value

  await prisma.setting.upsert({
    where: { key },
    update: { value: storedValue },
    create: { key, value: storedValue },
  })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany()
  const result: Record<string, string> = {}

  for (const setting of settings) {
    if (isSensitive(setting.key) && setting.value) {
      // Redact sensitive values — show only last 4 chars
      try {
        const decrypted = decrypt(setting.value)
        result[setting.key] = decrypted.length > 4
          ? '••••••••' + decrypted.slice(-4)
          : '••••••••'
      } catch {
        result[setting.key] = '••••••••'
      }
    } else {
      result[setting.key] = setting.value
    }
  }

  return result
}

export async function getApiKey(key: string): Promise<string> {
  const value = await getSetting(key)
  if (!value) {
    throw new Error(`API key "${key}" is not configured. Please set it in Settings.`)
  }
  return value
}
