// Core types for the compiler pipeline

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

export interface Token extends SourceLocation {
  type: string;
  value: string;
}

export interface Node extends SourceLocation {
  type: string;
}

export interface Program extends Node {
  type: 'Program';
  body: Node[];
}

export type CompilerStep = {
  name: string;
  description: string;
  input: any;
  output: any;
  duration: number;
  success: boolean;
  error?: string;
};

export interface CompilerOptions {
  source: string;
  target?: 'x86' | 'arm' | 'wasm';
  optimize?: boolean;
  debug?: boolean;
  emitSourceMap?: boolean;
}

export interface CompilerResult {
  success: boolean;
  output?: string;
  steps: CompilerStep[];
  errors: CompilerError[];
  warnings: CompilerWarning[];
  sourceMap?: any;
}

export interface CompilerError {
  message: string;
  location?: SourceLocation;
  code: string;
  severity: 'error' | 'warning';
}

export type CompilerWarning = Omit<CompilerError, 'severity'> & {
  severity: 'warning';
};

// Lexer types
export interface LexerOptions {
  // Whether to include whitespace tokens
  includeWhitespace?: boolean;
  // Whether to include comments
  includeComments?: boolean;
}

// Parser types
export interface ParserOptions {
  // Whether to recover from errors
  errorRecovery?: boolean;
  // Maximum number of errors before bailing
  maxErrors?: number;
}

// Semantic analysis types
export interface SemanticAnalysisOptions {
  // Whether to perform type checking
  typeCheck?: boolean;
  // Whether to perform control flow analysis
  controlFlowAnalysis?: boolean;
  // Whether to perform data flow analysis
  dataFlowAnalysis?: boolean;
}

// Code generation types
export interface CodeGenOptions {
  // Target platform
  target?: 'x86' | 'arm' | 'wasm';
  // Optimization level (0-3)
  optimizationLevel?: 0 | 1 | 2 | 3;
  // Whether to include debug information
  debugInfo?: boolean;
}

// Compilation context
export interface CompilationContext {
  // Current file being compiled
  filename: string;
  // Source code
  source: string;
  // Current working directory
  cwd: string;
  // Compiler options
  options: CompilerOptions;
  // Current compilation phase
  phase: 'lexing' | 'parsing' | 'semantic' | 'ir' | 'optimization' | 'codegen' | 'linking';
  // Current errors
  errors: CompilerError[];
  // Current warnings
  warnings: CompilerWarning[];
  // Symbol table
  symbols: Map<string, any>;
  // Type information
  types: Map<string, any>;
  // Current scope
  scope: any;
}
