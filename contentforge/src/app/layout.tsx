import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/hooks/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContentForge - AI Content Creation Platform',
  description:
    'Create, generate, and publish AI-powered video content with Groq Cloud and ComfyUI.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-zinc-950 text-zinc-50">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
