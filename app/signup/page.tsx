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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-brand bg-clip-text text-transparent">
          新規アカウント作成
        </h1>
        
        <form action={signup} className="space-y-6" noValidate>
          {params.next && <input type="hidden" name="next" value={params.next} />}
          <Input 
            name="name" 
            type="text" 
            label="表示名 (最大20文字)" 
            placeholder="田中 太郎" 
            required 
            maxLength={20}
          />
          <Input 
            name="search_id" 
            type="text" 
            label="検索ID (半角英数字/最大20文字)" 
            placeholder="tanaka_123" 
            required 
            maxLength={20}
          />
          <Input 
            name="email" 
            type="email" 
            label="メールアドレス" 
            placeholder="you@example.com" 
            required 
          />
          <Input 
            name="password" 
            type="password" 
            label="パスワード (6文字以上)" 
            placeholder="••••••••" 
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
        </div>
      </div>
    </div>
  )
}
