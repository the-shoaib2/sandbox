// Parser for MiniLang - Generates Abstract Syntax Tree (AST)
const { Lexer } = require('./lexer');

class ASTNode {
    constructor(type, value = null, children = []) {
        this.type = type;
        this.value = value;
        this.children = children;
        this.line = null;
        this.column = null;
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        this.errors = [];
    }

    currentToken() {
        if (this.position >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1]; // EOF token
        }
        return this.tokens[this.position];
    }

    peek(offset = 1) {
        const peekPos = this.position + offset;
        if (peekPos >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1]; // EOF token
        }
        return this.tokens[peekPos];
    }

    advance() {
        if (this.position < this.tokens.length - 1) {
            this.position++;
        }
    }

    match(tokenType) {
        if (this.currentToken().type === tokenType) {
            const token = this.currentToken();
            this.advance();
            return token;
        }
        return null;
    }

    expect(tokenType) {
        const token = this.currentToken();
        if (token.type === tokenType) {
            this.advance();
            return token;
        }
        
        this.errors.push({
            type: 'SYNTAX_ERROR',
            message: `Expected ${tokenType}, got ${token.type}`,
            line: token.line,
            column: token.column
        });
        return null;
    }

    skipNewlines() {
        while (this.currentToken().type === 'NEWLINE') {
            this.advance();
        }
    }

    // Grammar: program -> statement_list
    parseProgram() {
        const statements = [];
        this.skipNewlines();
        
        while (this.currentToken().type !== 'EOF') {
            if (this.currentToken().type === 'NEWLINE' || this.currentToken().type === 'COMMENT') {
                this.advance();
                continue;
            }
            
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
            this.skipNewlines();
        }
        
        return new ASTNode('PROGRAM', null, statements);
    }

    // Grammar: statement -> let_statement | print_statement
    parseStatement() {
        const token = this.currentToken();
        
        switch (token.type) {
            case 'LET':
                return this.parseLetStatement();
            case 'PRINT':
                return this.parsePrintStatement();
            default:
                this.errors.push({
                    type: 'SYNTAX_ERROR',
                    message: `Unexpected token ${token.type}`,
                    line: token.line,
                    column: token.column
                });
                this.advance(); // Skip the problematic token
                return null;
        }
    }

    // Grammar: let_statement -> 'let' IDENTIFIER '=' expression ';'
    parseLetStatement() {
        const letToken = this.expect('LET');
        if (!letToken) return null;
        
        const identifier = this.expect('IDENTIFIER');
        if (!identifier) return null;
        
        this.expect('ASSIGN');
        
        const expression = this.parseExpression();
        if (!expression) return null;
        
        this.expect('SEMICOLON');
        
        const node = new ASTNode('LET_STATEMENT', identifier.value, [expression]);
        node.line = letToken.line;
        node.column = letToken.column;
        return node;
    }

    // Grammar: print_statement -> 'print' '(' expression ')' ';'
    parsePrintStatement() {
        const printToken = this.expect('PRINT');
        if (!printToken) return null;
        
        this.expect('LPAREN');
        
        const expression = this.parseExpression();
        if (!expression) return null;
        
        this.expect('RPAREN');
        this.expect('SEMICOLON');
        
        const node = new ASTNode('PRINT_STATEMENT', null, [expression]);
        node.line = printToken.line;
        node.column = printToken.column;
        return node;
    }

    // Grammar: expression -> term (('+' | '-') term)*
    parseExpression() {
        let left = this.parseTerm();
        if (!left) return null;
        
        while (this.currentToken().type === 'PLUS' || this.currentToken().type === 'MINUS') {
            const operator = this.currentToken();
            this.advance();
            const right = this.parseTerm();
            if (!right) return null;
            
            const node = new ASTNode('BINARY_OP', operator.value, [left, right]);
            node.line = operator.line;
            node.column = operator.column;
            left = node;
        }
        
        return left;
    }

    // Grammar: term -> factor (('*' | '/') factor)*
    parseTerm() {
        let left = this.parseFactor();
        if (!left) return null;
        
        while (this.currentToken().type === 'MULTIPLY' || this.currentToken().type === 'DIVIDE') {
            const operator = this.currentToken();
            this.advance();
            const right = this.parseFactor();
            if (!right) return null;
            
            const node = new ASTNode('BINARY_OP', operator.value, [left, right]);
            node.line = operator.line;
            node.column = operator.column;
            left = node;
        }
        
        return left;
    }

    // Grammar: factor -> NUMBER | IDENTIFIER | '(' expression ')'
    parseFactor() {
        const token = this.currentToken();
        
        switch (token.type) {
            case 'NUMBER':
                this.advance();
                const numberNode = new ASTNode('NUMBER', token.value);
                numberNode.line = token.line;
                numberNode.column = token.column;
                return numberNode;
                
            case 'IDENTIFIER':
                this.advance();
                const identifierNode = new ASTNode('IDENTIFIER', token.value);
                identifierNode.line = token.line;
                identifierNode.column = token.column;
                return identifierNode;
                
            case 'LPAREN':
                this.advance();
                const expression = this.parseExpression();
                this.expect('RPAREN');
                return expression;
                
            default:
                this.errors.push({
                    type: 'SYNTAX_ERROR',
                    message: `Unexpected token ${token.type} in expression`,
                    line: token.line,
                    column: token.column
                });
                return null;
        }
    }

    parse() {
        try {
            const ast = this.parseProgram();
            return {
                ast: ast,
                errors: this.errors
            };
        } catch (error) {
            this.errors.push({
                type: 'PARSER_ERROR',
                message: error.message,
                line: this.currentToken().line,
                column: this.currentToken().column
            });
            return {
                ast: null,
                errors: this.errors
            };
        }
    }
}

module.exports = { Parser, ASTNode };
