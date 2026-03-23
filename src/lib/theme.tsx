'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  c: {
    bgPage: string;
    bgSidebar: string;
    bgCard: string;
    bgCardHover: string;
    bgInput: string;
    bgTag: string;
    border: string;
    borderSubtle: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    shadow: string;
  };
}

const LIGHT = {
  bgPage: '#F7F7F5',
  bgSidebar: '#FAFAF9',
  bgCard: '#FFFFFF',
  bgCardHover: '#FAFAF9',
  bgInput: '#F9FAFB',
  bgTag: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.07)',
  borderSubtle: 'rgba(0,0,0,0.04)',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  shadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
};

const DARK = {
  bgPage: '#111318',
  bgSidebar: '#16181d',
  bgCard: '#1e2028',
  bgCardHover: '#24262e',
  bgInput: '#1e2028',
  bgTag: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  shadow: '0 1px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
};

const Ctx = createContext<ThemeCtx>({
  theme: 'light',
  toggle: () => {},
  c: LIGHT,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('lumnix-theme') as Theme;
    if (saved === 'dark') setTheme('dark');
  }, []);

  function toggle() {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('lumnix-theme', next);
      return next;
    });
  }

  const c = theme === 'dark' ? DARK : LIGHT;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.backgroundColor = c.bgPage;
    document.body.style.color = c.text;
  }, [theme]);

  return <Ctx.Provider value={{ theme, toggle, c }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
