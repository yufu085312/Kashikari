import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '割り勘・貸し借り管理アプリ Kashikari',
  description: '割り勘も貸し借りも、これ1つで簡単管理。誰がいくら借りてるか、一目でわかる割り勘・貸し借り管理アプリ。',
  keywords: ['割り勘', '割り勘アプリ', '貸し借り管理', 'お金管理', '飲み会', '旅行'],
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kashikari',
  },
  openGraph: {
    title: '割り勘・貸し借り管理アプリ Kashikari',
    description: 'もう精算で揉めない。シンプルな割り勘アプリ',
    type: 'website',
  },
}

export const runtime = 'edge';

import { AlertProvider } from '@/components/providers/alert-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} bg-background text-white min-h-screen selection:bg-emerald-500/30`}>
        {/* 背景グラデーション */}
        <div className="fixed inset-0 bg-[#0a0f1e] -z-10" />
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-teal-950/20 -z-10" />

        <AlertProvider>
          <main className="w-full max-w-screen-xl mx-auto p-4 md:p-8 lg:p-10 transition-all duration-300">
            {children}
          </main>
        </AlertProvider>
        <GoogleAnalytics gaId="G-XVE93DWK4P" />
      </body>
    </html>
  )
}
