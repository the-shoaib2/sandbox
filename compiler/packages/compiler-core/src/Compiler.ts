import { tokenize } from './lexer/Lexer';
import { parse } from './parser/Parser';
import { analyze } from './semantic/SemanticAnalyzer';
import { generateIR } from './ir/IRGenerator';
import { generateX86_64 } from './codegen/x86_64';
import type { Token, SourceLocation, Node } from './types/unified';
import type { Program } from './parser/Parser';
import { IRInstruction } from './ir/IRGenerator';

type StepFunction<T = any> = () => Promise<T> | T;

export interface CompilerStep {
  name: string;
  description: string;
  input?: any;
  output?: any;
  duration: number;
  success: boolean;
  error?: string;
  startTime?: bigint;
}

export interface CompilerResult {
  success: boolean;
  output?: string;
  steps: CompilerStep[];
  errors: CompilerError[];
  warnings: CompilerWarning[];
  sourceMap?: any;
  duration: number;
}

export interface CompilerError {
  message: string;
  location?: SourceLocation;
  code: string;
  severity: 'error' | 'warning';
}

export interface CompilerWarning extends Omit<CompilerError, 'severity'> {
  severity: 'warning';
}

export interface CompilerOptions {
  target?: 'x86' | 'arm' | 'wasm';
  optimize?: boolean;
  debug?: boolean;
  emitSourceMap?: boolean;
}

export interface CompilerStep {
  name: string;
  description: string;
  input?: any;
  output?: any;
  duration: number;
  success: boolean;
  error?: string;
  startTime?: bigint;
}

export interface CompilerResult {
  success: boolean;
  output?: string;
  steps: CompilerStep[];
  errors: CompilerError[];
  warnings: CompilerWarning[];
  sourceMap?: any;
  duration: number;
}

export interface CompilerError {
  message: string;
  location?: SourceLocation;
  code: string;
  severity: 'error' | 'warning';
}

export interface CompilerWarning extends Omit<CompilerError, 'severity'> {
  severity: 'warning';
}

export interface CompilerOptions {
  source: string;
  target?: 'x86' | 'arm' | 'wasm';
  optimize?: boolean;
  debug?: boolean;
  emitSourceMap?: boolean;
}

export class Compiler {
  private source: string;
  private tokens: Token[] = [];
  private ast: Program | null = null;
  private ir: IRInstruction[] = [];
  private optimizedIR: IRInstruction[] = [];
  private generatedCode: string = '';
  private output: string = '';
  private steps: CompilerStep[] = [];
  private errors: CompilerError[] = [];
  private warnings: CompilerWarning[] = [];
  private options: Required<CompilerOptions>;
  private context: {
    currentStep?: string;
    sourceMap?: any;
  } = {};

  constructor(options: CompilerOptions) {
    this.source = options.source;
    this.options = {
      target: 'wasm',
      optimize: false,
      debug: false,
      emitSourceMap: true,
      ...options
    };
  }

  public async compile(): Promise<CompilerResult> {
    const startTime = Date.now();
    this.steps = [];
    this.errors = [];
    this.warnings = [];

    try {
      // Lexical analysis
      await this.lex();
      
      // Parsing
      await this.parse();
      
      // Semantic analysis
      await this.analyzeSemantics();
      
      // Intermediate code generation
      await this.generateIR();
      
      // Optimization (if enabled)
      if (this.options.optimize) {
        await this.optimize();
      }
      
      // Code generation
      await this.generateCode();
      
      this.output = this.generatedCode;
      
      return {
        success: true,
        output: this.output,
        steps: this.steps,
        errors: this.errors,
        warnings: this.warnings,
        sourceMap: undefined, // Add source map generation if needed
        duration: Date.now() - startTime
      };
    } catch (error) {
      // Log the error if not already logged by runStep
      if (!this.errors.some(e => e.message === (error as Error).message)) {
        this.errors.push({
          message: (error as Error).message,
          code: 'COMPILATION_ERROR',
          severity: 'error'
        });
      }
      
      return {
        success: false,
        output: this.output,
        steps: this.steps,
        errors: this.errors,
        warnings: this.warnings,
        duration: Date.now() - startTime
      };
    }
  }

