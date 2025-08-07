export * from './compilers/BaseCompiler';
export * from './compilers/CppCompiler';
export * from './compilers/CCompiler';
export * from './compilers/JavaCompiler';

export type Language = 'cpp' | 'c' | 'java' | 'python';

export interface CompileOptions {
  sourceCode: string;
  language: Language;
  fileName?: string;
  optimize?: boolean;
  debug?: boolean;
  timeout?: number;
}

interface CompileResult {
  success: boolean;
  output?: string;
  error?: string;
  steps: Array<{
    name: string;
    output: string;
    success: boolean;
    duration: number;
    error?: string;
  }>;
}

export async function compileCode(options: CompileOptions): Promise<CompileResult> {
  const { 
    sourceCode, 
    language, 
    fileName = `main.${language}`,
    optimize = false, 
    debug = true,
    timeout = 30000 // 30 seconds default timeout (increased from 10s)
  } = options;
  
  // Create a temporary directory for compilation
  const workDir = `/tmp/compiler-sandbox-${Date.now()}`;
  
  try {
    let compiler;
    
    switch (language) {
      case 'cpp':
        const { createCppCompiler } = await import('./compilers/CppCompiler');
        compiler = createCppCompiler({
          sourceCode,
          fileName,
          workDir,
          optimize,
          debug
        });
        break;
        
      case 'c':
        const { createCCompiler } = await import('./compilers/CCompiler');
        compiler = createCCompiler({
          sourceCode,
          fileName,
          workDir,
          optimize,
          debug
        });
        break;
        
      case 'java':
        const { createJavaCompiler } = await import('./compilers/JavaCompiler');
        compiler = createJavaCompiler({
          sourceCode,
          fileName,
          workDir,
          optimize,
          debug
        });
        break;
        
      case 'python':
        const { createPythonInterpreter } = await import('./compilers/PythonInterpreter');
        compiler = createPythonInterpreter({
          sourceCode,
          fileName,
          workDir,
          optimize,
          debug
        });
        break;
        
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    
    // Set a timeout for the compilation process with cleanup
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<CompileResult>((_, reject) => {
      timeoutId = setTimeout(() => {
        // Clean up before rejecting with timeout
        if ('cleanup' in compiler) {
          (compiler as any).cleanup().catch(console.error);
        }
        reject(new Error(`Compilation timed out after ${timeout}ms. This might happen with large projects or slow systems.`));
      }, timeout);
    });
    
    // Run the compiler with timeout
    let result: CompileResult;
    try {
      result = await Promise.race([
        compiler.run(),
        timeoutPromise
      ]);
    } finally {
      // Clear the timeout if the compilation completes before timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    
    // Clean up temporary files
    if ('cleanup' in compiler) {
      await (compiler as any).cleanup().catch(console.error);
    }
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      steps: result.steps.map(step => ({
        name: step.name,
        output: step.output,
        success: step.success,
        duration: step.duration,
        error: step.error
      }))
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
      steps: [{
        name: 'Error',
        output: 'Compilation failed',
        success: false,
        duration: 0,
        error: errorMessage
      }]
    };
  }
}

// Utility function to check if a language is supported
export function isLanguageSupported(language: string): language is Language {
  return ['cpp', 'c', 'java', 'python'].includes(language);
}

// Utility function to get file extension for a language
export function getFileExtension(language: Language): string {
  switch (language) {
    case 'cpp': return 'cpp';
    case 'c': return 'c';
    case 'java': return 'java';
    case 'python': return 'py';
    default: return 'txt';
  }
}
