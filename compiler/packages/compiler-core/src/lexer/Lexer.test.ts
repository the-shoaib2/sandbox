import { tokenize, TokenType } from './Lexer';

describe('Lexer', () => {
  test('should tokenize basic arithmetic', () => {
    const source = '1 + 2 * 3';
    const tokens = tokenize(source);
    
    expect(tokens).toEqual([
      { type: TokenType.Number, value: '1', line: 1, column: 1 },
      { type: TokenType.Plus, value: '+', line: 1, column: 3 },
      { type: TokenType.Number, value: '2', line: 1, column: 5 },
      { type: TokenType.Multiply, value: '*', line: 1, column: 7 },
      { type: TokenType.Number, value: '3', line: 1, column: 9 },
      { type: TokenType.EOF, value: '', line: 1, column: 10 }
    ]);
  });

  test('should tokenize variable declaration', () => {
    const source = 'let x = 42;';
    const tokens = tokenize(source);
    
    expect(tokens).toEqual([
      { type: TokenType.Let, value: 'let', line: 1, column: 1 },
      { type: TokenType.Identifier, value: 'x', line: 1, column: 5 },
      { type: TokenType.Equals, value: '=', line: 1, column: 7 },
      { type: TokenType.Number, value: '42', line: 1, column: 9 },
      { type: TokenType.Semicolon, value: ';', line: 1, column: 11 },
      { type: TokenType.EOF, value: '', line: 1, column: 12 }
    ]);
  });

  test('should tokenize string literals', () => {
    const source = '"hello" + "world"';
    const tokens = tokenize(source);
    
    expect(tokens).toEqual([
      { type: TokenType.String, value: 'hello', line: 1, column: 1 },
      { type: TokenType.Plus, value: '+', line: 1, column: 9 },
      { type: TokenType.String, value: 'world', line: 1, column: 11 },
      { type: TokenType.EOF, value: '', line: 1, column: 18 }
    ]);
  });

  test('should handle comments', () => {
    const source = '// This is a comment\nlet x = 1;';
    const tokens = tokenize(source);
    
    expect(tokens).toEqual([
      { type: TokenType.Let, value: 'let', line: 2, column: 1 },
      { type: TokenType.Identifier, value: 'x', line: 2, column: 5 },
      { type: TokenType.Equals, value: '=', line: 2, column: 7 },
      { type: TokenType.Number, value: '1', line: 2, column: 9 },
      { type: TokenType.Semicolon, value: ';', line: 2, column: 10 },
      { type: TokenType.EOF, value: '', line: 2, column: 11 }
    ]);
  });

  test('should handle comparison operators', () => {
    const source = 'x <= 10 || y > 5';
    const tokens = tokenize(source);
    
    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'x', line: 1, column: 1 },
      { type: TokenType.LessThanEquals, value: '<=', line: 1, column: 3 },
      { type: TokenType.Number, value: '10', line: 1, column: 6 },
      { type: TokenType.Identifier, value: 'y', line: 1, column: 12 },
      { type: TokenType.GreaterThan, value: '>', line: 1, column: 14 },
      { type: TokenType.Number, value: '5', line: 1, column: 16 },
      { type: TokenType.EOF, value: '', line: 1, column: 17 }
    ]);
  });
});
