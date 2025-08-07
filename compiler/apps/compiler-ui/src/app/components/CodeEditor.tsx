'use client';

import { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  height?: string | number;
  options?: any;
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

  const handleEditorDidMount: OnMount = (editor) => {
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
    <div className={cn('overflow-hidden rounded-md border', className)}>
      <Editor
        height={height}
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
          ...options,
        }}
      />
    </div>
  );
}
