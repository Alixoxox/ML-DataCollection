'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

const MIN_DURATION_SEC = 2;
const MAX_DURATION_SEC = 30;
const MIN_BLOB_BYTES = 1024;

type InferenceStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface InferenceResult {
    predicted_mood?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    [key: string]: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function TestingTab() {
    const [status, setStatus] = useState<InferenceStatus>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [result, setResult] = useState<InferenceResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            clearTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTimers = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null; }
    };

    const startRecording = useCallback(async () => {
        setErrorMsg(null);
        setResult(null);
        setAudioUrl(null);
        setAudioBlob(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 96000 });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                clearTimers();
                stream.getTracks().forEach((t) => t.stop());
                const durationSec = (Date.now() - startTimeRef.current) / 1000;
                const blob = new Blob(chunksRef.current, { type: mimeType });

                if (durationSec < MIN_DURATION_SEC || blob.size < MIN_BLOB_BYTES) {
                    setErrorMsg(`Recording too short. Speak for at least ${MIN_DURATION_SEC} seconds.`);
                    setStatus('error');
                    setElapsed(0);
                    return;
                }

                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setAudioBlob(blob);
                setElapsed(0);
                setStatus('done');
            };

            startTimeRef.current = Date.now();
            setElapsed(0);
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 500);

            mediaRecorder.start(250);
            setStatus('recording');

            maxTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, MAX_DURATION_SEC * 1000);
        } catch {
            setErrorMsg('Microphone access denied. Please allow microphone permission and try again.');
            setStatus('error');
        }
    }, []);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    const reRecord = useCallback(() => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setResult(null);
        setErrorMsg(null);
        startRecording();
    }, [audioUrl, startRecording]);

    const runInference = useCallback(async () => {
        if (!audioBlob) return;
        setStatus('processing');
        setResult(null);
        setErrorMsg(null);

        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'test_recording.webm');

            const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: formData, credentials: 'omit' });
            if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`);
            const data = await res.json();
            setResult(data);
            setStatus('done');
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Request failed. Check the endpoint URL and server.');
            setStatus('error');
        }
    }, [audioBlob]);

    const reset = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setResult(null);
        setErrorMsg(null);
        setStatus('idle');
        setElapsed(0);
    };

    const fmtTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const topMood = (result?.emotion ?? result?.predicted_mood) as string | undefined;
    const confidence = (result?.emotion_confidence ?? result?.confidence) as number | undefined;
    const language = result?.language as string | undefined;
    const languageConf = result?.language_confidence as number | undefined;
    const probs = result?.probabilities as Record<string, number> | undefined;

    const moodColors: Record<string, string> = {
        happy: '#f59e0b',
        calm: '#10b981',
        sad: '#6366f1',
        angry: '#ef4444',
        stressed: '#f97316',
        excited: '#ec4899',
    };
    const topColor = topMood ? (moodColors[topMood.toLowerCase()] ?? '#06b6d4') : '#06b6d4';

    return (
        <div className="testing-tab">

            {/* Main recorder area */}
            <div className="test-recorder-card">

                {/* Idle */}
                {status === 'idle' && (
                    <div className="test-idle">
                        <div className="test-mic-ring" aria-hidden="true">
                            <div className="test-mic-inner">🎙️</div>
                        </div>
                        <p className="test-idle-hint">Tap to record your voice, then run it through the model.</p>
                        <button
                            id="test-start-recording"
                            type="button"
                            className="btn btn-test-record"
                            onClick={startRecording}
                        >
                            Start Recording
                        </button>
                    </div>
                )}

                {/* Recording */}
                {status === 'recording' && (
                    <div className="test-recording-active">
                        <div className="test-waveform" aria-hidden="true">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <span key={i} className="test-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                            ))}
                        </div>
                        <div className="test-timer" aria-live="polite" aria-atomic="true">
                            <span className="pulse-dot" aria-hidden="true" />
                            <span className="timer-digits">{fmtTime(elapsed)}</span>
                        </div>
                        <button
                            id="test-stop-recording"
                            type="button"
                            className="btn btn-test-stop"
                            onClick={stopRecording}
                            disabled={elapsed < 1}
                        >
                            ⏹ Stop
                        </button>
                    </div>
                )}

                {/* Done — has recording, show playback + run button */}
                {(status === 'done' || status === 'error') && audioUrl && (
                    <div className="test-done-area">
                        <audio
                            controls
                            src={audioUrl}
                            className="audio-player test-audio-player"
                            aria-label="Test recording playback"
                        />
                        <div className="test-action-row">
                            <button
                                id="test-rerecord"
                                type="button"
                                className="btn btn-ghost"
                                onClick={reRecord}
                            >
                                ↺ Re-record
                            </button>
                            <button
                                id="test-run-inference"
                                type="button"
                                className="btn btn-test-run"
                                onClick={runInference}
                                disabled={!audioBlob}
                            >
                                ▶ Analyse Voice
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing spinner */}
                {status === 'processing' && (
                    <div className="test-processing">
                        <div className="test-spinner" aria-hidden="true">
                            <div className="test-spinner-ring" />
                        </div>
                        <p className="test-processing-text">Sending to model…</p>
                        {audioUrl && (
                            <audio
                                controls
                                src={audioUrl}
                                className="audio-player test-audio-player"
                                aria-label="Test recording playback"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Error message */}
            {errorMsg && (
                <div className="test-error-banner" role="alert">
                    <span aria-hidden="true">⚠</span> {errorMsg}
                    <button type="button" className="test-reset-btn" onClick={reset}>
                        Try again
                    </button>
                </div>
            )}

            {/* Results panel */}
            {result && (
                <div className="test-result-panel" role="region" aria-label="Inference result">

                    {topMood && (
                        <div className="test-result-hero" style={{ '--mood-color': topColor } as React.CSSProperties}>
                            <div className="test-result-mood-badge">
                                <span className="test-result-mood-label">Detected Mood</span>
                                <span className="test-result-mood-value" style={{ color: topColor }}>
                                    {topMood.charAt(0).toUpperCase() + topMood.slice(1).toLowerCase()}
                                </span>
                                {confidence !== undefined && (
                                    <span className="test-result-confidence">
                                        {(confidence * 100).toFixed(1)}% confidence
                                    </span>
                                )}
                            </div>

                            {/* Emotion confidence bar — belongs to mood, sits right below it */}
                            {confidence !== undefined && (
                                <div
                                    className="test-conf-bar-track"
                                    aria-label={`Emotion confidence: ${(confidence * 100).toFixed(1)}%`}
                                >
                                    <div
                                        className="test-conf-bar-fill"
                                        style={{ width: `${confidence * 100}%`, background: topColor }}
                                    />
                                </div>
                            )}

                            {/* Language — shown as a pill, no bar (binary value) */}
                            {language && (
                                <div className="test-result-language">
                                    <span className="test-result-mood-label">Language</span>
                                    <div className="test-result-lang-row">
                                        <span className="test-result-lang-pill">{language}</span>
                                        {languageConf !== undefined && (
                                            <span className="test-result-lang-conf">
                                                {(languageConf * 100).toFixed(1)}% confidence
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Probabilities breakdown */}
                    {probs && Object.keys(probs).length > 0 && (
                        <div className="test-probs">
                            <h3 className="test-probs-title">All Probabilities</h3>
                            <ul className="test-probs-list" role="list">
                                {Object.entries(probs)
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .map(([mood, prob]) => {
                                        const pct = ((prob as number) * 100).toFixed(1);
                                        const color = moodColors[mood.toLowerCase()] ?? '#94a3b8';
                                        return (
                                            <li key={mood} className="test-prob-row">
                                                <span className="test-prob-mood">{mood}</span>
                                                <div className="test-prob-bar-track">
                                                    <div
                                                        className="test-prob-bar-fill"
                                                        style={{ width: `${pct}%`, background: color }}
                                                    />
                                                </div>
                                                <span className="test-prob-pct">{pct}%</span>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    )}

                    {/* Raw JSON fallback for unknown shapes */}
                    {!topMood && (
                        <div className="test-raw-json">
                            <h3 className="test-probs-title">Raw Response</h3>
                            <pre className="test-json-block">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}

                    <button
                        type="button"
                        id="test-run-again"
                        className="btn btn-ghost test-run-again"
                        onClick={reset}
                    >
                        ↩ Test again
                    </button>
                </div>
            )}
        </div>
    );
}
