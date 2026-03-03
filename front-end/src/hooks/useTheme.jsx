import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const STORAGE_KEY = 'lumo-theme';
const THEMES = ['light', 'dark', 'system'];

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'system';
}

function applyTheme(theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);

    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    const setTheme = useCallback((newTheme) => {
        if (!THEMES.includes(newTheme)) return;
        localStorage.setItem(STORAGE_KEY, newTheme);
        setThemeState(newTheme);
    }, []);

    /* Apply theme class on mount and whenever preference changes */
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    /* Listen for OS theme changes when in "system" mode */
    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (theme === 'system') applyTheme('system');
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme]);

    const value = useMemo(() => ({
        theme,           // raw preference: 'light' | 'dark' | 'system'
        resolvedTheme,   // actual applied: 'light' | 'dark'
        setTheme,
        isDark: resolvedTheme === 'dark',
    }), [theme, resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
    return ctx;
}
