'use client';

import { APP_CONFIG } from '@/configs/app';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextType {
    theme: string
    themeIsDark: boolean
    toggleTheme(): void
}

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeContainer: React.FC<ThemeProviderProps> = ({ children }) => {
    // Theme
    const getInitialTheme = () => {
        if (typeof window === 'undefined') return 'light';
        return localStorage.getItem('theme') || 'light';
    };
    const [theme, setTheme] = useState<string>(getInitialTheme);
    const themeIsDark = useMemo(() => theme === "dark", [theme]);

    useEffect(() => {
        if (!APP_CONFIG.enableTheme) return;

        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Helper function to set theme
    const setAppTheme = (val: string) => {
        setTheme(val);
    };

    const toggleTheme = () => {
        if (APP_CONFIG.enableTheme) {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            setAppTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            themeIsDark,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ThemeContainer>
            {children}
        </ThemeContainer>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};
