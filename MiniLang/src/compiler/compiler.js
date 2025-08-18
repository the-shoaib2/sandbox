// Main MiniLang Compiler Module
const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { CodeGenerator } = require('./codegen');
const { ErrorHandler } = require('./errors');

class MiniLangCompiler {
    constructor() {
        this.errorHandler = new ErrorHandler();
    }

    compile(sourceCode) {
        this.errorHandler.clear();
        
        const result = {
            tokens: [],
            ast: null,
            intermediateCode: [],
            symbolTable: {},
            errors: [],
            warnings: [],
            success: false
        };

        try {
            // Phase 1: Lexical Analysis
            const lexer = new Lexer(sourceCode);
            const lexResult = lexer.tokenize();
            
            result.tokens = lexResult.tokens;
            
            // Add lexical errors to error handler
            lexResult.errors.forEach(error => {
                this.errorHandler.addError(error.type, error.message, error.line, error.column, 'Lexical');
            });

            if (this.errorHandler.hasErrors()) {
                result.errors = this.errorHandler.getAllErrors();
                return result;
            }

            // Phase 2: Syntax Analysis
            const parser = new Parser(lexResult.tokens);
            const parseResult = parser.parse();
            
            result.ast = parseResult.ast;
            
            // Add parser errors to error handler
            parseResult.errors.forEach(error => {
                this.errorHandler.addError(error.type, error.message, error.line, error.column, 'Syntax');
            });

            if (this.errorHandler.hasErrors()) {
                result.errors = this.errorHandler.getAllErrors();
                return result;
            }

            // Phase 3: Code Generation
            const codeGen = new CodeGenerator();
            const codeResult = codeGen.generate(parseResult.ast);
            
            result.intermediateCode = codeResult.code;
            result.symbolTable = codeResult.symbolTable;
            
            // Add code generation errors to error handler
            codeResult.errors.forEach(error => {
                this.errorHandler.addError(error.type, error.message, error.line, error.column, 'Code Generation');
            });

            if (this.errorHandler.hasErrors()) {
                result.errors = this.errorHandler.getAllErrors();
                return result;
            }

            result.success = true;
            result.errors = this.errorHandler.getAllErrors();
            result.warnings = this.errorHandler.getAllWarnings();

        } catch (error) {
            this.errorHandler.addError('COMPILER_ERROR', `Unexpected error: ${error.message}`);
            result.errors = this.errorHandler.getAllErrors();
        }

        return result;
    }

    // Utility method to format AST for visualization
    formatAST(node, indent = 0) {
        if (!node) return '';
        
        const spaces = '  '.repeat(indent);
        let result = `${spaces}${node.type}`;
        
        if (node.value !== null && node.value !== undefined) {
            result += `: ${node.value}`;
        }
        
        if (node.line && node.column) {
            result += ` (${node.line}:${node.column})`;
        }
        
        result += '\n';
        
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                result += this.formatAST(child, indent + 1);
            }
        }
        
        return result;
    }

    // Utility method to format tokens for display
    formatTokens(tokens) {
        return tokens.map(token => ({
            type: token.type,
            value: token.value,
            position: `${token.line}:${token.column}`
        }));
    }

    // Utility method to format intermediate code
    formatIntermediateCode(code) {
        return code.map((instruction, index) => ({
            line: index + 1,
            instruction: instruction.toString()
        }));
    }
}

module.exports = { MiniLangCompiler };
