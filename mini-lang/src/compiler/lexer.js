// Lexical Analyzer for MiniLang
class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.errors = [];
    }

    // Token types
    static TOKEN_TYPES = {
        LET: 'LET',
        IDENTIFIER: 'IDENTIFIER',
        NUMBER: 'NUMBER',
        ASSIGN: 'ASSIGN',
        PLUS: 'PLUS',
        MINUS: 'MINUS',
        MULTIPLY: 'MULTIPLY',
        DIVIDE: 'DIVIDE',
        LPAREN: 'LPAREN',
        RPAREN: 'RPAREN',
        SEMICOLON: 'SEMICOLON',
        PRINT: 'PRINT',
        COMMA: 'COMMA',
        EOF: 'EOF',
        NEWLINE: 'NEWLINE',
        COMMENT: 'COMMENT'
    };

    // Keywords
    static KEYWORDS = {
        'let': 'LET',
        'print': 'PRINT'
    };

    currentChar() {
        if (this.position >= this.input.length) {
            return null;
        }
        return this.input[this.position];
    }

    peek(offset = 1) {
        const peekPos = this.position + offset;
        if (peekPos >= this.input.length) {
            return null;
        }
        return this.input[peekPos];
    }

    advance() {
        if (this.position < this.input.length) {
            if (this.input[this.position] === '\n') {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.position++;
        }
    }

    skipWhitespace() {
        while (this.currentChar() && /\s/.test(this.currentChar()) && this.currentChar() !== '\n') {
            this.advance();
        }
    }

    readNumber() {
        let number = '';
        const startColumn = this.column;
        
        while (this.currentChar() && /\d/.test(this.currentChar())) {
            number += this.currentChar();
            this.advance();
        }
        
        // Handle decimal numbers
        if (this.currentChar() === '.' && /\d/.test(this.peek())) {
            number += this.currentChar();
            this.advance();
            while (this.currentChar() && /\d/.test(this.currentChar())) {
                number += this.currentChar();
                this.advance();
            }
        }
        
        return new Token(Lexer.TOKEN_TYPES.NUMBER, parseFloat(number), this.line, startColumn);
    }

    readIdentifier() {
        let identifier = '';
        const startColumn = this.column;
        
        while (this.currentChar() && /[a-zA-Z_][a-zA-Z0-9_]*/.test(this.currentChar())) {
            identifier += this.currentChar();
            this.advance();
        }
        
        // Check if it's a keyword
        const tokenType = Lexer.KEYWORDS[identifier] || Lexer.TOKEN_TYPES.IDENTIFIER;
        return new Token(tokenType, identifier, this.line, startColumn);
    }

    readComment() {
        let comment = '';
        const startColumn = this.column;
        
        // Skip the //
        this.advance();
        this.advance();
        
        while (this.currentChar() && this.currentChar() !== '\n') {
            comment += this.currentChar();
            this.advance();
        }
        
        return new Token(Lexer.TOKEN_TYPES.COMMENT, comment.trim(), this.line, startColumn);
    }

    tokenize() {
        this.tokens = [];
        this.errors = [];
        
        while (this.position < this.input.length) {
            const char = this.currentChar();
            
            if (!char) break;
            
            // Skip whitespace (except newlines)
            if (/\s/.test(char) && char !== '\n') {
                this.skipWhitespace();
                continue;
            }
            
            // Handle newlines
            if (char === '\n') {
                this.tokens.push(new Token(Lexer.TOKEN_TYPES.NEWLINE, '\\n', this.line, this.column));
                this.advance();
                continue;
            }
            
            // Handle comments
            if (char === '/' && this.peek() === '/') {
                this.tokens.push(this.readComment());
                continue;
            }
            
            // Handle numbers
            if (/\d/.test(char)) {
                this.tokens.push(this.readNumber());
                continue;
            }
            
            // Handle identifiers and keywords
            if (/[a-zA-Z_]/.test(char)) {
                this.tokens.push(this.readIdentifier());
                continue;
            }
            
            // Handle single-character tokens
            const startColumn = this.column;
            switch (char) {
                case '=':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.ASSIGN, char, this.line, startColumn));
                    break;
                case '+':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.PLUS, char, this.line, startColumn));
                    break;
                case '-':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.MINUS, char, this.line, startColumn));
                    break;
                case '*':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.MULTIPLY, char, this.line, startColumn));
                    break;
                case '/':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.DIVIDE, char, this.line, startColumn));
                    break;
                case '(':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.LPAREN, char, this.line, startColumn));
                    break;
                case ')':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.RPAREN, char, this.line, startColumn));
                    break;
                case ';':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.SEMICOLON, char, this.line, startColumn));
                    break;
                case ',':
                    this.tokens.push(new Token(Lexer.TOKEN_TYPES.COMMA, char, this.line, startColumn));
                    break;
                default:
                    this.errors.push({
                        type: 'LEXICAL_ERROR',
                        message: `Unexpected character '${char}'`,
                        line: this.line,
                        column: this.column
                    });
            }
            this.advance();
        }
        
        // Add EOF token
        this.tokens.push(new Token(Lexer.TOKEN_TYPES.EOF, null, this.line, this.column));
        
        return {
            tokens: this.tokens,
            errors: this.errors
        };
    }
}

module.exports = { Lexer, Token };
