'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Component imports
import EnhancedHeader from './components/layout/enhanced-header';
import EnhancedMonacoEditor from './components/editors/code-editor';
import CompilerPhasesPanel from './components/visualizers/compiler-phases-panel';
import EnhancedOutputPanel from './components/visualizers/enhanced-output-panel';
import { type Language } from './components/ui/language-selector';

// Import simple pipeline as fallback
import SimplePipeline from './components/visualizers/simple-pipeline';

// Dynamic import for React Flow (with fallback)
const ReactFlowPipeline = dynamic(
  () => import('./components/visualizers/react-flow-pipeline').catch(() => ({ default: SimplePipeline })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <SimplePipeline phases={[]} selectedPhase={null} onPhaseSelect={() => {}} />
      </div>
    )
  }
);

export interface CompilerPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: string;
  error?: string | null;
  startTime?: number;
  endTime?: number;
  duration?: number;
  command?: string;
  details?: string;
}

// Default code snippets for different languages
const DEFAULT_CODE_SNIPPETS: Record<Language, string> = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  java: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  python: `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  custom: `let x = 42;

let y = "Hello, World!";
function greet(name) {
    return "Hello, " + name;
}
let result = greet(y);`
};

// Language-specific compiler phases
const LANGUAGE_PHASES: Record<Language, CompilerPhase[]> = {
  c: [
    { 
      id: 'preprocessor', 
      name: 'Preprocessor', 
      description: 'Processes #include, #define, and other preprocessor directives',
      status: 'pending',
      command: 'gcc -E',
      details: 'Expands macros and includes header files into a single translation unit.'
    },
    { 
      id: 'lexical', 
      name: 'Lexical Analysis', 
      description: 'Converts source code into tokens',
      status: 'pending',
      details: 'Breaks down the source code into meaningful symbols like keywords, identifiers, and operators.'
    },
    { 
      id: 'syntax', 
      name: 'Syntax Analysis', 
      description: 'Parses tokens into an Abstract Syntax Tree (AST)',
      status: 'pending',
      details: 'Analyzes the grammatical structure and builds a tree representation of the code.'
    },
    { 
      id: 'semantic', 
      name: 'Semantic Analysis', 
      description: 'Checks for semantic correctness and type checking',
      status: 'pending',
      details: 'Verifies variable declarations, type compatibility, and other semantic rules.'
    },
    { 
      id: 'ir', 
      name: 'IR Generation', 
      description: 'Generates Intermediate Representation',
      status: 'pending',
      details: 'Converts AST into platform-independent intermediate code for optimization.'
    },
    { 
      id: 'optimization', 
      name: 'Optimization', 
      description: 'Optimizes the intermediate representation',
      status: 'pending',
      details: 'Applies various optimization techniques to improve performance and reduce code size.'
    },
    { 
      id: 'codegen', 
      name: 'Code Generation', 
      description: 'Generates target machine code',
      status: 'pending',
      command: 'gcc -S',
      details: 'Converts optimized IR into assembly or machine code for the target architecture.'
    }
  ],
  cpp: [
    { 
      id: 'preprocessor', 
      name: 'Preprocessor', 
      description: 'Processes #include, #define, and other preprocessor directives',
      status: 'pending',
      command: 'g++ -E',
      details: 'Expands macros and includes header files, handling C++ specific features.'
    },
    { 
      id: 'lexical', 
      name: 'Lexical Analysis', 
      description: 'Converts source code into tokens',
      status: 'pending',
      details: 'Tokenizes C++ keywords, operators, and identifiers including namespaces.'
    },
    { 
      id: 'syntax', 
      name: 'Syntax Analysis', 
      description: 'Parses tokens into an Abstract Syntax Tree (AST)',
      status: 'pending',
      details: 'Builds AST supporting C++ features like classes, templates, and overloading.'
    },
    { 
      id: 'semantic', 
      name: 'Semantic Analysis', 
      description: 'C++ semantic checking and template instantiation',
      status: 'pending',
      details: 'Handles C++ specific semantics like function overloading and template resolution.'
    },
    { 
      id: 'ir', 
      name: 'IR Generation', 
      description: 'Generates Intermediate Representation',
      status: 'pending',
      details: 'Creates IR that handles C++ object model and virtual functions.'
    },
    { 
      id: 'optimization', 
      name: 'Optimization', 
      description: 'C++ specific optimizations',
      status: 'pending',
      details: 'Applies optimizations like inlining, devirtualization, and template specialization.'
    },
    { 
      id: 'codegen', 
      name: 'Code Generation', 
      description: 'Generates optimized machine code',
      status: 'pending',
      command: 'g++ -S',
      details: 'Generates assembly code with C++ runtime support and exception handling.'
    }
  ],
  java: [
    { 
      id: 'lexical', 
      name: 'Lexical Analysis', 
      description: 'Tokenizes Java source code',
      status: 'pending',
      details: 'Breaks Java source into tokens including keywords, identifiers, and literals.'
    },
    { 
      id: 'syntax', 
      name: 'Syntax Analysis', 
      description: 'Parses tokens into AST',
      status: 'pending',
      details: 'Creates AST following Java grammar rules and object-oriented structure.'
    },
    { 
      id: 'semantic', 
      name: 'Semantic Analysis', 
      description: 'Type checking and symbol resolution',
      status: 'pending',
      details: 'Verifies Java type safety, inheritance rules, and access modifiers.'
    },
    { 
      id: 'bytecode', 
      name: 'Bytecode Generation', 
      description: 'Generates Java bytecode',
      status: 'pending',
      command: 'javac',
      details: 'Compiles to platform-independent Java bytecode for JVM execution.'
    }
  ],
  python: [
    { 
      id: 'lexical', 
      name: 'Lexical Analysis', 
      description: 'Tokenizes Python source code',
      status: 'pending',
      details: 'Handles Python-specific tokens including indentation and string literals.'
    },
    { 
      id: 'syntax', 
      name: 'Syntax Analysis', 
      description: 'Parses into AST',
      status: 'pending',
      details: 'Creates AST handling Python\'s indentation-based syntax and dynamic features.'
    },
    { 
      id: 'compilation', 
      name: 'Bytecode Compilation', 
      description: 'Compiles to Python bytecode',
      status: 'pending',
      command: 'python -m py_compile',
      details: 'Generates Python bytecode for interpretation by the Python virtual machine.'
    },
    { 
      id: 'interpretation', 
      name: 'Interpretation', 
      description: 'Executes bytecode',
      status: 'pending',
      command: 'python',
      details: 'Interprets bytecode with dynamic type checking and runtime optimization.'
    }
  ],
  custom: [
    { 
      id: 'lexical', 
      name: 'Lexical Analysis', 
      description: 'Tokenizes source code into meaningful symbols',
      status: 'pending',
      details: 'Converts raw source code into tokens like keywords, identifiers, operators, and literals.'
    },
    { 
      id: 'syntax', 
      name: 'Syntax Analysis', 
      description: 'Parses tokens into Abstract Syntax Tree',
      status: 'pending',
      details: 'Analyzes the grammatical structure and creates a hierarchical tree representation.'
    },
    { 
      id: 'semantic', 
      name: 'Semantic Analysis', 
      description: 'Performs semantic validation and type checking',
      status: 'pending',
      details: 'Validates variable declarations, type compatibility, and enforces language semantics.'
    },
    { 
      id: 'ir', 
      name: 'IR Generation', 
      description: 'Generates Intermediate Representation',
      status: 'pending',
      details: 'Converts AST into an intermediate form suitable for optimization and code generation.'
    },
    { 
      id: 'optimization', 
      name: 'Optimization', 
      description: 'Optimizes the intermediate representation',
      status: 'pending',
      details: 'Applies optimization techniques like constant folding, dead code elimination, and loop optimization.'
    },
    { 
      id: 'codegen', 
      name: 'Code Generation', 
      description: 'Converts IR to target machine code',
      status: 'pending',
      details: 'Converts optimized IR into target assembly or machine code for execution.'
    }
  ]
};

export default function Home() {
  // State management
  const [language, setLanguage] = useState<Language>('custom');
  const [code, setCode] = useState<string>('');
  const [phases, setPhases] = useState<CompilerPhase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<CompilerPhase | null>(null);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [parseTreeData, setParseTreeData] = useState<object | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Memoized language phases
  const languagePhases = useMemo(() => LANGUAGE_PHASES, []);

  // Reset phases to initial state
  const resetPhases = useCallback((): CompilerPhase[] => {
    const currentLanguagePhases = languagePhases[language] || [];
    const newPhases = currentLanguagePhases.map(phase => ({
      ...phase,
      status: 'pending' as const,
      output: '',
      error: null,
      startTime: undefined,
      endTime: undefined,
      duration: undefined,
      command: phase.command || ''
    }));
    
    return newPhases;
  }, [language, languagePhases]);

  // Initialize code and phases when language changes
  useEffect(() => {
    setCode(DEFAULT_CODE_SNIPPETS[language] || '');
    
    // Create new phases directly to avoid circular dependency
    const currentLanguagePhases = languagePhases[language] || [];
    const newPhases = currentLanguagePhases.map(phase => ({
      ...phase,
      status: 'pending' as const,
      output: '',
      error: null,
      startTime: undefined,
      endTime: undefined,
      duration: undefined,
      command: phase.command || ''
    }));
    
    setPhases(newPhases);
    // Set the first phase as selected by default
    if (newPhases.length > 0) {
      setSelectedPhase(newPhases[0]);
    }
    setOutput('');
    setError('');
  }, [language, languagePhases]);

  // Handle phase selection
  const handlePhaseSelect = useCallback((phase: CompilerPhase) => {
    setSelectedPhase(phase);
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
  }, []);

  // Handle code change
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  // Handle running the code with real compiler integration
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    
    try {
      // Reset states
      setIsRunning(true);
      setOutput('');
      setError(null);
      setParseTreeData(null);
      
      // Reset all phases to pending
      const initialPhases = resetPhases();
      setPhases(initialPhases);
      if (initialPhases.length > 0) {
        setSelectedPhase(initialPhases[0]);
      }
      
      try {
        // Call the real compiler API
        const response = await fetch('/api/compile-phases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceCode: code,
            language: language,
            fileName: `main.${language === 'cpp' ? 'cpp' : language}`,
            optimize: false,
            debug: true
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Update phases with real compilation data
          if (result.phases && Array.isArray(result.phases)) {
            const updatedPhases = result.phases.map((phaseData: Partial<CompilerPhase>) => ({
              id: phaseData.id || '',
              name: phaseData.name || '',
              description: phaseData.description || '',
              status: (phaseData.status as CompilerPhase['status']) || 'completed',
              output: phaseData.output || '',
              error: phaseData.error || null,
              startTime: phaseData.startTime || Date.now(),
              endTime: phaseData.endTime || Date.now(),
              duration: phaseData.duration || Math.random() * 100,
              command: phaseData.command || '',
              details: phaseData.details || '',
            }));
            setPhases(updatedPhases);
            
            // Select the first phase by default
            if (updatedPhases.length > 0) {
              setSelectedPhase(updatedPhases[0]);
            }
          }
          
          // Set compilation output
          setOutput(result.output || 'Compilation completed successfully!');
          
          // Set AST data if available
          if (result.astData) {
            setParseTreeData(result.astData);
          }
        } else {
          setError(result.error || 'Compilation failed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Network error occurred');
        setError(`Network error: ${error.message}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(`Fatal error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, code, language, resetPhases]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Enhanced Header */}
      <EnhancedHeader
        selectedLanguage={language}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        isRunning={isRunning}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto p-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-6 h-full">
            {/* Code Editor - Left Column */}
            <div className="lg:col-span-1 xl:col-span-5 h-full min-h-[400px] lg:min-h-0">
              <div className="h-full rounded-lg border bg-card overflow-hidden">
                <div className="h-full">
                  <EnhancedMonacoEditor
                    value={code}
                    onChange={handleCodeChange}
                    language={language}
                    onRun={handleRunCode}
                    isRunning={isRunning}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Phases, Pipeline and Output */}
            <div className="lg:col-span-1 xl:col-span-7 h-full flex flex-col gap-4">
              {/* Pipeline Visualization - Top */}
              <div className="flex-1 min-h-[300px]">
                <div className="h-full rounded-lg border bg-card overflow-hidden">
                  <div className="p-4 border-b bg-card">
                    <h3 className="font-semibold text-sm">Compilation Pipeline</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Interactive visualization of compiler phases
                    </p>
                  </div>
                  <div className="h-[calc(100%-4rem)]">
                    <ReactFlowPipeline
                      phases={phases}
                      selectedPhase={selectedPhase}
                      onPhaseSelect={handlePhaseSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row - Phases List and Output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
                {/* Compiler Phases Panel */}
                <div className="h-full">
                  <CompilerPhasesPanel
                    phases={phases}
                    selectedPhase={selectedPhase}
                    onPhaseSelect={handlePhaseSelect}
                    isRunning={isRunning}
                  />
                </div>

                {/* Output Panel */}
                <div className="h-full">
                  <EnhancedOutputPanel
                    selectedPhase={selectedPhase}
                    output={output}
                    error={error}
                    parseTreeData={parseTreeData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}