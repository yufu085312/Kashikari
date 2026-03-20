import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="mb-8">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight">利用規約</h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. はじめに</h2>
            <p>この利用規約（以下「本規約」）は、Kashikari（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するすべてのユーザーは、本規約に同意したものとみなされます。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. サービスの提供</h2>
            <p>本サービスは、ユーザー間の割り勘や貸し借りの記録を管理するためのツールを提供します。本サービスは、ユーザー間の金銭のやり取りを直接仲介するものではなく、あくまで記録の補助を目的としています。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. アカウント管理</h2>
            <p>ユーザーは、自身の責任においてアカウント情報（メールアドレス、パスワード）を適切に管理するものとします。アカウント情報の漏洩や第三者による不正使用等によって生じた損害について、当方は一切の責任を負いません。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. 禁止事項</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>法令または公序良俗に反する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>他のユーザーに対する嫌がらせや誹謗中傷</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. 免責事項</h2>
            <p>本サービスの利用に起因してユーザー間に生じた紛争や損害について、当方は何ら責任を負わないものとします。金銭の精算や返済に関しては、当事者間で誠実に対応してください。また、システム障害等によるデータ損失についても保証いたしません。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. 規約の変更</h2>
            <p>当方は、必要に応じて本規約を変更することがあります。変更後の規約は本ページに掲載した時点から効力を生じるものとし、ユーザーは変更後も継続して利用することで、変更に同意したものとみなされます。</p>
          </section>

          <div className="pt-8 border-t border-white/10 text-gray-500 text-xs text-right">
            制定日：2024年3月21日
          </div>
        </div>
      </div>
    </div>
  )
}
