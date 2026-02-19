'use client';

import React from 'react';
import { uiLabels, type LangKey } from '@/lib/i18n';

interface ConsentCheckboxProps {
    langKey: LangKey;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function ConsentCheckbox({ langKey, checked, onChange }: ConsentCheckboxProps) {
    const labels = uiLabels[langKey];
    const isRtl = langKey === 'urdu_script';

    return (
        <div className="consent-wrapper" dir={isRtl ? 'rtl' : 'ltr'}>
            <label className="consent-label" htmlFor="consent-checkbox">
                <input
                    type="checkbox"
                    id="consent-checkbox"
                    name="consent"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    required
                    className="consent-input"
                    aria-required="true"
                    aria-describedby="consent-desc"
                />
                <span id="consent-desc" className="consent-text">
                    {labels.consentLabel}
                </span>
            </label>
        </div>
    );
}
