import { Token, TokenType, KEYWORDS } from '../types/tokens';

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }
    
    // Add EOF token
    this.addToken(TokenType.EOF, '');
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      // Single-character tokens
      case '(': this.addToken(TokenType.LeftParen, char); break;
      case ')': this.addToken(TokenType.RightParen, char); break;
      case '{': this.addToken(TokenType.LeftBrace, char); break;
      case '}': this.addToken(TokenType.RightBrace, char); break;
      case ',': this.addToken(TokenType.Comma, char); break;
      case ';': this.addToken(TokenType.Semicolon, char); break;
      case ':': this.addToken(TokenType.Colon, char); break;

      // Operators
      case '+': this.addToken(TokenType.Plus, char); break;
      case '-': this.addToken(TokenType.Minus, char); break;
      case '*': this.addToken(TokenType.Multiply, char); break;
      case '/': 
        if (this.match('/')) {
          // Comment goes until the end of the line
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.Divide, char);
        }
        break;

      // One or two character tokens
      case '=': 
        this.addToken(this.match('=') ? TokenType.EqualsEquals : TokenType.Equals, '=');
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.NotEquals : TokenType.Minus, '!');
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LessThanEquals : TokenType.LessThan, '<');
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GreaterThanEquals : TokenType.GreaterThan, '>');
        break;

      // Whitespace
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      
      case '\n':
        this.line++;
        this.column = 1;
        break;

      // String literals
      case '"':
      case '\'':
        this.string(char);
        break;

      // Numbers
      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          // Error: Unknown character
          throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
        }
        break;
    }
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private advance(): string {
    this.column++;
    return this.source[this.position++];
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.position];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.source.length) return '\0';
    return this.source[this.position + 1];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.position] !== expected) return false;

    this.position++;
    this.column++;
    return true;
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length
    });
  }

  private isDigit(char: string): boolean {
    return /^\d$/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /^[a-zA-Z_]$/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private string(quote: string): void {
    const start = this.position - 1;
    let value = '';
    
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      value += this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error('Unterminated string');
    }

    // The closing quote
    this.advance();
    this.addToken(TokenType.String, value);
  }

  private number(): void {
    let value = '';
    
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Look for a fractional part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      value += this.advance();
      
      // Consume the fractional part
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.addToken(TokenType.Number, value);
  }

  private identifier(): void {
    let value = '';
    
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check if the identifier is a reserved keyword
    const type = KEYWORDS[value] || TokenType.Identifier;
    this.addToken(type, value);
  }
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}
