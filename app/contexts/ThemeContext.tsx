'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EditorTheme = 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
export type AppTheme = 'dark' | 'light';

export const EDITOR_THEMES = {
  'vs-dark': 'VS Dark (Default)',
  'vs-light': 'VS Light',
  'hc-black': 'High Contrast Dark',
  'hc-light': 'High Contrast Light',
} as const;

interface ThemeContextType {
  editorTheme: EditorTheme;
  appTheme: AppTheme;
  setEditorTheme: (theme: EditorTheme) => void;
  setAppTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [editorTheme, setEditorThemeState] = useState<EditorTheme>('vs-dark');
  const [appTheme, setAppThemeState] = useState<AppTheme>('dark');
  const [manualEditorOverride, setManualEditorOverride] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedEditorTheme = localStorage.getItem('editorTheme') as EditorTheme;
    const savedAppTheme = localStorage.getItem('appTheme') as AppTheme;
    const savedManualOverride = localStorage.getItem('manualEditorOverride') === 'true';

    if (savedEditorTheme) setEditorThemeState(savedEditorTheme);
    if (savedAppTheme) setAppThemeState(savedAppTheme);
    setManualEditorOverride(savedManualOverride);
  }, []);

  // Update body background when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = appTheme === 'dark' ? '#18181b' : '#ffffff';
      document.body.style.color = appTheme === 'dark' ? '#fafafa' : '#18181b';
    }
  }, [appTheme]);

  const setEditorTheme = (theme: EditorTheme) => {
    setEditorThemeState(theme);
    localStorage.setItem('editorTheme', theme);
    // User manually changed editor theme, set override flag
    setManualEditorOverride(true);
    localStorage.setItem('manualEditorOverride', 'true');
  };

  const setAppTheme = (theme: AppTheme) => {
    setAppThemeState(theme);
    localStorage.setItem('appTheme', theme);

    // Auto-update editor theme if user hasn't manually overridden it
    if (!manualEditorOverride) {
      const newEditorTheme: EditorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      setEditorThemeState(newEditorTheme);
      localStorage.setItem('editorTheme', newEditorTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ editorTheme, appTheme, setEditorTheme, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
