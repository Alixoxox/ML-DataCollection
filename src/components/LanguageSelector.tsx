'use client';

import React from 'react';
import { sampleSentences, type LangKey } from '@/lib/i18n';
import type { ScriptCode } from '@/lib/supabase';

interface LanguageSelectorProps {
    language: string;
    script: ScriptCode;
    onLanguageChange: (lang: string) => void;
    onScriptChange: (script: ScriptCode) => void;
}

export default function LanguageSelector({
    language,
    script,
    onLanguageChange,
    onScriptChange,
}: LanguageSelectorProps) {
    const langKey: LangKey =
        language === 'english' ? 'english' : script === 'urdu_script' ? 'urdu_script' : 'roman_urdu';

    const sample = language ? sampleSentences[langKey] : null;

    return (
        <fieldset className="lang-fieldset">
            <legend className="lang-legend">Select Language / زبان منتخب کریں</legend>

            {/* Language radio buttons */}
            <div className="radio-group" role="radiogroup" aria-labelledby="lang-label">
                <p id="lang-label" className="radio-group-label">Language:</p>
                <label className={`radio-label ${language === 'english' ? 'radio-active' : ''}`}>
                    <input
                        type="radio"
                        name="language"
                        value="english"
                        checked={language === 'english'}
                        onChange={() => {
                            onLanguageChange('english');
                            onScriptChange(null);
                        }}
                        aria-label="English"
                    />
                    <span>🇬🇧 English</span>
                </label>
                <label className={`radio-label ${language === 'urdu' ? 'radio-active' : ''}`}>
                    <input
                        type="radio"
                        name="language"
                        value="urdu"
                        checked={language === 'urdu'}
                        onChange={() => {
                            onLanguageChange('urdu');
                            onScriptChange('roman_urdu');
                        }}
                        aria-label="Urdu"
                    />
                    <span>🇵🇰 Urdu / اردو</span>
                </label>
            </div>

            {/* Script sub-selection (only for Urdu) */}
            {language === 'urdu' && (
                <div className="radio-group script-group" role="radiogroup" aria-labelledby="script-label">
                    <p id="script-label" className="radio-group-label">Script / رسم الخط:</p>
                    <label className={`radio-label ${script === 'roman_urdu' ? 'radio-active' : ''}`}>
                        <input
                            type="radio"
                            name="script"
                            value="roman_urdu"
                            checked={script === 'roman_urdu'}
                            onChange={() => onScriptChange('roman_urdu')}
                            aria-label="Roman Urdu"
                        />
                        <span>Roman Urdu <em>(e.g., "Aaj mausam…")</em></span>
                    </label>
                    <label className={`radio-label ${script === 'urdu_script' ? 'radio-active' : ''}`}>
                        <input
                            type="radio"
                            name="script"
                            value="urdu_script"
                            checked={script === 'urdu_script'}
                            onChange={() => onScriptChange('urdu_script')}
                            aria-label="Urdu Script"
                        />
                        <span dir="rtl">اردو رسم الخط <em dir="ltr">(e.g., "آج موسم…")</em></span>
                    </label>
                </div>
            )}

            {/* Sample sentence preview */}
            {sample && (
                <div className="sample-sentence" dir={langKey === 'urdu_script' ? 'rtl' : 'ltr'} aria-live="polite">
                    <p className="sample-label">📖 Read this sentence while recording:</p>
                    <blockquote className={`sample-text ${langKey === 'urdu_script' ? 'urdu-font' : ''}`}>
                        {sample}
                    </blockquote>
                </div>
            )}
        </fieldset>
    );
}
