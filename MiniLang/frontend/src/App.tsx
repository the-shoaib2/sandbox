import React, { useState, useCallback } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { CompilerResults } from '@/components/CompilerResults';
import { StatusPanel } from '@/components/StatusPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Github, 
  Book,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CompilationResult {
  success: boolean;
  tokens: any[];
  ast: string | null;
  intermediateCode: Array<{ line: number; instruction: string }>;
  symbolTable: Record<string, any>;
  execution?: {
    success: boolean;
    output: any[];
    variables: Record<string, any>;
    errors: Array<{ type: string; message: string }>;
  };
  errors: Array<{ type: string; message: string; line?: number; column?: number; phase?: string }>;
  warnings: Array<{ type: string; message: string; line?: number; column?: number }>;
}

const DEFAULT_MINILANG_CODE = `// Welcome to MiniLang!
// A simple programming language for learning compiler design

let x = 10;
let y = 20;
let result = x + y * 2;
print result;

// Try modifying the code and click Compile!`;

function App() {
  const [code, setCode] = useState(DEFAULT_MINILANG_CODE);
  const [language, setLanguage] = useState('minilang');
  const [theme, setTheme] = useState('vs-dark');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [status, setStatus] = useState<'ready' | 'compiling' | 'success' | 'error'>('ready');

  const handleCompile = useCallback(async () => {
    if (language !== 'minilang') return;
    
    setIsCompiling(true);
    setStatus('compiling');
    
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const result = await response.json();
      setCompilationResult(result);
      setStatus(result.success ? 'success' : 'error');
    } catch (error) {
      console.error('Compilation failed:', error);
      setStatus('error');
      setCompilationResult({
        success: false,
        tokens: [],
        ast: null,
        intermediateCode: [],
        symbolTable: {},
        errors: [{ type: 'Network Error', message: 'Failed to connect to compiler service' }],
        warnings: []
      });
    } finally {
      setIsCompiling(false);
    }
  }, [code, language]);

  const handleClear = useCallback(() => {
    setCode('');
    setCompilationResult(null);
    setStatus('ready');
  }, []);

  const handleLoadExample = useCallback(async () => {
    if (language !== 'minilang') return;
    
    try {
      const response = await fetch(`/api/examples/${language}`);
      const examples = await response.json();
      if (examples.length > 0) {
        setCode(examples[0].code);
        setCompilationResult(null);
        setStatus('ready');
      }
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  }, [language]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    setCompilationResult(null);
    setStatus('ready');
    
    if (newLanguage === 'minilang') {
      setCode(DEFAULT_MINILANG_CODE);
    } else {
      setCode(`// ${newLanguage.toUpperCase()} code editor\n// Compilation is only available for MiniLang\n\nconsole.log("Hello, World!");`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MiniLang Compiler
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Interactive compiler with multi-language support
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <Book className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Column - Code Editor */}
          <div className="lg:col-span-2">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              theme={theme}
              onThemeChange={setTheme}
              onCompile={handleCompile}
              onClear={handleClear}
              onLoadExample={handleLoadExample}
              isCompiling={isCompiling}
            />
          </div>

          {/* Right Column - Results and Status */}
          <div className="space-y-6">
            {/* Status Panel */}
            <StatusPanel
              status={status}
              errors={compilationResult?.errors || []}
              warnings={compilationResult?.warnings || []}
            />

            {/* Quick Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Enter</kbd>
                  <span className="text-muted-foreground">Compile code</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
                  <span className="text-muted-foreground">Format code</span>
                </div>
                <div className="text-muted-foreground text-xs mt-3">
                  MiniLang supports variables, arithmetic, and print statements. 
                  Switch to other languages for syntax highlighting only.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Compilation Results */}
        {(compilationResult || isCompiling) && (
          <div className="mt-6">
            <CompilerResults result={compilationResult} isCompiling={isCompiling} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 MiniLang Compiler</span>
              <span>Built with React, Monaco Editor & Shadcn UI</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
