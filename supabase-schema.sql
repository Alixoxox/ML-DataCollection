-- ============================================================
-- DataForge — Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the recordings table
create table if not exists recordings (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null,
  recording_index int not null check (recording_index between 1 and 6),
  language       text not null check (language in ('english', 'urdu')),
  script         text check (script in ('roman_urdu', 'urdu_script') or script is null),
  mood           text not null check (mood in ('calm', 'stressed', 'happy', 'sad', 'angry', 'excited')),
  audio_url      text not null,
  created_at     timestamptz not null default now()
);

-- 2. Index for querying by session
create index if not exists idx_recordings_session_id on recordings (session_id);

-- 3. Row Level Security (optional — enable if using service role key server-side)
-- alter table recordings enable row level security;

-- ============================================================
-- STORAGE SETUP (do this in the Supabase Dashboard)
-- ============================================================
-- 1. Go to Storage > New Bucket
-- 2. Name: audio-recordings
-- 3. Public bucket: enabled (so audio_url links work directly)
--    OR private + use signed URLs in the API route
