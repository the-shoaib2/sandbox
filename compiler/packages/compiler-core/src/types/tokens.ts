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

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
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
