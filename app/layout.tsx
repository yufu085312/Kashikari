import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '割り勘・貸し借り管理アプリ Kashikari',
  description: '割り勘も貸し借りも、これ1つで簡単管理。誰がいくら借りてるか、一目でわかる割り勘・貸し借り管理アプリ。',
  keywords: ['割り勘', '割り勘アプリ', '貸し借り管理', 'お金管理', '飲み会', '旅行'],
  openGraph: {
    title: '割り勘・貸し借り管理アプリ Kashikari',
    description: 'もう精算で揉めない。シンプルな割り勘アプリ',
    type: 'website',
  },
  themeColor: '#0a0f1e',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {/* 背景グラデーション */}
        <div className="fixed inset-0 bg-[#0a0f1e] -z-10" />
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-teal-950/20 -z-10" />

        <main className="min-h-dvh">
          {children}
        </main>
      </body>
    </html>
  )
}
