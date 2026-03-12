'use client';

import React, { useState, useCallback, useEffect } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import RecordingField from '@/components/RecordingField';
import ConsentCheckbox from '@/components/ConsentCheckbox';
import { getLangKey, uiLabels } from '@/lib/i18n';
import type { ScriptCode } from '@/lib/supabase';
import { useFormProgress } from '@/lib/FormProgressContext';

const TOTAL_RECORDINGS = 6;
const REQUIRED_COUNT = 3;
const STORAGE_KEY = 'vmr_participated'; // localStorage key for deduplication

interface RecordingState {
    blob: Blob | null;
    mood: string;
}

const emptyRecording = (): RecordingState => ({ blob: null, mood: '' });

/* ── Main Form ───────────────────────────────────────────────────────────── */
export default function VoiceMoodForm() {
    const [language, setLanguage] = useState<string>('');
    const [script, setScript] = useState<ScriptCode>(null);
    const [recordings, setRecordings] = useState<RecordingState[]>(
        Array.from({ length: TOTAL_RECORDINGS }, emptyRecording)
    );
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationMsg, setValidationMsg] = useState<string | null>(null);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [hydrated, setHydrated] = useState(false); // prevent SSR flash

    const { setProgress } = useFormProgress();

    // Check localStorage for previous submission on mount
    // (disabled for testing — re-enable to restore deduplication)
    useEffect(() => {
        // const flag = localStorage.getItem(STORAGE_KEY);
        // if (flag) setAlreadyDone(true);
        setHydrated(true);
    }, []);

    // Publish completion count to context whenever recordings change
    useEffect(() => {
        const done = recordings.filter((r) => r.blob !== null && r.mood !== '').length;
        setProgress(done);
    }, [recordings, setProgress]);

    const langKey = getLangKey(language, script);
    const labels = uiLabels[langKey];
    const languageSelected = language !== '';

    // ── Recording state helpers ─────────────────────────────────────────────
    const handleBlobChange = useCallback((index: number, blob: Blob) => {
        setRecordings((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], blob };
            return updated;
        });
    }, []);

    const handleMoodChange = useCallback((index: number, mood: string) => {
        setRecordings((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], mood };
            return updated;
        });
    }, []);

    const handleCleared = useCallback((index: number) => {
        setRecordings((prev) => {
            const updated = [...prev];
            updated[index] = { blob: null, mood: '' };
            return updated;
        });
    }, []);

    // ── Validation ──────────────────────────────────────────────────────────
    const validate = (): boolean => {
        if (!language) {
            setValidationMsg('Please select a language.');
            return false;
        }
        for (let i = 0; i < TOTAL_RECORDINGS; i++) {
            if (recordings[i].blob && !recordings[i].mood) {
                setValidationMsg(`Please select a mood for Recording ${i + 1}.`);
                return false;
            }
        }
        const completedCount = recordings.filter((r) => r.blob && r.mood).length;
        if (completedCount < REQUIRED_COUNT) {
            setValidationMsg(
                `Please complete at least ${REQUIRED_COUNT} recordings (any ${REQUIRED_COUNT} of the ${TOTAL_RECORDINGS} slots).`
            );
            return false;
        }
        if (!consent) {
            setValidationMsg('Please accept the consent checkbox before submitting.');
            return false;
        }
        setValidationMsg(null);
        return true;
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('language', language);
            if (script) formData.append('script', script);

            recordings.forEach((rec, i) => {
                if (rec.blob) {
                    formData.append(`audio_${i + 1}`, rec.blob, `recording_${i + 1}.webm`);
                    formData.append(`mood_${i + 1}`, rec.mood);
                }
            });

            const res = await fetch('/api/submit', { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed.');

            // Mark this device as having participated
            // localStorage.setItem(STORAGE_KEY, Date.now().toString());
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset entire form so the user can submit another response
    const handleSubmitAnother = () => {
        setLanguage('');
        setScript(null);
        setRecordings(Array.from({ length: TOTAL_RECORDINGS }, emptyRecording));
        setConsent(false);
        setError(null);
        setValidationMsg(null);
        setSubmitted(false);
    };

    // ── Render guards ────────────────────────────────────────────────────────
    if (!hydrated) return null;

    // ── Success Screen ───────────────────────────────────────────────────────
    if (submitted) {
        const completedCount = recordings.filter((r) => r.blob && r.mood).length;
        return (
            <div className="success-screen" role="status" aria-live="polite">
                {/* Animated background orbs */}
                <div className="success-orb success-orb-1" aria-hidden="true" />
                <div className="success-orb success-orb-2" aria-hidden="true" />
                <div className="success-orb success-orb-3" aria-hidden="true" />

                {/* SVG animated checkmark */}
                <div className="success-check-wrap" aria-hidden="true">
                    <svg className="success-check-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="success-check-circle" cx="26" cy="26" r="24" />
                        <polyline className="success-check-tick" points="14,27 22,35 38,17" />
                    </svg>
                </div>

                <h2 className="success-title">Submission Complete</h2>
                <p className="success-msg">
                    Your voice recordings have been received. Thank you for helping
                    build a multilingual mood detection dataset.
                </p>

                {/* Stats row */}
                <div className="success-stats" aria-label="Submission summary">
                    <div className="success-stat">
                        <span className="success-stat-num">{completedCount}</span>
                        <span className="success-stat-label">Recording{completedCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="success-stat-divider" aria-hidden="true" />
                    <div className="success-stat">
                        <span className="success-stat-num">✓</span>
                        <span className="success-stat-label">Saved</span>
                    </div>

                </div>

                {/* Urdu thank-you */}
                {(langKey === 'urdu_script' || langKey === 'roman_urdu') && (
                    <p className="success-sub" dir={langKey === 'urdu_script' ? 'rtl' : 'ltr'}>
                        {langKey === 'urdu_script' && 'آپ کا شکریہ! آپ کی ریکارڈنگز محفوظ کر لی گئی ہیں۔'}
                        {langKey === 'roman_urdu' && 'Shukriya! Aapki recordings save ho gayi hain.'}
                    </p>
                )}

                <button
                    type="button"
                    className="submit-another-btn"
                    onClick={handleSubmitAnother}
                >
                    ↩&nbsp;Submit another response
                </button>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} noValidate className="mood-form" aria-label="Voice Mood Recording Form">

            {/* Step 1: Language */}
            <section className="form-section" aria-labelledby="lang-section-heading">
                <h2 id="lang-section-heading" className="section-heading">
                    <span className="step-badge">1</span> Language
                </h2>
                <LanguageSelector
                    language={language}
                    script={script}
                    onLanguageChange={setLanguage}
                    onScriptChange={setScript}
                />
            </section>

            {/* Step 2: Recordings */}
            {languageSelected && (
                <section className="form-section" aria-labelledby="recordings-section-heading">
                    <h2 id="recordings-section-heading" className="section-heading">
                        <span className="step-badge">2</span> Voice Recordings
                    </h2>
                    <p className="section-desc">
                        Record 5–10 seconds each. Minimum 3 recordings required, up to 6 allowed.
                        Please record in a quiet environment.
                    </p>

                    <div className="recordings-grid" role="list">
                        {recordings.map((rec, i) => {
                            const usedMoods = recordings
                                .filter((_, j) => j !== i)
                                .map((r) => r.mood)
                                .filter(Boolean);
                            return (
                                <div key={i} role="listitem">
                                    <RecordingField
                                        index={i + 1}
                                        langKey={langKey}
                                        required={i < REQUIRED_COUNT}
                                        blob={rec.blob}
                                        mood={rec.mood}
                                        onBlobChange={(blob) => handleBlobChange(i, blob)}
                                        onMoodChange={(mood) => handleMoodChange(i, mood)}
                                        onCleared={() => handleCleared(i)}
                                        usedMoods={usedMoods}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Step 3: Consent & Submit */}
            {languageSelected && (
                <section className="form-section consent-section" aria-labelledby="consent-section-heading">
                    <h2 id="consent-section-heading" className="section-heading">
                        <span className="step-badge">3</span> Consent
                    </h2>
                    <ConsentCheckbox langKey={langKey} checked={consent} onChange={setConsent} />

                    {validationMsg && (
                        <div className="validation-msg" role="alert" aria-live="assertive">
                            ⚠️ {validationMsg}
                        </div>
                    )}
                    {error && (
                        <div className="error-msg" role="alert" aria-live="assertive">
                            ❌ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={submitting}
                        aria-busy={submitting}
                    >
                        {submitting ? '⏳ ' + labels.submitting : labels.submitBtn}
                    </button>
                </section>
            )}
        </form>
    );
}
