import React from 'react'
import { Button } from '@/components/ui/button'

export default function SignupCompletePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fade-in text-white">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center shadow-emerald-500/10">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
          <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-4">新規登録が完了しました！</h1>
        
        <p className="text-gray-400 font-medium mb-10 leading-relaxed">
          メールアドレスの確認が完了しました。<br />
          <span className="text-brand-300 font-bold">先ほど開いていたログイン画面</span>に戻って、ログインを続けてください。
        </p>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-500">
            すでにタブを閉じてしまった場合は、下のボタンからログイン画面へ移動できます。
          </p>
          <Button 
            className="w-full h-12 text-md font-bold"
            onClick={() => window.location.href = '/login'}
          >
            ログイン画面へ移動
          </Button>
        </div>
      </div>
    </div>
  )
}
