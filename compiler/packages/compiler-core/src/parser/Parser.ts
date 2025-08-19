import { 
  Token, 
  TokenType, 
  Position, 
  SourceLocation,
  Node
} from '../types/unified';

type BinaryOperator = '+' | '-' | '*' | '/' | '==' | '!=' | '<' | '>' | '<=' | '>=';
type UnaryOperator = '-' | '!';

export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

export type Statement = ExpressionStatement | VariableDeclaration | FunctionDeclaration | ReturnStatement | IfStatement | BlockStatement;

export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends ASTNode {
  type: 'VariableDeclarator';
  id: Identifier;
  init: Expression | null;
}

export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  id: Identifier;
  params: Identifier[];
  body: BlockStatement;
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: Statement[];
}

export type Expression = 
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Identifier
  | CallExpression
  | AssignmentExpression;

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  argument: Expression;
  prefix: boolean;
}

export interface Literal extends ASTNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface AssignmentExpression extends ASTNode {
  type: 'AssignmentExpression';
  operator: '=';
  left: Identifier;
  right: Expression;
}

export class Parser {
  private tokens: Token[] = [];
  private current = 0;
  private inFunction = false;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const program: Program = {
      type: 'Program',
      body: []
    };

    while (!this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) {
        program.body.push(stmt);
      }
    }

    return program;
  }

  private declaration(): Statement | null {
    try {
      if (this.match(TokenType.Function)) return this.functionDeclaration();
      if (this.match(TokenType.Let, TokenType.Const)) {
        this.back();
        return this.variableDeclaration();
      }
      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private functionDeclaration(): FunctionDeclaration {
    const id = this.consume(TokenType.Identifier, 'Expect function name');
    
    this.consume(TokenType.LeftParen, 'Expect "(" after function name');
    
    const params: Identifier[] = [];
    if (!this.check(TokenType.RightParen)) {
      do {
        if (params.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 parameters');
        }
        const param = this.consume(TokenType.Identifier, 'Expect parameter name');
        params.push(this.identifier(param));
      } while (this.match(TokenType.Comma));
    }
    
    this.consume(TokenType.RightParen, 'Expect ")" after parameters');
    
    this.consume(TokenType.LeftBrace, 'Expect "{" before function body');
    
    const previousInFunction = this.inFunction;
    this.inFunction = true;
    
    const body = this.blockStatement();
    
    this.inFunction = previousInFunction;
    
    return {
      type: 'FunctionDeclaration',
      id: this.identifier(id),
      params,
      body
    };
  }

  private variableDeclaration(): VariableDeclaration {
    const kind = this.consume(
      this.previous().type === TokenType.Let ? TokenType.Let : TokenType.Const,
      'Unexpected token in variable declaration'
    ).value as 'let' | 'const';

    const declarations: VariableDeclarator[] = [];
    
    do {
      const id = this.consume(TokenType.Identifier, 'Expect variable name');
      
      let init: Expression | null = null;
      if (this.match(TokenType.Equals)) {
        init = this.expression();
      }
      
      declarations.push({
        type: 'VariableDeclarator',
        id: this.identifier(id),
        init
      });
    } while (this.match(TokenType.Comma));
    
    this.consume(TokenType.Semicolon, 'Expect ";" after variable declaration');
    
    return {
      type: 'VariableDeclaration',
      kind,
      declarations
    };
  }

  private statement(): Statement {
    if (this.match(TokenType.Return)) return this.returnStatement();
    if (this.match(TokenType.If)) return this.ifStatement();
    if (this.match(TokenType.LeftBrace)) return this.blockStatement();
    return this.expressionStatement();
  }

  private returnStatement(): ReturnStatement {
    if (!this.inFunction) {
      this.error(this.previous(), 'Cannot return from top-level code');
    }
    
    let value: Expression | null = null;
    if (!this.check(TokenType.Semicolon)) {
      value = this.expression();
    }
    
    this.consume(TokenType.Semicolon, 'Expect ";" after return value');
    
    return {
      type: 'ReturnStatement',
      argument: value
    };
  }

  private ifStatement(): IfStatement {
    this.consume(TokenType.LeftParen, 'Expect "(" after "if"');
    const test = this.expression();
    this.consume(TokenType.RightParen, 'Expect ")" after if condition');
    
    const consequent = this.statement();
    
    let alternate: Statement | null = null;
    if (this.match(TokenType.Else)) {
      alternate = this.statement();
    }
    
    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    };
  }

  private blockStatement(): BlockStatement {
    const body: Statement[] = [];
    
    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) {
        body.push(stmt);
      }
    }
    
    this.consume(TokenType.RightBrace, 'Expect "}" after block');
    
    return {
      type: 'BlockStatement',
      body
    };
  }

  private expressionStatement(): ExpressionStatement {
    const expr = this.expression();
    this.consume(TokenType.Semicolon, 'Expect ";" after expression');
    return {
      type: 'ExpressionStatement',
      expression: expr
    };
  }

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const expr = this.equality();
    
    if (this.match(TokenType.Equals)) {
      const equals = this.previous();
      const value = this.assignment();
      
      if (expr.type === 'Identifier') {
        const name = (expr as Identifier).name;
        return {
          type: 'AssignmentExpression',
          operator: '=',
          left: expr as Identifier,
          right: value
        };
      }
      
      this.error(equals, 'Invalid assignment target');
    }
    
    return expr;
  }

  private equality(): Expression {
    let expr = this.comparison();

    while (this.match(TokenType.EqualsEquals, TokenType.NotEquals)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.comparison();
      expr = this.binaryExpression(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();

    while (this.match(
      TokenType.GreaterThan,
      TokenType.GreaterThanEquals,
      TokenType.LessThan,
      TokenType.LessThanEquals
    )) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.term();
      expr = this.binaryExpression(expr, operator, right);
    }

    return expr;
  }

  private term(): Expression {
    let expr = this.factor();

    while (this.match(TokenType.Minus, TokenType.Plus)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.factor();
      expr = this.binaryExpression(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TokenType.Multiply, TokenType.Divide)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.unary();
      expr = this.binaryExpression(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expression {
    if (this.match(TokenType.Minus, TokenType.Not)) {
      const operator = this.previous().value as UnaryOperator;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator,
        argument: right,
        prefix: true
      };
    }

    return this.call();
  }

  private call(): Expression {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LeftParen)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expression): CallExpression {
    const args: Expression[] = [];
    
    if (!this.check(TokenType.RightParen)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 arguments');
        }
        args.push(this.expression());
      } while (this.match(TokenType.Comma));
    }
    
    const paren = this.consume(TokenType.RightParen, 'Expect ")" after arguments');
    
    return {
      type: 'CallExpression',
      callee,
      arguments: args
    };
  }

  private primary(): Expression {
    if (this.match(TokenType.False)) return this.literal(false);
    if (this.match(TokenType.True)) return this.literal(true);
    if (this.match(TokenType.Number, TokenType.String)) {
      return this.literal(this.previous().value);
    }
    
    if (this.match(TokenType.Identifier)) {
      return this.identifier(this.previous());
    }
    
    if (this.match(TokenType.LeftParen)) {
      const expr = this.expression();
      this.consume(TokenType.RightParen, 'Expect ")" after expression');
      return expr;
    }
    
    throw this.error(this.peek(), 'Expect expression');
  }

  private binaryExpression(left: Expression, operator: BinaryOperator, right: Expression): BinaryExpression {
    return {
      type: 'BinaryExpression',
      operator,
      left,
      right
    };
  }

  private literal(value: string | number | boolean): Literal {
    return {
      type: 'Literal',
      value,
      raw: String(value)
    };
  }

  private identifier(token: Token): Identifier {
    return {
      type: 'Identifier',
      name: token.value as string
    };
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private back(): void {
    if (this.current > 0) this.current--;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string, code = 'PARSE_ERROR'): never {
    const error = new Error(`[${token.start.line}:${token.start.column}] ${message}`) as Error & {
      token: Token;
      code: string;
      loc: SourceLocation;
    };
    
    error.token = token;
    error.code = code;
    error.loc = {
      start: { ...token.start },
      end: { ...token.end }
    };
    
    throw error;
  }
  
  private createNode<T extends Node>(
    type: T['type'],
    start: Position,
    end: Position,
    props: Omit<T, 'type' | 'loc'>
  ): T {
    return {
      type,
      loc: { start, end },
      ...props
    } as T;
  }

  private synchronize(): void {
    this.advance();
    
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.Semicolon) return;
      
      switch (this.peek().type) {
        case TokenType.Function:
        case TokenType.Let:
        case TokenType.Const:
        case TokenType.If:
        case TokenType.Return:
          return;
      }
      
      this.advance();
    }
  }
}

export function parse(tokens: Token[]): Program {
  const parser = new Parser(tokens);
  return parser.parse();
}
