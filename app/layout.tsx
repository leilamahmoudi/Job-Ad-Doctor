import type { Metadata, Viewport } from 'next'
import { Lato } from 'next/font/google'
import './globals.css'

const lato = Lato({ weight: ['400', '700'], variable: '--font-lato', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Job Ad Doctor — Diagnose & rewrite your job ads',
  description:
    "Paste your job ad and get an instant diagnosis of what's weak — then a rewritten version in seconds.",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased`}>
      <body className="min-h-full bg-background">{children}</body>
    </html>
  )
}
