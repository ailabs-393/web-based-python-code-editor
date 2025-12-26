'use client';

import { Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export interface OutputLine {
  id: string;
  text: string;
  type: 'output' | 'error';
  timestamp: number;
}

interface OutputPanelProps {
  output: OutputLine[];
  onClear: () => void;
}

export default function OutputPanel({ output, onClear }: OutputPanelProps) {
  const { appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
      }`}>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Output
        </h3>
        <button
          onClick={onClear}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'
          }`}
          title="Clear Output"
          data-testid="clear-output-button"
        >
          <Trash2 size={14} className={isDark ? 'text-zinc-400' : 'text-gray-600'} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm" data-testid="output-content">
        {output.length === 0 ? (
          <div className={isDark ? 'text-zinc-500' : 'text-gray-500'}>
            No output yet. Run your code to see results here.
          </div>
        ) : (
          output.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap mb-1 ${
                line.type === 'error'
                  ? 'text-red-400'
                  : isDark ? 'text-zinc-300' : 'text-gray-900'
              }`}
            >
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
