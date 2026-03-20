import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight">プライバシーポリシー</h1>
        
        <div className="space-y-10 text-gray-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. 個人情報の収集範囲</h2>
            <p>本サービスでは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li>メールアドレス（認証および連絡のため）</li>
              <li>表示名（アプリ内でのユーザー識別のあため）</li>
              <li>アプリ内での利用状況（機能改善のためのログデータ）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. 利用目的</h2>
            <p>収集した情報は、以下の目的で利用されます。</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li>本サービスの提供、運営、維持</li>
              <li>本サービスに関する通知やお問い合わせへの対応</li>
              <li>サービスの改善、新機能の開発</li>
              <li>不正利用の防止、安全性の確保</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. 外部サービスの利用について</h2>
            <p>本サービスでは、機能提供のために以下の外部サービスを利用しています。これらのサービスにおける情報の取り扱いは、各提供者のプライバシーポリシー等によります。</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li><strong>Supabase (Supabase Auth)</strong>: ユーザー認証、アカウント管理</li>
              <li><strong>Firebase Hosting (Google Cloud)</strong>: サービスのホスティング、インフラストラクチャ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. 情報の第三者提供</h2>
            <p>法令に基づく場合を除き、ユーザーの同意を得ることなく、収集した情報を第三者に提供することはありません。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. 情報の管理・保護</h2>
            <p>当方は、ユーザーの情報の漏洩、紛失、破壊、改ざんを防止するため、適切な安全管理措置を講じます。認証情報の管理には業界標準のセキュリティを採用した Supabase 等を利用しています。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. ポリシーの変更</h2>
            <p>本ポリシーの内容は、必要に応じて変更することがあります。重要な変更がある場合には、本サービス内において通知いたします。変更後のポリシーは、本ページに掲載した時点から有効となります。</p>
          </section>

          <div className="pt-8 border-t border-white/10 text-gray-500 text-xs text-right">
            最終更新日：2024年3月21日
          </div>
        </div>
      </div>
    </div>
  )
}
