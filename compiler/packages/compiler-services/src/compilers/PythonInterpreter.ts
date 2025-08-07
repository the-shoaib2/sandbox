import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { BaseCompiler, CompilationStep, CompilerOptions } from './BaseCompiler';
import { executeCommand } from '../utils/exec';

export class PythonInterpreter extends BaseCompiler {
  private scriptPath: string;

  constructor(options: CompilerOptions) {
    super(options);
    this.scriptPath = join(this.options.workDir, this.options.fileName);
  }

  // Python is an interpreted language, so we don't have separate compilation/linking steps
  protected async preprocess(): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Ensure work directory exists
      await mkdir(this.options.workDir, { recursive: true });
      
      // Save source code to file
      await writeFile(this.scriptPath, this.options.sourceCode);
      
      this.addStep(
        'Preprocessing', 
        'Python script prepared for execution', 
        true, 
        undefined, 
        Date.now() - startTime
      );
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Preprocessing', 'Preprocessing failed', false, errorMsg, Date.now() - startTime);
      return false;
    }
  }

  // No compilation step for Python
  protected async compile(): Promise<boolean> {
    this.addStep('Compilation', 'Skipped (interpreted language)', true, undefined, 0);
    return true;
  }

  // No linking step for Python
  protected async link(): Promise<boolean> {
    this.addStep('Linking', 'Skipped (interpreted language)', true, undefined, 0);
    return true;
  }

  protected async execute(): Promise<{ output: string; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Execute the Python script
      const { stdout, stderr } = await executeCommand(
        `python3 ${this.scriptPath}`,
        this.options.workDir
      );
      
      const output = stdout || stderr;
      const hasError = stderr && !stderr.includes('DeprecationWarning:');
      
      this.addStep(
        'Execution',
        output || 'Python script executed without output',
        !hasError,
        hasError ? output : undefined,
        Date.now() - startTime
      );
      
      return { 
        output, 
        error: hasError ? output : undefined 
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Execution', 'Python execution failed', false, errorMsg, Date.now() - startTime);
      return { 
        output: '', 
        error: errorMsg 
      };
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Clean up the script file
      await unlink(this.scriptPath).catch(() => {});
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Factory function for creating Python interpreter instances
export function createPythonInterpreter(options: CompilerOptions): PythonInterpreter {
  return new PythonInterpreter({
    ...options,
    fileName: options.fileName.endsWith('.py') ? options.fileName : `${options.fileName}.py`
  });
}
