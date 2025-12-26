'use client';

import { Palette } from 'lucide-react';
import { useState } from 'react';
import { useTheme, EDITOR_THEMES, EditorTheme, AppTheme } from '../contexts/ThemeContext';

export default function ThemeSelector() {
  const { editorTheme, appTheme, setEditorTheme, setAppTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-700 rounded transition-colors"
        title="Theme Settings"
        data-testid="theme-selector-button"
      >
        <Palette size={18} className="text-white" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Theme Settings</h3>

            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-2 block">App Theme</label>
              <select
                value={appTheme}
                onChange={(e) => setAppTheme(e.target.value as AppTheme)}
                className="w-full bg-zinc-900 text-white text-sm rounded border border-zinc-600 px-3 py-2 focus:outline-none focus:border-blue-500"
                data-testid="app-theme-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 text-xs mb-2 block">Editor Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
                className="w-full bg-zinc-900 text-white text-sm rounded border border-zinc-600 px-3 py-2 focus:outline-none focus:border-blue-500"
                data-testid="editor-theme-select"
              >
                {Object.entries(EDITOR_THEMES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
