create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users null,
  name text,
  email text not null,
  type text not null,
  content text not null,
  status text default 'new' not null
);

-- RLS (Row Level Security) の有効化
alter table public.inquiries enable row level security;

-- ログインユーザーのみお問い合わせを送信できるように Insert を許可するポリシー
create policy "Authenticated users can insert inquiries"
  on public.inquiries for insert
  to authenticated
  with check (auth.uid() = user_id);

-- （必要であれば）自分の送ったお問い合わせだけ見れるようにするポリシー等を追加することもできますが、
-- 基本的に管理画面用なので Select 権限はパブリックには付与しません。
