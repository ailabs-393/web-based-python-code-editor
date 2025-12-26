'use client';

import { FileItem } from '../types/file';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TabBarProps {
  files: FileItem[];
  openFileIds: string[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
}

export default function TabBar({
  files,
  openFileIds,
  activeFileId,
  onTabClick,
  onTabClose,
}: TabBarProps) {
  const { appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  const openFiles = openFileIds
    .map(id => files.find(f => f.id === id))
    .filter((f): f is FileItem => f !== undefined);

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center border-b overflow-x-auto ${
      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
    }`}>
      {openFiles.map(file => (
        <div
          key={file.id}
          className={`
            flex items-center gap-2 px-4 py-2 border-r cursor-pointer transition-colors min-w-0
            ${isDark ? 'border-zinc-700' : 'border-gray-300'}
            ${activeFileId === file.id
              ? isDark ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'
              : isDark ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-600 hover:bg-gray-200'
            }
          `}
          onClick={() => onTabClick(file.id)}
          data-testid={`tab-${file.name}`}
        >
          <span className="truncate max-w-[150px]">
            {file.name}
            {file.isDirty && <span className="ml-1 text-blue-400">●</span>}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(file.id);
            }}
            className={`rounded p-0.5 flex-shrink-0 ${
              isDark ? 'hover:bg-zinc-600' : 'hover:bg-gray-300'
            }`}
            aria-label={`Close ${file.name}`}
            data-testid={`close-tab-${file.name}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
