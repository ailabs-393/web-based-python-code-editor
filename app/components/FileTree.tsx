'use client';

import { useState } from 'react';
import { FileItem } from '../types/file';
import { File, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface FileTreeProps {
  files: FileItem[];
  activeFileId: string | null;
  onFileClick: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export default function FileTree({
  files,
  activeFileId,
  onFileClick,
  onCreateFile,
  onDeleteFile,
}: FileTreeProps) {
  const { appTheme } = useTheme();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.endsWith('.py') ? newFileName : `${newFileName}.py`;
      onCreateFile(fileName);
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setIsCreatingFile(false);
      setNewFileName('');
    }
  };

  const handleDeleteClick = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(fileId);
  };

  const confirmDelete = (fileId: string) => {
    onDeleteFile(fileId);
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const isDark = appTheme === 'dark';

  return (
    <div className={`w-64 border-r flex flex-col ${
      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
    }`}>
      <div className={`flex items-center justify-between p-3 border-b ${
        isDark ? 'border-zinc-700' : 'border-gray-300'
      }`}>
        <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Files</h2>
        <button
          onClick={() => setIsCreatingFile(true)}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-zinc-700 text-white' : 'hover:bg-gray-200 text-gray-900'
          }`}
          title="New File"
          data-testid="new-file-button"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isCreatingFile && (
          <div className="p-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreateFile}
              placeholder="filename.py"
              className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:border-blue-500 ${
                isDark
                  ? 'bg-zinc-900 text-white border-zinc-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              autoFocus
              data-testid="new-file-input"
            />
          </div>
        )}

        {files.length === 0 && !isCreatingFile && (
          <div className={`p-4 text-center text-sm ${
            isDark ? 'text-zinc-500' : 'text-gray-500'
          }`}>
            No files yet. Click + to create one.
          </div>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onFileClick(file.id)}
            onMouseEnter={() => setHoveredFileId(file.id)}
            onMouseLeave={() => setHoveredFileId(null)}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors relative
              ${activeFileId === file.id
                ? isDark ? 'bg-zinc-700 text-white' : 'bg-gray-200 text-gray-900'
                : isDark ? 'text-zinc-300 hover:bg-zinc-700' : 'text-gray-700 hover:bg-gray-200'
              }
            `}
            data-testid={`file-item-${file.name}`}
          >
            <File size={14} />
            <span className="text-sm truncate flex-1">{file.name}</span>
            {file.isDirty && <span className="text-blue-400 text-xs">●</span>}
            {hoveredFileId === file.id && (
              <button
                onClick={(e) => handleDeleteClick(file.id, e)}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-zinc-600' : 'hover:bg-gray-300'
                }`}
                title="Delete file"
                data-testid={`delete-button-${file.name}`}
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {deleteConfirmId && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border rounded-lg p-4 max-w-sm mx-4 ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-300'
          }`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Delete File?
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
              Are you sure you want to delete &quot;{files.find(f => f.id === deleteConfirmId)?.name}&quot;?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  isDark
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
                data-testid="delete-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                data-testid="delete-confirm-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
