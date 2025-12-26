'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileTree from './components/FileTree';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import OutputPanel, { OutputLine } from './components/OutputPanel';
import ResizablePane from './components/ResizablePane';
import ThemeSelector from './components/ThemeSelector';
import { FileItem } from './types/file';
import { useTheme } from './contexts/ThemeContext';

const MonacoEditor = dynamic(() => import('./components/MonacoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-900 text-white">
      Loading editor...
    </div>
  ),
});

export default function Home() {
  const { editorTheme, appTheme } = useTheme();
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'main.py',
      content: '# Write your Python code here\nprint("Hello, World!")',
      isDirty: false,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState<string | null>('1');
  const [openFileIds, setOpenFileIds] = useState<string[]>(['1']);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleCreateFile = (fileName: string) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileName,
      content: '# New Python file\n',
      isDirty: false,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setOpenFileIds([...openFileIds, newFile.id]);
  };

  const handleFileClick = (fileId: string) => {
    setActiveFileId(fileId);
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds([...openFileIds, fileId]);
    }
  };

  const handleTabClick = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleTabClose = (fileId: string) => {
    const newOpenFileIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenFileIds);

    if (activeFileId === fileId) {
      const closedIndex = openFileIds.indexOf(fileId);
      if (newOpenFileIds.length > 0) {
        const newActiveId = newOpenFileIds[Math.max(0, closedIndex - 1)];
        setActiveFileId(newActiveId);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleCodeChange = (newContent: string) => {
    if (activeFileId) {
      setFiles(files.map(f =>
        f.id === activeFileId
          ? { ...f, content: newContent, isDirty: true }
          : f
      ));
    }
  };

  const handleSaveFile = () => {
    if (activeFileId) {
      setFiles(files.map(f =>
        f.id === activeFileId
          ? { ...f, isDirty: false }
          : f
      ));
    }
  };

  const handleDeleteFile = (fileId: string) => {
    // Remove file from files array
    setFiles(files.filter(f => f.id !== fileId));

    // Remove from open tabs
    const newOpenFileIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenFileIds);

    // Handle active file change if deleted file was active
    if (activeFileId === fileId) {
      if (newOpenFileIds.length > 0) {
        setActiveFileId(newOpenFileIds[0]);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;

    setIsRunning(true);
    setOutput([]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: activeFile.content,
          files: files.filter(f => f.id !== activeFileId).map(f => ({
            name: f.name,
            content: f.content,
          })),
        }),
      });

      const data = await response.json();

      const outputLines: OutputLine[] = [];

      if (data.output) {
        outputLines.push({
          id: Date.now().toString(),
          text: data.output,
          type: 'output',
          timestamp: Date.now(),
        });
      }

      if (data.error) {
        outputLines.push({
          id: (Date.now() + 1).toString(),
          text: data.error,
          type: 'error',
          timestamp: Date.now(),
        });
      }

      setOutput(outputLines);
    } catch (error) {
      setOutput([{
        id: Date.now().toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopCode = () => {
    setIsRunning(false);
    setOutput([...output, {
      id: Date.now().toString(),
      text: 'Execution stopped by user',
      type: 'error',
      timestamp: Date.now(),
    }]);
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, files]);

  return (
    <div className={`flex flex-col h-screen ${appTheme === 'light' ? 'bg-white' : 'bg-zinc-900'}`}>
      <header className={`flex items-center justify-between px-4 py-3 border-b ${
        appTheme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-zinc-800 border-zinc-700'
      }`}>
        <h1 className={`text-xl font-semibold ${appTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Python Code Compiler
        </h1>
        <ThemeSelector />
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          onRun={handleRunCode}
          onStop={handleStopCode}
          onToggleSidebar={handleToggleSidebar}
          isRunning={isRunning}
          isSidebarVisible={isSidebarVisible}
        />
        <div className="flex-1 flex overflow-hidden">
          {isSidebarVisible && (
            <FileTree
              files={files}
              activeFileId={activeFileId}
              onFileClick={handleFileClick}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TabBar
              files={files}
              openFileIds={openFileIds}
              activeFileId={activeFileId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
            />
            <ResizablePane
              left={
                <div className="h-full overflow-hidden">
                  {activeFile ? (
                    <MonacoEditor
                      key={activeFile.id}
                      value={activeFile.content}
                      onChange={handleCodeChange}
                      language="python"
                      theme={editorTheme}
                    />
                  ) : (
                    <div className={`flex items-center justify-center h-full ${
                      appTheme === 'light' ? 'text-gray-500' : 'text-zinc-500'
                    }`}>
                      No file selected. Create or open a file to start coding.
                    </div>
                  )}
                </div>
              }
              right={
                <OutputPanel output={output} onClear={handleClearOutput} />
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
