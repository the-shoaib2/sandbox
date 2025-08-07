import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { BaseCompiler, CompilationStep, CompilerOptions } from './BaseCompiler';
import { executeCommand } from '../utils/exec';

export class JavaCompiler extends BaseCompiler {
  private className: string;
  private classPath: string;

  constructor(options: CompilerOptions) {
    super(options);
    this.className = this.extractClassName() || 'Main';
    this.classPath = join(this.options.workDir, `${this.className}.class`);
  }

  private extractClassName(): string | null {
    // Simple regex to extract class name from Java source
    const classMatch = this.options.sourceCode.match(/class\s+([A-Za-z_$][A-Za-z\d_$]*)/);
    return classMatch ? classMatch[1] : null;
  }

  protected async preprocess(): Promise<boolean> {
    const startTime = Date.now();
    const sourcePath = join(this.options.workDir, `${this.className}.java`);
    
    try {
      // Ensure work directory exists
      await mkdir(this.options.workDir, { recursive: true });
      
      // Save source code to file
      await writeFile(sourcePath, this.options.sourceCode);
      
      this.addStep(
        'Preprocessing', 
        'Java source file prepared for compilation', 
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

  protected async compile(): Promise<boolean> {
    const startTime = Date.now();
    const sourcePath = join(this.options.workDir, `${this.className}.java`);
    
    try {
      // Compile Java source file
      const compileCmd = [
        'javac',
        this.options.debug ? '-g' : '',
        this.options.optimize ? '-O' : '',
        '-Xlint:all',
        sourcePath
      ].filter(Boolean).join(' ');
      
      const { stdout, stderr } = await executeCommand(compileCmd, this.options.workDir);
      
      const output = stdout || stderr;
      const success = !stderr.includes('error:');
      
      this.addStep(
        'Compilation',
        output || 'Java compilation completed without output',
        success,
        success ? undefined : output,
        Date.now() - startTime
      );
      
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Compilation', 'Java compilation failed', false, errorMsg, Date.now() - startTime);
      return false;
    }
  }

  // Java doesn't have a separate linking step like C/C++
  protected async link(): Promise<boolean> {
    this.addStep('Linking', 'No linking required for Java', true, undefined, 0);
    return true;
  }

  protected async execute(): Promise<{ output: string; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Execute the compiled Java program
      const { stdout, stderr } = await executeCommand(
        `java -cp ${this.options.workDir} ${this.className}`,
        this.options.workDir
      );
      
      const output = stdout || stderr;
      const success = !stderr.includes('Exception');
      
      this.addStep(
        'Execution',
        output || 'Java program executed without output',
        success,
        success ? undefined : output,
        Date.now() - startTime
      );
      
      return { 
        output, 
        error: success ? undefined : output 
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Execution', 'Java execution failed', false, errorMsg, Date.now() - startTime);
      return { 
        output: '', 
        error: errorMsg 
      };
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Clean up compiled class files
      await unlink(this.classPath).catch(() => {});
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Factory function for creating Java compiler instances
export function createJavaCompiler(options: CompilerOptions): JavaCompiler {
  return new JavaCompiler({
    ...options,
    fileName: options.fileName.endsWith('.java') ? options.fileName : `${options.fileName}.java`
  });
}
