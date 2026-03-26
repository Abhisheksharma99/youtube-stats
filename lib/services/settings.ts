import { prisma } from './db'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const API_KEY_PREFIXES = ['apiKey', 'token', 'secret', 'clientSecret']

function getEncryptionKey(): Buffer {
  const key = process.env.SETTINGS_ENCRYPTION_KEY || 'contentforge-default-key-change-me!'
  return crypto.scryptSync(key, 'salt', 32)
}

function isApiKeyField(key: string): boolean {
  return API_KEY_PREFIXES.some(prefix => key.toLowerCase().includes(prefix.toLowerCase()))
}

function encrypt(text: string): string {
  if (!text) return text
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text
  const [ivHex, encrypted] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function redact(value: string): string {
  if (value.length <= 8) return '****'
  return value.substring(0, 4) + '...' + value.substring(value.length - 4)
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } })
  if (!setting?.value) return null
  return isApiKeyField(key) ? decrypt(setting.value) : setting.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  const storedValue = isApiKeyField(key) ? encrypt(value) : value
  await prisma.setting.upsert({
    where: { key },
    update: { value: storedValue },
    create: { key, value: storedValue },
  })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany()
  const result: Record<string, string> = {}
  for (const s of settings) {
    if (isApiKeyField(s.key)) {
      try {
        const decrypted = decrypt(s.value)
        result[s.key] = redact(decrypted)
      } catch {
        result[s.key] = '****'
      }
    } else {
      result[s.key] = s.value
    }
  }
  return result
}

export async function getApiKey(key: string): Promise<string> {
  const value = await getSetting(key)
  if (!value) throw new Error(`Missing API key: ${key}. Configure it in Settings.`)
  return value
}
