// Code Generator for MiniLang - Generates Three-Address Code
class ThreeAddressCode {
    constructor(op, arg1, arg2, result) {
        this.op = op;        // Operation
        this.arg1 = arg1;    // First argument
        this.arg2 = arg2;    // Second argument
        this.result = result; // Result variable
    }

    toString() {
        if (this.op === 'ASSIGN') {
            return `${this.result} = ${this.arg1}`;
        } else if (this.op === 'PRINT') {
            return `print ${this.arg1}`;
        } else {
            return `${this.result} = ${this.arg1} ${this.op} ${this.arg2}`;
        }
    }
}

class CodeGenerator {
    constructor() {
        this.code = [];
        this.tempCounter = 0;
        this.symbolTable = new Map();
        this.errors = [];
    }

    newTemp() {
        return `t${this.tempCounter++}`;
    }

    emit(op, arg1, arg2, result) {
        const instruction = new ThreeAddressCode(op, arg1, arg2, result);
        this.code.push(instruction);
        return instruction;
    }

    generate(ast) {
        this.code = [];
        this.tempCounter = 0;
        this.symbolTable.clear();
        this.errors = [];

        if (!ast) {
            this.errors.push({
                type: 'CODEGEN_ERROR',
                message: 'No AST provided for code generation'
            });
            return { code: [], errors: this.errors, symbolTable: {} };
        }

        try {
            this.visitNode(ast);
            return {
                code: this.code,
                errors: this.errors,
                symbolTable: Object.fromEntries(this.symbolTable)
            };
        } catch (error) {
            this.errors.push({
                type: 'CODEGEN_ERROR',
                message: error.message
            });
            return { code: [], errors: this.errors, symbolTable: {} };
        }
    }

    visitNode(node) {
        if (!node) return null;

        switch (node.type) {
            case 'PROGRAM':
                for (const child of node.children) {
                    this.visitNode(child);
                }
                break;

            case 'LET_STATEMENT':
                return this.visitLetStatement(node);

            case 'PRINT_STATEMENT':
                return this.visitPrintStatement(node);

            case 'BINARY_OP':
                return this.visitBinaryOp(node);

            case 'NUMBER':
                return node.value.toString();

            case 'IDENTIFIER':
                if (!this.symbolTable.has(node.value)) {
                    this.errors.push({
                        type: 'SEMANTIC_ERROR',
                        message: `Undefined variable '${node.value}'`,
                        line: node.line,
                        column: node.column
                    });
                    return null;
                }
                return node.value;

            default:
                this.errors.push({
                    type: 'CODEGEN_ERROR',
                    message: `Unknown node type: ${node.type}`
                });
                return null;
        }
    }

    visitLetStatement(node) {
        const varName = node.value;
        const expression = node.children[0];
        
        const exprResult = this.visitNode(expression);
        if (exprResult === null) return;
        
        // Add variable to symbol table
        this.symbolTable.set(varName, {
            type: 'variable',
            initialized: true
        });
        
        this.emit('ASSIGN', exprResult, null, varName);
    }

    visitPrintStatement(node) {
        const expression = node.children[0];
        const exprResult = this.visitNode(expression);
        
        if (exprResult === null) return;
        
        this.emit('PRINT', exprResult, null, null);
    }

    visitBinaryOp(node) {
        const left = this.visitNode(node.children[0]);
        const right = this.visitNode(node.children[1]);
        
        if (left === null || right === null) return null;
        
        const temp = this.newTemp();
        this.emit(node.value, left, right, temp);
        
        return temp;
    }
}

module.exports = { CodeGenerator, ThreeAddressCode };
