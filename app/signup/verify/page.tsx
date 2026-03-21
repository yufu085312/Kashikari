'use client'

import { use, useState, useTransition } from 'react'
import { verifySignupOtp } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; error?: string }>
}) {
  const params = use(searchParams)
  const email = params.email || ''
  const next = params.next || '/'
  const serverError = params.error

  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (token.length !== 6) {
      setError('6桁のコードを入力してください')
      return
    }
    setError('')
    const formData = new FormData()
    formData.append('email', email)
    formData.append('token', token)
    formData.append('next', next)
    
    startTransition(() => {
      verifySignupOtp(formData)
    })
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fade-in text-white">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center shadow-emerald-500/10 border-emerald-500/20">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 21a11.955 11.955 0 01-9.618-7.016m19.236 0h-19.236" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black tracking-tight mb-4 text-white">確認コードを入力</h1>
        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
          <span className="text-emerald-400 font-bold">{email}</span> 宛てに届いた<br />6桁のコードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="text"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full h-20 text-center text-5xl font-mono tracking-[0.3em] bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-white/10 text-white"
              autoFocus
              required
              autoComplete="one-time-code"
            />
          </div>

          {(error || serverError) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in">
              {error || serverError}
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={isPending || token.length !== 6}>
            {isPending ? '認証中...' : '認証する'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-500 mb-2">
            メールが届かない場合は、迷惑メールフォルダを確認してください。
          </p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            ページを再読み込みする
          </button>
        </div>
      </div>
    </div>
  )
}
