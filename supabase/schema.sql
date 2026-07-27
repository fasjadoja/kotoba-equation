-- 「みんなの作品」（任意公開ギャラリー）用のテーブル。
-- Supabase の SQL Editor にそのまま貼り付けて実行してください。

create table if not exists public.public_formulas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  result_text text not null check (char_length(result_text) between 1 and 50),
  relation text not null default '＝' check (char_length(relation) <= 1),
  elements jsonb not null check (jsonb_array_length(elements) between 1 and 8),
  sub_note text not null default '' check (char_length(sub_note) <= 140),
  hashtags text not null default '' check (char_length(hashtags) <= 40),
  author text not null default '' check (char_length(author) <= 50)
);

create index if not exists public_formulas_created_at_idx
  on public.public_formulas (created_at desc);

alter table public.public_formulas enable row level security;

-- 誰でも閲覧できる（公開ギャラリーのため）
drop policy if exists "public read" on public.public_formulas;
create policy "public read"
  on public.public_formulas for select
  to anon, authenticated
  using (true);

-- 誰でも投稿できるが、更新・削除は不可（サービス側の管理のみ）
drop policy if exists "public insert" on public.public_formulas;
create policy "public insert"
  on public.public_formulas for insert
  to anon, authenticated
  with check (true);

-- リアルタイム配信を有効化
alter publication supabase_realtime add table public.public_formulas;
