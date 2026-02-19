'use client';

import React from 'react';
import VoiceRecorder from './VoiceRecorder';
import MoodDropdown from './MoodDropdown';
import { uiLabels, type LangKey } from '@/lib/i18n';

interface RecordingFieldProps {
    index: number; // 1-based
    langKey: LangKey;
    required: boolean;
    blob: Blob | null;
    mood: string;
    onBlobChange: (blob: Blob) => void;
    onMoodChange: (mood: string) => void;
    /** Mood values already chosen in other recordings — hidden from this dropdown. */
    usedMoods: string[];
    /** Called when a recording is cleared / rejected — parent can reset mood too */
    onCleared?: () => void;
}

export default function RecordingField({
    index,
    langKey,
    required,
    blob,
    mood,
    onBlobChange,
    onMoodChange,
    usedMoods,
    onCleared,
}: RecordingFieldProps) {
    const handleCleared = () => {
        onMoodChange('');
        onCleared?.();
    };
    const labels = uiLabels[langKey];
    const isRtl = langKey === 'urdu_script';
    const hasRecording = blob !== null;

    return (
        <article
            className={`recording-field ${hasRecording ? 'has-recording' : ''} ${required ? 'required-field' : 'optional-field'}`}
            aria-labelledby={`rec-heading-${index}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <header className="field-header">
                <h3 id={`rec-heading-${index}`} className="field-title">
                    Recording {index}
                </h3>
                <span className={`badge ${required ? 'badge-required' : 'badge-optional'}`}>
                    {required ? labels.requiredBadge : labels.optionalBadge}
                </span>
            </header>

            <VoiceRecorder
                langKey={langKey}
                onRecorded={onBlobChange}
                onCleared={handleCleared}
                existingBlob={blob}
            />

            {hasRecording && (
                <MoodDropdown
                    langKey={langKey}
                    value={mood}
                    onChange={onMoodChange}
                    required={true}
                    id={`mood-${index}`}
                    usedMoods={usedMoods}
                />
            )}
        </article>
    );
}