  private async runStep<T>(
    name: string, 
    description: string, 
    fn: StepFunction<T>,
    options: { input?: any } = {}
  ): Promise<T | undefined> {
    const start = process.hrtime.bigint();
    const step: CompilerStep = {
      name,
      description,
      input: options.input,
      duration: 0,
      success: false,
      startTime: start
    };

    this.steps.push(step);
    this.context.currentStep = name;

    try {
      const result = await Promise.resolve(fn());
      step.output = result;
      step.success = true;
      return result;
    } catch (error) {
      const err = error as Error;
      step.error = err.message;
      this.errors.push({
        message: err.message,
        code: 'COMPILATION_ERROR',
        severity: 'error'
      });
      throw error;
    } finally {
      const end = process.hrtime.bigint();
      step.duration = Number((end - step.startTime!) / BigInt(1_000_000)); // Convert to ms
      this.context.currentStep = undefined;
    }
  }

  private async lex(): Promise<void> {
    const tokens = await this.runStep(
      'lexical-analysis',
      'Tokenizing source code',
      () => tokenize(this.source)
    );
    this.tokens = tokens || [];
  }

  private async parse(): Promise<void> {
    if (!this.tokens.length) {
      throw new Error('Tokens not available for parsing');
    }
    
    this.ast = await this.runStep<Program>(
      'syntax-analysis',
      'Building abstract syntax tree',
      () => parse(this.tokens)
    ) || null;
  }

  private async analyzeSemantics(): Promise<void> {
    if (!this.ast) {
      throw new Error('AST not available for semantic analysis');
    }
    
    await this.runStep(
      'semantic-analysis',
      'Performing semantic analysis',
      () => {
        analyze(this.ast!);
        return { message: 'Semantic analysis completed' };
      }
    );
  }

  private async generateIR(): Promise<void> {
    if (!this.ast) {
      throw new Error('AST not available for IR generation');
    }
    
    this.ir = await this.runStep<IRInstruction[]>(
      'ir-generation',
      'Generating intermediate representation',
      () => generateIR(this.ast!)
    ) || [];
  }

  private async optimize(): Promise<void> {
    if (!this.ir.length) {
      throw new Error('IR not generated yet');
    }
    
    this.optimizedIR = await this.runStep<IRInstruction[]>(
      'optimization',
      'Optimizing intermediate representation',
      async () => {
        // For now, just return the IR as-is
        // In a real implementation, this would perform optimizations
        return [...this.ir];
      }
    ) || [];
  }

  private async generateCode(): Promise<void> {
    const irToUse = this.options.optimize ? this.optimizedIR : this.ir;
    if (!irToUse.length) {
      throw new Error('No IR available for code generation');
    }
    
    this.generatedCode = await this.runStep<string>(
      'code-generation',
      'Generating target code',
      () => generateX86_64(irToUse)
    ) || '';
  }

  private async link(): Promise<void> {
    // No-op for now, as we're just generating assembly
    // In a real implementation, this would link object files
    this.output = this.generatedCode || '';
  }

  private createResult(success: boolean, startTime: bigint): CompilerResult {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to ms
    
    return {
      success,
      output: this.output,
      steps: this.steps,
      errors: this.errors,
      warnings: this.warnings,
      sourceMap: this.options.emitSourceMap ? this.context.sourceMap : undefined,
      duration
    };
  }
}

// Helper function to create a compiler instance
export function createCompiler(options: CompilerOptions): Compiler {
  return new Compiler(options);
}

// Helper function to compile code in one step
export async function compile(
  source: string, 
  options: Partial<CompilerOptions> = {}
): Promise<CompilerResult> {
  const compiler = new Compiler({ source, ...options });
  return compiler.compile();
}
