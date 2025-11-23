import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { APP_CONFIG } from '../config/app.config';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const AVAILABLE_THEMES = [
  'light',
  'dark',
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => {
    const saved = localStorage.getItem('theme');
    return saved || APP_CONFIG.ui.defaultTheme;
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : APP_CONFIG.ui.defaultFontSize;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  const setTheme = (newTheme: string) => {
    if (AVAILABLE_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const setFontSize = (size: number) => {
    const { min, max } = APP_CONFIG.ui.fontSizeRange;
    const clampedSize = Math.max(min, Math.min(max, size));
    setFontSizeState(clampedSize);
  };

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    availableThemes: AVAILABLE_THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}