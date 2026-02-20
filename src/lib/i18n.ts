import type { ScriptCode } from './supabase';

export type LangKey = 'english' | 'roman_urdu' | 'urdu_script';

export interface MoodOption {
    value: string;
    label: string;
}

export const sampleSentences: Record<LangKey, string> = {
    english: '"Today the weather is nice and calm."',
    roman_urdu: '"Aaj mausam acha aur pursakoon hai."',
    urdu_script: '"آج موسم اچھا اور پرسکون ہے۔"',
};

export const moodOptions: Record<LangKey, MoodOption[]> = {
    english: [
        { value: 'calm', label: 'Calm' },
        { value: 'stressed', label: 'Stressed' },
        { value: 'happy', label: 'Happy' },
        { value: 'sad', label: 'Sad' },
        { value: 'angry', label: 'Angry' },
        { value: 'excited', label: 'Excited' },
    ],
    roman_urdu: [
        { value: 'calm', label: 'Calm (Pursukoon)' },
        { value: 'stressed', label: 'Stressed (Pareeshan)' },
        { value: 'happy', label: 'Happy (Khush)' },
        { value: 'sad', label: 'Sad (Udaas)' },
        { value: 'angry', label: 'Angry (Gussa)' },
        { value: 'excited', label: 'Excited (Josh)' },
    ],
    urdu_script: [
        { value: 'calm', label: 'سکون (Calm)' },
        { value: 'stressed', label: 'پریشان (Stressed)' },
        { value: 'happy', label: 'خوش (Happy)' },
        { value: 'sad', label: 'اداس (Sad)' },
        { value: 'angry', label: 'غصہ (Angry)' },
        { value: 'excited', label: 'جوش (Excited)' },
    ],
};

export const uiLabels: Record<LangKey, {
    recording: string;
    stopRecording: string;
    reRecord: string;
    selectMood: string;
    moodLabel: string;
    requiredBadge: string;
    optionalBadge: string;
    recordingReady: string;
    consentLabel: string;
    submitBtn: string;
    submitting: string;
    recorded: string;
    tapToRecord: string;
}> = {
    english: {
        recording: 'Recording… (tap to stop)',
        stopRecording: 'Stop Recording',
        reRecord: 'Re-record',
        selectMood: 'Select your current mood',
        moodLabel: 'Select your current mood',
        requiredBadge: 'Required',
        optionalBadge: 'Optional',
        recordingReady: 'Recording ready',
        consentLabel: 'I consent to my anonymous voice recordings being used for academic machine learning research.',
        submitBtn: 'Submit Recordings',
        submitting: 'Submitting…',
        recorded: 'Recorded ✓',
        tapToRecord: 'Tap to Record',
    },
    roman_urdu: {
        recording: 'Recording ho raha hai… (rokne k liye tap karein)',
        stopRecording: 'Recording Band Karein',
        reRecord: 'Dobara Record Karein',
        selectMood: 'Apna mojoodah mizaaj chunein',
        moodLabel: 'Apna mojoodah mizaaj chunein',
        requiredBadge: 'Zaroori',
        optionalBadge: 'Ikhtiari',
        recordingReady: 'Recording tayyar',
        consentLabel: 'Main raazi hoon ke meri gumnam awaz ki recordings academic machine learning research ke liye use ki jaen.',
        submitBtn: 'Recordings Submit Karein',
        submitting: 'Submit ho raha hai…',
        recorded: 'Record ho gaya ✓',
        tapToRecord: 'Record karne ke liye tap karein',
    },
    urdu_script: {
        recording: 'ریکارڈنگ جاری ہے… (روکنے کے لیے ٹیپ کریں)',
        stopRecording: 'ریکارڈنگ بند کریں',
        reRecord: 'دوبارہ ریکارڈ کریں',
        selectMood: 'اپنا موجودہ مزاج چنیں',
        moodLabel: 'اپنا موجودہ مزاج چنیں',
        requiredBadge: 'ضروری',
        optionalBadge: 'اختیاری',
        recordingReady: 'ریکارڈنگ تیار',
        consentLabel: 'میں اس بات پر رضامند ہوں کہ میری گمنام آواز کی ریکارڈنگز تعلیمی مشین لرننگ ریسرچ کے لیے استعمال کی جائیں۔',
        submitBtn: 'ریکارڈنگز جمع کروائیں',
        submitting: 'جمع ہو رہا ہے…',
        recorded: 'ریکارڈ ہو گیا ✓',
        tapToRecord: 'ریکارڈ کرنے کے لیے ٹیپ کریں',
    },
};

export function getLangKey(language: string, script: ScriptCode): LangKey {
    if (language === 'english') return 'english';
    if (script === 'urdu_script') return 'urdu_script';
    return 'roman_urdu';
}
