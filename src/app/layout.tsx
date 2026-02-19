import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { FormProgressProvider } from '@/lib/FormProgressContext';

export const metadata: Metadata = {
  title: 'DataForge - Voice Mood Recording for ML Research',
  description:
    'Contribute to academic machine learning research by recording short voice clips and self-reporting your mood. Multilingual support: English, Urdu, Roman Urdu.',
  keywords: [
    'mood detection',
    'voice recording',
    'machine learning dataset',
    'academic research',
    'speech emotion recognition',
    'urdu voice dataset',
    'NLP',
    'Ned',
    'Cis',
    'DataForge',
    'Voice Mood Recorder',
    'Sentiment Analysis',
    'Urdu Speech Dataset',
    'Roman Urdu',
    'AI Research',
    'Emotion AI',
    'Voice Data Collection',
    'Machine Learning Research',
    'Audio Dataset',
    'Mental Health AI',
    'Ned University'
  ],
  authors: [{ name: 'Academic ML Research Team' }],
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'DataForge - Voice Mood Recording for ML Research',
    description:
      'Record your voice while reading a neutral sentence and self-report your mood. Help build a multilingual emotion recognition dataset.',
    type: 'website',
    locale: 'en_US',
    siteName: 'DataForge',
  },
  twitter: {
    card: 'summary',
    title: 'DataForge - Voice Mood Recording for ML Research',
    description:
      'Contribute to academic ML research on mood detection. Record voice clips in English or Urdu.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <FormProgressProvider>
          <Navbar />
          <div className="layout-body">{children}</div>
        </FormProgressProvider>
      </body>
    </html>
  );
}

