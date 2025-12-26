'use client';

import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}

export default function MonacoEditor({
  value = '',
  onChange,
  language = 'python',
  theme = 'vs-dark'
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create the Monaco editor instance
    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 4,
      insertSpaces: true,
    });

    editorInstanceRef.current = editor;

    // Listen for content changes
    if (onChange) {
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue();
        onChange(newValue);
      });
    }

    return () => {
      editor.dispose();
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value);
    }
  }, [value]);

  // Update editor theme when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full"
      data-testid="monaco-editor"
    />
  );
}
