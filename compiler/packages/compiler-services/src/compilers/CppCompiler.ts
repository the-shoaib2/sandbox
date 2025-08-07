import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { BaseCompiler, CompilationStep, CompilerOptions } from './BaseCompiler';
import { executeCommand } from '../utils/exec';

export class CppCompiler extends BaseCompiler {
  private executablePath: string;
  private objectPath: string;

  constructor(options: CompilerOptions) {
    super(options);
    const baseName = this.options.fileName.replace(/\.(cpp|c\+\+|c)$/i, '');
    this.executablePath = join(this.options.workDir, `${baseName}.out`);
    this.objectPath = join(this.options.workDir, `${baseName}.o`);
  }

  protected async preprocess(): Promise<boolean> {
    const startTime = Date.now();
    const sourcePath = join(this.options.workDir, this.options.fileName);
    
    try {
      // Ensure work directory exists
      await mkdir(this.options.workDir, { recursive: true });
      
      // Save source code to file
      await writeFile(sourcePath, this.options.sourceCode);
      
      // Preprocess the source code
      const preprocessCmd = `g++ -E ${sourcePath} -o ${sourcePath}.i`;
      await executeCommand(preprocessCmd, this.options.workDir);
      
      const preprocessOutput = `Preprocessed ${this.options.fileName} successfully`;
      this.addStep('Preprocessing', preprocessOutput, true, undefined, Date.now() - startTime);
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Preprocessing', 'Preprocessing failed', false, errorMsg, Date.now() - startTime);
      return false;
    }
  }

  protected async compile(): Promise<boolean> {
    const startTime = Date.now();
    const sourcePath = join(this.options.workDir, this.options.fileName);
    
    try {
      // Compile to object file
      const compileCmd = [
        'g++',
        '-c',
        this.options.debug ? '-g' : '',
        this.options.optimize ? '-O2' : '',
        '-o', this.objectPath,
        sourcePath,
        '-fdiagnostics-color=always'
      ].filter(Boolean).join(' ');
      
      const { stdout, stderr } = await executeCommand(compileCmd, this.options.workDir);
      
      const output = stdout || stderr;
      const success = !stderr.includes('error:');
      
      this.addStep(
        'Compilation',
        output || 'Compilation completed without output',
        success,
        success ? undefined : output,
        Date.now() - startTime
      );
      
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Compilation', 'Compilation failed', false, errorMsg, Date.now() - startTime);
      return false;
    }
  }

  protected async link(): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Link object file to create executable
      const linkCmd = [
        'g++',
        '-o', this.executablePath,
        this.objectPath,
        this.options.debug ? '-g' : '',
        this.options.optimize ? '-O2' : ''
      ].filter(Boolean).join(' ');
      
      const { stdout, stderr } = await executeCommand(linkCmd, this.options.workDir);
      
      const output = stdout || stderr;
      const success = !stderr.includes('error:');
      
      this.addStep(
        'Linking',
        output || 'Linking completed without output',
        success,
        success ? undefined : output,
        Date.now() - startTime
      );
      
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Linking', 'Linking failed', false, errorMsg, Date.now() - startTime);
      return false;
    }
  }

  protected async execute(): Promise<{ output: string; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Execute the compiled program
      const { stdout, stderr } = await executeCommand(
        `./${this.executablePath.split('/').pop()}`,
        this.options.workDir
      );
      
      const output = stdout || stderr;
      const success = !stderr.includes('error:');
      
      this.addStep(
        'Execution',
        output || 'Program executed without output',
        success,
        success ? undefined : output,
        Date.now() - startTime
      );
      
      return { output, error: success ? undefined : output };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.addStep('Execution', 'Execution failed', false, errorMsg, Date.now() - startTime);
      return { output: '', error: errorMsg };
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Clean up temporary files
      await Promise.all([
        unlink(this.objectPath).catch(() => {}),
        unlink(this.executablePath).catch(() => {}),
        unlink(`${join(this.options.workDir, this.options.fileName)}.i`).catch(() => {})
      ]);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Factory function for creating C++ compiler instances
export function createCppCompiler(options: CompilerOptions): CppCompiler {
  return new CppCompiler({
    ...options,
    fileName: options.fileName.endsWith('.cpp') ? options.fileName : `${options.fileName}.cpp`
  });
}
