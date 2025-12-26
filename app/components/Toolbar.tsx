'use client';

import { Play, Square, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onToggleSidebar: () => void;
  isRunning: boolean;
  isSidebarVisible: boolean;
}

export default function Toolbar({
  onRun,
  onStop,
  onToggleSidebar,
  isRunning,
  isSidebarVisible
}: ToolbarProps) {
  const { appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  return (
    <div className={`flex items-center gap-2 px-4 py-2 border-b ${
      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
    }`}>
      <button
        onClick={onToggleSidebar}
        className={`p-2 rounded transition-colors ${
          isDark ? 'hover:bg-zinc-700 text-white' : 'hover:bg-gray-200 text-gray-900'
        }`}
        title={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        data-testid="toggle-sidebar-button"
      >
        <Menu size={18} />
      </button>
      <div className={`w-px h-6 mx-1 ${isDark ? 'bg-zinc-700' : 'bg-gray-300'}`} />
      <button
        onClick={onRun}
        disabled={isRunning}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded transition-colors
          ${isRunning
            ? isDark
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
        data-testid="run-button"
      >
        <Play size={14} />
        <span className="text-sm font-medium">Run</span>
      </button>
      <button
        onClick={onStop}
        disabled={!isRunning}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded transition-colors
          ${!isRunning
            ? isDark
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
          }
        `}
        data-testid="stop-button"
      >
        <Square size={14} />
        <span className="text-sm font-medium">Stop</span>
      </button>
    </div>
  );
}
