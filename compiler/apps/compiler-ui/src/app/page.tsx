'use client';

import { useState, useCallback, useEffect } from 'react';
import { Play, Loader2, Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Button } from './components/ui/button';
import { LanguageSelector, type LanguageType } from './components/LanguageSelector';
import { OutputPanel } from './components/OutputPanel';
import { DEFAULT_CODE_SNIPPETS } from '@/lib/constants';

// Dynamically import the CodeEditor component to avoid SSR issues with Monaco
const CodeEditor = dynamic(
  () => import('./components/CodeEditor').then((mod) => mod.CodeEditor),
  { ssr: false, loading: () => <div className="h-full bg-background rounded-md animate-pulse" /> }
);



interface CompilationStep {
  name: string;
  output: string;
  success: boolean;
  duration: number;
  error?: string;
}

export default function Home() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<LanguageType>('cpp');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [steps, setSteps] = useState<CompilationStep[]>([]);
  const { theme, setTheme } = useTheme();
  
  // Set initial code based on language
  useEffect(() => {
    setCode(DEFAULT_CODE_SNIPPETS[language]);
    setOutput('');
    setError('');
    setSteps([]);
  }, [language]);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to run');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');
    setSteps([]);

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: code,
          language,
          fileName: `main.${language}`,
          optimize: false,
          debug: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to compile code');
      }

      setOutput(result.output || '');
      setError(result.error || '');
      setSteps(result.steps || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    },
    [handleRunCode]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Compiler Sandbox</h1>
          <div className="flex items-center gap-4">
            <LanguageSelector value={language} onChange={setLanguage} />
            <Button
              onClick={handleRunCode}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run (Ctrl+Enter)
                </>
              )}
            </Button>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme('light')}
                className={theme === 'light' ? 'bg-accent' : ''}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme('dark')}
                className={theme === 'dark' ? 'bg-accent' : ''}
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme('system')}
                className={theme === 'system' ? 'bg-accent' : ''}
              >
                <Laptop className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code editor */}
        <div className="flex flex-col h-[calc(100vh-10rem)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {language.toUpperCase()} CODE
            </h2>
            <div className="text-xs text-muted-foreground">
              {code.length} characters
            </div>
          </div>
          <div className="flex-1" onKeyDown={handleKeyDown}>
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              height="100%"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
              }}
            />
          </div>
        </div>

        {/* Output panel */}
        <div className="flex flex-col h-[calc(100vh-10rem)]">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            OUTPUT
          </h2>
          <OutputPanel
            output={output}
            error={error}
            steps={steps}
            isRunning={isRunning}
            className="flex-1"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Compiler Sandbox - Run and test code in multiple languages</p>
          <p className="text-xs mt-1">
            Uses GCC for C/C++, OpenJDK for Java, and Python 3
          </p>
        </div>
      </footer>
    </div>
  );
}
