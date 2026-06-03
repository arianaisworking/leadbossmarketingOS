-- The Lead Boss Marketing OS v3 Supabase Schema
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.brand_context (
  id uuid primary key default gen_random_uuid(),
  company text not null default 'The Lead Boss',
  email text,
  core_message text,
  offer text,
  ideal_customer_profile text,
  tone text,
  guardrails text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_date date not null,
  platform text,
  content_type text,
  status text default 'Idea',
  asset_link text,
  notes text,
  assigned_to text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.research_library (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  platform text,
  source_link text,
  transcript_text text,
  visual_notes text,
  photo_paths jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.content_generations (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  mode text,
  prompt text,
  assets jsonb,
  research_id uuid references public.research_library(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.story_bank (
  id uuid primary key default gen_random_uuid(),
  story_type text,
  title text not null,
  details text,
  photo_paths jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.social_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  platform text,
  source_thread text,
  generated_replies jsonb,
  created_at timestamptz default now()
);

-- Storage bucket for screenshots/photos. Public is easiest for MVP. Switch to private + signed URLs later if needed.
insert into storage.buckets (id, name, public)
values ('tlb-marketing-assets', 'tlb-marketing-assets', true)
on conflict (id) do nothing;

-- MVP policies: allow authenticated users to manage rows.
alter table public.brand_context enable row level security;
alter table public.content_calendar enable row level security;
alter table public.research_library enable row level security;
alter table public.content_generations enable row level security;
alter table public.story_bank enable row level security;
alter table public.social_directory enable row level security;
alter table public.community_comments enable row level security;

do $$
begin
  create policy "authenticated manage brand_context" on public.brand_context for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage content_calendar" on public.content_calendar for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage research_library" on public.research_library for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage content_generations" on public.content_generations for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage story_bank" on public.story_bank for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage social_directory" on public.social_directory for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated manage community_comments" on public.community_comments for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Storage policies for authenticated users.
do $$
begin
  create policy "authenticated upload marketing assets" on storage.objects for insert to authenticated with check (bucket_id = 'tlb-marketing-assets');
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated read marketing assets" on storage.objects for select to authenticated using (bucket_id = 'tlb-marketing-assets');
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated update marketing assets" on storage.objects for update to authenticated using (bucket_id = 'tlb-marketing-assets') with check (bucket_id = 'tlb-marketing-assets');
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "authenticated delete marketing assets" on storage.objects for delete to authenticated using (bucket_id = 'tlb-marketing-assets');
exception when duplicate_object then null; end $$;

