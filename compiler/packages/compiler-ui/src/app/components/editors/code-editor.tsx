'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Editor, Monaco } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import * as monaco from 'monaco-editor';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Play, 
  RotateCcw, 
  FileCode, 
  Maximize2, 
  Minimize2,
  Copy,
  Upload,
  Zap
} from 'lucide-react';

export interface EnhancedMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onRun?: () => void;
  isRunning?: boolean;
  className?: string;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  'c': 'c',
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'custom': 'javascript',
};

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  'c': '.c',
  'cpp': '.cpp',
  'java': '.java',
  'python': '.py',
  'javascript': '.js',
  'typescript': '.ts',
  'custom': '.comp',
};

export default function EnhancedMonacoEditor({
  value,
  onChange,
  language,
  onRun,
  isRunning = false,
  className = '',
  readOnly = false,
}: EnhancedMonacoEditorProps) {
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [selectionInfo, setSelectionInfo] = useState({ line: 1, column: 1 });
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const monacoLanguage = LANGUAGE_MAP[language] || 'javascript';
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  // Enhanced editor configuration
  const editorOptions = useMemo(() => ({
    minimap: { enabled: true, size: 'proportional' as const },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace",
    fontLigatures: true,
    lineNumbers: 'on' as const,
    renderWhitespace: 'selection' as const,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    foldingStrategy: 'auto' as const,
    showFoldingControls: 'always' as const,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: true,
    fixedOverflowWidgets: true,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      useShadows: false,
      verticalHasArrows: true,
      horizontalHasArrows: true,
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      verticalScrollbarSize: 17,
      horizontalScrollbarSize: 17,
    },
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never' as const,
      seedSearchStringFromSelection: 'always' as const,
    },
    readOnly,
    contextmenu: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on' as const,
    accessibilitySupport: 'auto' as const,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      bracketPairsHorizontal: true,
      highlightActiveBracketPair: true,
      indentation: true,
    },

    codeActionsOnSave: {},
    formatOnPaste: true,
    formatOnType: true,
  }), [readOnly]);

  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register enhanced custom themes
    monaco.editor.defineTheme('compiler-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7C7C7C', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'property', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#C9D1D9',
        'editorLineNumber.foreground': '#6E7681',
        'editorLineNumber.activeForeground': '#C9D1D9',
        'editorCursor.foreground': '#58A6FF',
        'editor.selectionBackground': '#264F78',
        'editor.selectionHighlightBackground': '#264F7880',
        'editor.lineHighlightBackground': '#161B22',
        'editorIndentGuide.background': '#21262D',
        'editorIndentGuide.activeBackground': '#30363D',
        'editorBracketMatch.background': '#3FB95040',
        'editorBracketMatch.border': '#3FB950',
        'editor.findMatchBackground': '#FFA50060',
        'editor.findMatchHighlightBackground': '#FFA50040',
        'editorWidget.background': '#161B22',
        'editorWidget.border': '#30363D',
        'editorSuggestWidget.background': '#161B22',
        'editorSuggestWidget.border': '#30363D',
        'editorSuggestWidget.selectedBackground': '#21262D',
      }
    });

    monaco.editor.defineTheme('compiler-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'operator', foreground: '000000' },
        { token: 'type', foreground: '267F99' },
        { token: 'function', foreground: '795E26' },
        { token: 'variable', foreground: '001080' },
        { token: 'property', foreground: '001080' },
        { token: 'constant', foreground: '0070C1' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#24292F',
        'editorLineNumber.foreground': '#656D76',
        'editorLineNumber.activeForeground': '#24292F',
        'editorCursor.foreground': '#044289',
        'editor.selectionBackground': '#0969DA20',
        'editor.selectionHighlightBackground': '#0969DA10',
        'editor.lineHighlightBackground': '#F6F8FA',
        'editorIndentGuide.background': '#D0D7DE',
        'editorIndentGuide.activeBackground': '#8C959F',
        'editorBracketMatch.background': '#34D05840',
        'editorBracketMatch.border': '#34D058',
        'editor.findMatchBackground': '#FFD33D60',
        'editor.findMatchHighlightBackground': '#FFD33D40',
        'editorWidget.background': '#F6F8FA',
        'editorWidget.border': '#D0D7DE',
        'editorSuggestWidget.background': '#FFFFFF',
        'editorSuggestWidget.border': '#D0D7DE',
        'editorSuggestWidget.selectedBackground': '#F6F8FA',
      }
    });

    // Apply theme based on current theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'compiler-dark' : 'compiler-light';
    monaco.editor.setTheme(currentTheme);

    // Set up custom language features for custom language
    if (language === 'custom') {
      monaco.languages.setMonarchTokensProvider('javascript', {
        tokenizer: {
          root: [
            [/\b(let|const|var|function|if|else|for|while|return|class|extends|import|export)\b/, 'keyword'],
            [/\b(true|false|null|undefined|this|super)\b/, 'keyword.literal'],
            [/\b\d+(\.\d+)?\b/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/`([^`\\]|\\.)*`/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*[\s\S]*?\*\//, 'comment'],
            [/[a-zA-Z_]\w*/, 'identifier'],
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/[;,.]/, 'delimiter'],
            [/[+\-*\/%=<>!&|^~?:]/, 'operator'],
          ],
        },
      });

      // Add completion provider
      monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          return {
            suggestions: [
              {
                label: 'let',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'let ${1:variable} = ${2:value};',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'function ${1:name}(${2:params}) {\n\t${3:// body}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'if',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'if (${1:condition}) {\n\t${2:// body}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'for',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (${1:let i = 0}; ${2:i < length}; ${3:i++}) {\n\t${4:// body}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'while',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'while (${1:condition}) {\n\t${2:// body}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'class',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3:// constructor body}\n\t}\n\n\t${4:// methods}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
              {
                label: 'console.log',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'console.log(${1:value});',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              },
            ],
          };
        },
      });
    }

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality
      const content = editor.getValue();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code${LANGUAGE_EXTENSIONS[language]}`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Update stats when content or selection changes
    const updateStats = () => {
      const model = editor.getModel();
      if (model) {
        setLineCount(model.getLineCount());
        
        // Calculate word count manually as getWordCount() might not be available
        const content = model.getValue();
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        setWordCount(words);
        
        const position = editor.getPosition();
        if (position) {
          setSelectionInfo({ line: position.lineNumber, column: position.column });
        }
      }
    };

    editor.onDidChangeModelContent(updateStats);
    editor.onDidChangeCursorPosition(updateStats);
    
    // Initial stats update
    updateStats();

    // Focus the editor
    editor.focus();
  }, [language, onRun]);

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  const handleCopy = useCallback(() => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editorRef.current.getModel()?.getValueInRange(selection);
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
        }
      } else {
        navigator.clipboard.writeText(value);
      }
    }
  }, [value]);

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const handleReset = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.setValue('');
      onChange('');
    }
  }, [onChange]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (editorRef.current) {
          editorRef.current.setValue(content);
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  }, [onChange]);

  // Effect to handle theme changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'compiler-dark' : 'compiler-light';
      monacoRef.current.editor.setTheme(currentTheme);
    }
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monacoRef.current && editorRef.current) {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'compiler-dark' : 'compiler-light';
        monacoRef.current.editor.setTheme(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Editor Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileCode className="h-4 w-4" />
              <span>Code Editor</span>
              <Badge variant="secondary" className="text-xs">
                {language.toUpperCase()}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Editor Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Ln {selectionInfo.line}, Col {selectionInfo.column}</span>
                <span>{lineCount} lines</span>
                <span>{wordCount} words</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  accept={`*${LANGUAGE_EXTENSIONS[language]}`}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  aria-label="Upload file"
                  title="Upload file"
                />
                <Button variant="ghost" size="icon" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleFormat}>
                  <Zap className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor Content */}
      <Card className="flex-1 rounded-t-none border-t-0">
        <CardContent className="p-0 h-full">
          <div className="h-full border rounded-b-lg overflow-hidden">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={value}
              onChange={handleChange}
              onMount={handleEditorDidMount}
              theme={editorTheme}
              options={editorOptions}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Loading VS Code Editor...</span>
                  </div>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor Footer */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Ready</span>
              {value.length > 0 && (
                <span>{value.length} characters</span>
              )}
            </div>
            
            {onRun && (
              <Button 
                onClick={onRun} 
                disabled={isRunning || !value.trim()}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-16 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
        <div className="space-y-1">
          <div>Ctrl+Enter: Run Code</div>
          <div>Ctrl+S: Save File</div>
          <div>F1: Command Palette</div>
        </div>
      </div>
    </div>
  );
}
