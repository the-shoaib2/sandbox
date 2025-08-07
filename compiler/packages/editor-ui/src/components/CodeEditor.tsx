'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '../lib/utils';
import { OnMount } from '@monaco-editor/react';
import { Loader2 } from '../lib/icons';

// Define the Editor type from @monaco-editor/react
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.Editor as any), {
  ssr: false,
  loading: () => <div className="h-full bg-background rounded-md animate-pulse" />,
}) as any; // Temporary any to bypass type issues with dynamic import

export interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  height?: string | number;
  options?: Record<string, unknown>;
}

export function CodeEditor({
  language,
  value,
  onChange,
  className,
  readOnly = false,
  height = '100%',
  options = {},
}: CodeEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditorDidMount: OnMount = editor => {
    editorRef.current = editor;
    // Add custom keybindings or other editor setup here
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  if (!isMounted) {
    return (
      <div className={cn('flex items-center justify-center bg-[#1e1e1e]', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-hidden rounded-md border">
        <Editor
          height={height === '100%' ? '100%' : height}
          defaultLanguage={language}
          language={language}
          theme="vs-dark"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            readOnly,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            ...options,
          }}
        />
      </div>
    </div>
  );
}
