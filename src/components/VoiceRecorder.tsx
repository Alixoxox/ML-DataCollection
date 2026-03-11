'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { uiLabels, type LangKey } from '@/lib/i18n';

const MIN_DURATION_SEC = 3;   // reject recordings shorter than this
const MAX_DURATION_SEC = 20;  // auto-stop at this limit for consistent ML clips
const MIN_BLOB_BYTES = 4096; // ~4 KB — anything smaller is basically silence/empty
const SILENCE_THRESHOLD = 0.01; // RMS below this = silent (0–1 scale)

interface VoiceRecorderProps {
    langKey: LangKey;
    onRecorded: (blob: Blob) => void;
    onCleared?: () => void;          // called when a recording is rejected or cleared
    existingBlob: Blob | null;
}

export default function VoiceRecorder({ langKey, onRecorded, onCleared, existingBlob }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(
        existingBlob ? URL.createObjectURL(existingBlob) : null
    );
    const [elapsed, setElapsed] = useState(0);       // seconds while recording
    const [recError, setRecError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const peakRmsRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const labels = uiLabels[langKey];
    const isRtl = langKey === 'urdu_script';

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current);
            maxTimerRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    const startRecording = useCallback(async () => {
        setRecError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 96000, // 96 kbps — smaller files, still good for ML
            });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                clearTimer();
                const durationSec = (Date.now() - startTimeRef.current) / 1000;
                const blob = new Blob(chunksRef.current, { type: mimeType });

                stream.getTracks().forEach((t) => t.stop());

                // ── Validation ──────────────────────────────────────────────
                if (durationSec < MIN_DURATION_SEC) {
                    setRecError(`Recording too short (${durationSec.toFixed(1)}s). Please record for at least ${MIN_DURATION_SEC} seconds.`);
                    setAudioUrl(null);
                    setIsRecording(false);
                    setElapsed(0);
                    onCleared?.();
                    return;
                }
                if (blob.size < MIN_BLOB_BYTES) {
                    setRecError('Recording appears empty or silent. Please try again.');
                    setAudioUrl(null);
                    setIsRecording(false);
                    setElapsed(0);
                    onCleared?.();
                    return;
                }
                if (peakRmsRef.current < SILENCE_THRESHOLD) {
                    setRecError('No speech detected — the recording sounds silent. Please speak clearly into the microphone and try again.');
                    setAudioUrl(null);
                    setIsRecording(false);
                    setElapsed(0);
                    onCleared?.();
                    return;
                }
                // ── Accept ──────────────────────────────────────────────────
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setIsRecording(false);
                setElapsed(0);
                onRecorded(blob);
            };

            // ── Silence detection via AnalyserNode ─────────────────────────
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;
            peakRmsRef.current = 0;

            const dataArray = new Float32Array(analyser.fftSize);
            silenceTimerRef.current = setInterval(() => {
                analyser.getFloatTimeDomainData(dataArray);
                const rms = Math.sqrt(
                    dataArray.reduce((sum, v) => sum + v * v, 0) / dataArray.length
                );
                if (rms > peakRmsRef.current) peakRmsRef.current = rms;
            }, 200);

            // Start elapsed timer
            startTimeRef.current = Date.now();
            setElapsed(0);
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 500);

            mediaRecorder.start(250);
            setIsRecording(true);

            // ── Auto-stop at MAX_DURATION_SEC ────────────────────────────────
            maxTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, MAX_DURATION_SEC * 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
            setRecError('Microphone access is required. Please allow microphone permission and try again.');
        }
    }, [onRecorded, onCleared]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        // isRecording & elapsed cleared in onstop
    }, []);

    const reRecord = useCallback(() => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setRecError(null);
        onCleared?.();
        startRecording();
    }, [audioUrl, startRecording, onCleared]);

    // Format elapsed duration as mm:ss
    const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="recorder-container" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Idle — no recording yet */}
            {!audioUrl && !isRecording && (
                <button
                    type="button"
                    className="btn btn-record"
                    onClick={startRecording}
                    aria-label={labels.tapToRecord}
                >
                    <span className="mic-icon" aria-hidden="true">🎙️</span>
                    {labels.tapToRecord}
                </button>
            )}

            {/* Currently recording — show live timer and stop button */}
            {isRecording && (
                <div className="recording-active">
                    <div className="recording-timer" aria-live="polite" aria-atomic="true">
                        <span className="pulse-dot" aria-hidden="true" />
                        <span className="timer-digits">{fmtTime(elapsed)}</span>
                        {elapsed < MIN_DURATION_SEC && (
                            <span className="timer-hint">min {MIN_DURATION_SEC}s</span>
                        )}
                        {elapsed >= MIN_DURATION_SEC && elapsed < MAX_DURATION_SEC && (
                            <span className="timer-hint">{MAX_DURATION_SEC - elapsed}s left</span>
                        )}
                        {elapsed >= MAX_DURATION_SEC && (
                            <span className="timer-hint" style={{ color: 'var(--color-error, #ef4444)' }}>stopping…</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="btn btn-stop"
                        onClick={stopRecording}
                        aria-label={labels.stopRecording}
                        disabled={elapsed < 1} // prevent near-instant stop spam
                    >
                        ⏹ {labels.stopRecording}
                    </button>
                </div>
            )}

            {/* Done — playback controls */}
            {audioUrl && !isRecording && (
                <div className="playback-row">
                    <audio controls src={audioUrl} className="audio-player" aria-label="Recorded audio playback" />
                    <button
                        type="button"
                        className="btn btn-rerecord"
                        onClick={reRecord}
                        aria-label={labels.reRecord}
                    >
                        ↺ {labels.reRecord}
                    </button>
                </div>
            )}

            {/* Validation error */}
            {recError && (
                <p className="rec-error" role="alert" aria-live="assertive">
                    ⚠️ {recError}
                </p>
            )}
        </div>
    );
}
