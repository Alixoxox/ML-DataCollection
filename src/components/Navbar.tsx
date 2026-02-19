'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFormProgress } from '@/lib/FormProgressContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { completedCount, totalSlots, totalRequired } = useFormProgress();

    const progressPct = Math.round((completedCount / totalSlots) * 100);

    // Colour logic — matches bar AND badge
    const colorState: 'idle' | 'warning' | 'ready' | 'full' =
        completedCount === 0
            ? 'idle'
            : completedCount < totalRequired
                ? 'warning'   // amber — under minimum
                : completedCount < totalSlots
                    ? 'ready'     // cyan — minimum met
                    : 'full';     // green — all done

    const barColor = {
        idle: 'transparent',
        warning: '#f59e0b',
        ready: '#06b6d4',
        full: '#10b981',
    }[colorState];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Live Progress Bar */}
            <div
                className="navbar-progress-track"
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={totalSlots}
                aria-label={`${completedCount} of ${totalSlots} recordings completed`}
            >
                <div
                    className="navbar-progress-fill"
                    style={{ width: `${progressPct}%`, background: barColor }}
                />
            </div>

            <div className="navbar-inner">
                {/* Brand */}
                <Link href="/" className="navbar-brand" aria-label="Voice Mood Recorder Home">
                    <span className="navbar-logo" aria-hidden="true">🔬</span>
                    <div className="navbar-brand-text">
                        <span className="navbar-title">VoiceMood</span>
                        <span className="navbar-subtitle">ML Research</span>
                    </div>
                </Link>

                {/* Center pills */}
                <div className="navbar-pills" aria-label="Research metadata">
                    <span className="nav-pill">
                        <span aria-hidden="true">🎙️</span> Voice Dataset
                    </span>
                    <span className="nav-pill nav-pill-accent">
                        <span aria-hidden="true">🌐</span> EN / اردو
                    </span>
                </div>

                {/* Right — progress counter + status */}
                <div className="navbar-right">
                    {completedCount > 0 && (
                        <span
                            className="nav-progress-counter"
                            data-state={colorState}
                            aria-hidden="true"
                        >
                            {completedCount}/{totalSlots}
                            {completedCount >= totalRequired && <span className="nav-progress-check"> ✓</span>}
                        </span>
                    )}
                    <span className="nav-status-dot" data-state={colorState} aria-hidden="true" />
                    <span className="nav-status-text" data-state={colorState}>
                        {colorState === 'idle' && 'Open for participants'}
                        {colorState === 'warning' && 'Recording…'}
                        {colorState === 'ready' && 'Min. met ✓'}
                        {colorState === 'full' && 'All done 🎉'}
                    </span>
                </div>
            </div>
        </nav>
    );
}
