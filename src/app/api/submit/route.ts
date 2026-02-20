import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Service role key bypasses RLS — safe here, never exposed to browser
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'audio-recordings';
const MIN_BLOB_BYTES = 4096;              // 4 KB minimum
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year (for dataset access)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const sessionId = uuidv4();
        const language = formData.get('language') as string;
        const script = formData.get('script') as string | null;

        if (!language) {
            return NextResponse.json(
                { success: false, error: 'Language is required.' },
                { status: 400 }
            );
        }

        const insertRows: object[] = [];
        const uploadErrors: string[] = [];

        for (let i = 1; i <= 6; i++) {
            const audioFile = formData.get(`audio_${i}`) as File | null;
            const mood = formData.get(`mood_${i}`) as string | null;

            if (!audioFile || !mood) continue;

            // ── Server-side size guard (client already checked, but be safe) ──
            if (audioFile.size < MIN_BLOB_BYTES) {
                uploadErrors.push(`Recording ${i} is too small (${audioFile.size} bytes) — skipped.`);
                continue;
            }

            // ── Upload to Supabase Storage ────────────────────────────────────
            const ext = audioFile.type.includes('ogg') ? 'ogg' : 'webm';
            const fileName = `raw/${language}/${mood}/rec_${i}_${Date.now()}.${ext}`;

            const arrayBuffer = await audioFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(fileName, buffer, {
                    contentType: audioFile.type || 'audio/webm',
                    upsert: false,
                });

            if (uploadError) {
                const hint = uploadError.message.includes('not found')
                    ? `Bucket "${BUCKET}" not found — create it in Supabase → Storage.`
                    : `Recording ${i} upload failed: ${uploadError.message}`;
                uploadErrors.push(hint);
                continue;
            }

            // ── Generate a long-lived signed URL (works for public + private buckets) ──
            const { data: signedData, error: signedError } = await supabase.storage
                .from(BUCKET)
                .createSignedUrl(fileName, SIGNED_URL_TTL);

            const audioUrl = signedError || !signedData
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}` // fallback
                : signedData.signedUrl;

            insertRows.push({
                session_id: sessionId,
                recording_index: i,
                language,
                script: script || null,
                mood,
                audio_url: audioUrl,
            });
        }

        if (insertRows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: uploadErrors[0] ?? 'No valid recordings to save.',
                    details: uploadErrors,
                },
                { status: 400 }
            );
        }

        // ── Insert metadata into the recordings table ─────────────────────────
        const { error: dbError } = await supabase.from('recordings').insert(insertRows);

        if (dbError) {
            const msg = dbError.message.includes('does not exist')
                ? 'The "recordings" table is missing — run supabase-schema.sql in Supabase SQL Editor.'
                : dbError.message;
            return NextResponse.json(
                { success: false, error: msg },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            sessionId,
            saved: insertRows.length,
            warnings: uploadErrors.length > 0 ? uploadErrors : undefined,
        });

    } catch (err) {
        console.error('[submit] Unhandled error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error. Check server logs.' },
            { status: 500 }
        );
    }
}
