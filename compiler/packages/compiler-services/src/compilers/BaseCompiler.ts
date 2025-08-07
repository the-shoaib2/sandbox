export interface CompilationStep {
  name: string;
  output: string;
  success: boolean;
  duration: number;
  error?: string;
}

export interface CompilationResult {
  success: boolean;
  output?: string;
  error?: string;
  steps: CompilationStep[];
  binaryPath?: string;
}

export interface CompilerOptions {
  sourceCode: string;
  fileName: string;
  workDir: string;
  optimize?: boolean;
  debug?: boolean;
}

export abstract class BaseCompiler {
  protected options: CompilerOptions;
  protected steps: CompilationStep[] = [];

  constructor(options: CompilerOptions) {
    this.options = options;
  }

  protected addStep(name: string, output: string, success: boolean, error?: string, duration?: number): void {
    this.steps.push({
      name,
      output,
      success,
      error,
      duration: duration || 0,
    });
  }

  protected abstract preprocess(): Promise<boolean>;
  protected abstract compile(): Promise<boolean>;
  protected abstract link(): Promise<boolean>;
  protected abstract execute(): Promise<{ output: string; error?: string }>;

  public async run(): Promise<CompilationResult> {
    const startTime = Date.now();
    let success = true;
    let output = '';
    let error: string | undefined;

    try {
      success = await this.preprocess() && success;
      success = await this.compile() && success;
      success = await this.link() && success;
      
      if (success) {
        const result = await this.execute();
        output = result.output;
        error = result.error;
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      this.addStep('Error', error, false, error, Date.now() - startTime);
    }

    return {
      success,
      output,
      error,
      steps: this.steps,
    };
  }
}
