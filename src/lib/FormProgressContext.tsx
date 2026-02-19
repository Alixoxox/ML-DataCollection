'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FormProgressContextValue {
    completedCount: number;      // recordings that have both blob + mood
    totalRequired: number;       // always 3
    totalSlots: number;          // always 6
    setProgress: (completed: number) => void;
}

const FormProgressContext = createContext<FormProgressContextValue>({
    completedCount: 0,
    totalRequired: 3,
    totalSlots: 6,
    setProgress: () => { },
});

export function FormProgressProvider({ children }: { children: React.ReactNode }) {
    const [completedCount, setCompletedCount] = useState(0);

    const setProgress = useCallback((n: number) => {
        setCompletedCount(n);
    }, []);

    return (
        <FormProgressContext.Provider
            value={{ completedCount, totalRequired: 3, totalSlots: 6, setProgress }}
        >
            {children}
        </FormProgressContext.Provider>
    );
}

export function useFormProgress() {
    return useContext(FormProgressContext);
}
