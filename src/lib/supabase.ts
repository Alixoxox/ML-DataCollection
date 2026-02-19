import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MoodLabel = 'calm' | 'stressed' | 'happy' | 'sad' | 'angry' | 'excited';
export type LanguageCode = 'english' | 'urdu';
export type ScriptCode = 'roman_urdu' | 'urdu_script' | null;

export interface RecordingEntry {
  session_id: string;
  recording_index: number;
  language: LanguageCode;
  script: ScriptCode;
  mood: MoodLabel;
  audio_url: string;
}
