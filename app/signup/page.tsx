import Link from 'next/link'
import { signup } from '../login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-6">
      <div className="flex flex-col items-center mb-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden mb-3 shadow-emerald-500/10">
          <svg className="w-full h-full p-2.5" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="signup-logo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80"/>
                <stop offset="100%" stopColor="#16a34a"/>
              </linearGradient>
              <linearGradient id="signup-logo-wallet" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
              <filter id="signup-logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="20" stdDeviation="30" floodOpacity="0.18"/>
              </filter>
            </defs>
            <rect x="0" y="0" width="1024" height="1024" rx="220" fill="url(#signup-logo-bg)" />
            <g filter="url(#signup-logo-shadow)">
              <rect x="180" y="380" width="664" height="360" rx="80" fill="url(#signup-logo-wallet)" />
            </g>
            <rect x="600" y="420" width="240" height="260" rx="60" fill="#1d4ed8"/>
            <circle cx="720" cy="550" r="18" fill="#fde047"/>
            <text x="360" y="600" fontSize="220" fill="white" fontWeight="700" fontFamily="Arial, sans-serif">¥</text>
            <path d="M380 250 L640 250 M640 250 L600 210 M640 250 L600 290" stroke="white" strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
            <circle cx="780" cy="260" r="70" fill="white" opacity="0.95"/>
            <path d="M740 260 L770 290 L820 230" stroke="#22c55e" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-1">Kashikari</h1>
        <p className="text-gray-400 text-xs font-medium tracking-wide">スマートな割り勘、カンタンな貸し借り管理。</p>
      </div>

      <div className="w-full max-w-sm p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-up">
        <h2 className="text-lg font-bold text-white mb-6 text-center">新規アカウント作成</h2>
        
        <form action={signup} className="space-y-6" noValidate>
          {params.next && <input type="hidden" name="next" value={params.next} />}
          <Input 
            name="name" 
            type="text" 
            label="表示名 (最大20文字)" 
            placeholder="田中 太郎" 
            autoComplete="name"
            required 
            maxLength={20}
          />
          <Input 
            name="search_id" 
            type="text" 
            label="検索ID (半角英数字/最大20文字)" 
            placeholder="tanaka_123" 
            autoComplete="username"
            required 
            maxLength={20}
          />
          <Input 
            name="email" 
            type="email" 
            label="メールアドレス" 
            placeholder="you@example.com" 
            autoComplete="email"
            required 
          />
          <Input 
            name="password" 
            type="password" 
            label="パスワード (6文字以上)" 
            placeholder="••••••••" 
            autoComplete="new-password"
            required 
            minLength={6}
          />
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg">
            登録して始める
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 text-sm text-gray-400">
          <Link 
            href={`/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ''}`} 
            className="hover:text-brand-300 transition-colors"
          >
            すでにアカウントをお持ちの方はこちら
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">プライバシーポリシー</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
