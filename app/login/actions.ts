'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  if (!email && !password) {
    redirect(`/login?error=${encodeURIComponent('メールアドレスとパスワードを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!email) {
    redirect(`/login?error=${encodeURIComponent('メールアドレスを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!password) {
    redirect(`/login?error=${encodeURIComponent('パスワードを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  // パスワード認証
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // セキュリティのため、メッセージを統一します
    redirect(`/login?error=${encodeURIComponent('メールアドレスまたはパスワードが正しくありません')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }


  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const search_id = formData.get('search_id') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  if (!name && !search_id && !email && !password) {
    redirect(`/signup?error=${encodeURIComponent('すべての項目を入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!name) {
    redirect(`/signup?error=${encodeURIComponent('表示名を入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!search_id) {
    redirect(`/signup?error=${encodeURIComponent('検索IDを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!email) {
    redirect(`/signup?error=${encodeURIComponent('メールアドレスを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (!password) {
    redirect(`/signup?error=${encodeURIComponent('パスワードを入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  // 文字数制限
  if (name.length > 20) {
    redirect(`/signup?error=${encodeURIComponent('表示名は20文字以内で入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  if (search_id.length > 20) {
    redirect(`/signup?error=${encodeURIComponent('検索IDは20文字以内で入力してください')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  
  // search_id は英数字とアンダースコアのみ許容
  if (!/^[a-zA-Z0-9_]+$/.test(search_id)) {
    redirect(`/signup?error=${encodeURIComponent('検索用IDは英数字とアンダースコアのみ使用できます')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  // ① 検索IDの重複チェック
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('search_id', search_id)
    .single()

  if (existingUser) {
    redirect(`/signup?error=${encodeURIComponent('この検索IDはすでに使用されています。別のIDをお試しください。')}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  // ② ユーザー登録処理
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        search_id,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  })

  // ③ エラーハンドリング（メールアドレス重複など）
  if (error) {
    let errorMessage = error.message
    if (errorMessage.includes('already registered')) {
      errorMessage = 'このメールアドレスはすでに登録されています'
    } else if (errorMessage.includes('Weak password')) {
      errorMessage = 'パスワードが弱すぎます（6文字以上で設定してください）'
    } else if (errorMessage.includes('Database error saving new user')) {
      errorMessage = 'ユーザー作成時に問題が発生しました（検索IDがすでに使われている可能性があります）'
    } else {
      errorMessage = 'エラーが発生しました: ' + errorMessage
    }
    redirect(`/signup?error=${encodeURIComponent(errorMessage)}${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  // ④ メール確認が必要な場合（セッションがない場合）の処理
  if (!data.session) {
    redirect(`/login?message=${encodeURIComponent('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。')}`)
  }

  // ⑤ 開発環境などでメール確認が不要な場合、自動でログイン状態を維持
  revalidatePath('/', 'layout')
  redirect(next)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
