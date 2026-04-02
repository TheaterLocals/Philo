import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import './globals.css'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PHILO — 哲学学習RPG',
  description: 'あなたの悩みを、2500年前にすでに言語化していた人がいる。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={pressStart2P.variable} suppressHydrationWarning>
      <body className="bg-texture">{children}</body>
    </html>
  )
}
