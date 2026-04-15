import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AlertProvider } from "@/components/providers/alert-provider";
import { METADATA } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 意図しないズームを防ぐ
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: METADATA.TITLE,
  description: METADATA.DESCRIPTION,
  keywords: [...METADATA.KEYWORDS],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-slate-900 min-h-screen selection:bg-emerald-500/30`}
      >
        {/* 背景グラデーション (Light Theme) */}
        <div className="fixed inset-0 bg-slate-50 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-teal-50 -z-10 opacity-70" />

        <AlertProvider>
          <main className="w-full max-w-screen-xl mx-auto p-4 md:p-8 lg:p-10 transition-all duration-300">
            {children}
          </main>
        </AlertProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
