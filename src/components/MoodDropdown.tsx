'use client';

import React from 'react';
import { moodOptions, uiLabels, type LangKey } from '@/lib/i18n';

interface MoodDropdownProps {
    langKey: LangKey;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    id: string;
    /** Mood values already selected in other recordings — these are hidden. */
    usedMoods?: string[];
}

export default function MoodDropdown({ langKey, value, onChange, required, id, usedMoods = [] }: MoodDropdownProps) {
    const options = moodOptions[langKey];
    const labels = uiLabels[langKey];
    const isRtl = langKey === 'urdu_script';

    // Hide moods used elsewhere, but always show the current value so it doesn't vanish.
    const availableOptions = options.filter(
        (opt) => !usedMoods.includes(opt.value) || opt.value === value
    );

    return (
        <div className="mood-dropdown-wrapper" dir={isRtl ? 'rtl' : 'ltr'}>
            <label htmlFor={id} className="mood-label">
                {labels.moodLabel}
                {required && <span className="required-star" aria-hidden="true">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mood-select"
                aria-required={required}
            >
                <option value="">{labels.selectMood}</option>
                {availableOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
