export interface Position {
  line: number;
  column: number;
  offset?: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

// Base node interface that all AST nodes will extend
export interface Node {
  type: string;
  loc: SourceLocation;
  [key: string]: any; // Allow additional properties
}

// Base interface for all expression nodes
export interface Expression extends Node {
  type: string;
}

// Base interface for all statement nodes
export interface Statement extends Node {
  type: string;
}
// Base interface for all declaration nodes
export interface Declaration extends Statement {
  type: string;
  id: Identifier;
}

// Specific node types
export interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
}

export interface Literal extends Expression {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: string;
  argument: Expression;
  prefix: boolean;
}

export interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface VariableDeclaration extends Declaration {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends Node {
  type: 'VariableDeclarator';
  id: Identifier;
  init: Expression | null;
}

export interface FunctionDeclaration extends Declaration {
  type: 'FunctionDeclaration';
  id: Identifier;
  params: Identifier[];
  body: BlockStatement;
}

export interface IfStatement extends Statement {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface BlockStatement extends Statement {
  type: 'BlockStatement';
  body: Statement[];
}

export interface ExpressionStatement extends Statement {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface Program extends Node {
  type: 'Program';
  body: Statement[];
}

export interface Token extends SourceLocation {
  type: TokenType;
  value: string;
  source?: string; // Optional source code snippet for this token
}

export enum TokenType {
  // Literals
  Number = 'Number',
  String = 'String',
  Identifier = 'Identifier',
  
  // Keywords
  Let = 'Let',
  Const = 'Const',
  Function = 'Function',
  If = 'If',
  Else = 'Else',
  Return = 'Return',
  True = 'True',
  False = 'False',
  
  // Operators
  Plus = 'Plus',
  Minus = 'Minus',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Equals = 'Equals',
  EqualsEquals = 'EqualsEquals',
  NotEquals = 'NotEquals',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  LessThanEquals = 'LessThanEquals',
  GreaterThanEquals = 'GreaterThanEquals',
  Not = 'Not',
  
  // Punctuation
  LeftParen = 'LeftParen',
  RightParen = 'RightParen',
  LeftBrace = 'LeftBrace',
  RightBrace = 'RightBrace',
  Comma = 'Comma',
  Semicolon = 'Semicolon',
  Colon = 'Colon',
  
  // Special
  EOF = 'EOF',
}

export const KEYWORDS: Record<string, TokenType> = {
  'let': TokenType.Let,
  'const': TokenType.Const,
  'function': TokenType.Function,
  'if': TokenType.If,
  'else': TokenType.Else,
  'return': TokenType.Return,
  'true': TokenType.True,
  'false': TokenType.False,
};
