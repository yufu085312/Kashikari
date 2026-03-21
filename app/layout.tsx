import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { METADATA } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: METADATA.TITLE,
  description: METADATA.DESCRIPTION,
  keywords: [...METADATA.KEYWORDS],
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: METADATA.SHORT_NAME,
  },
  openGraph: {
    title: METADATA.TITLE,
    description: METADATA.DESCRIPTION,
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const runtime = "edge";

import { AlertProvider } from "@/components/providers/alert-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head></head>
      <body
        className={`${inter.className} bg-background text-white min-h-screen selection:bg-emerald-500/30`}
      >
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
  );
}
