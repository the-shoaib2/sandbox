// Simple Interpreter for MiniLang Intermediate Code
class Interpreter {
    constructor() {
        this.variables = new Map();
        this.output = [];
        this.errors = [];
    }

    execute(intermediateCode) {
        this.variables.clear();
        this.output = [];
        this.errors = [];

        try {
            for (const instruction of intermediateCode) {
                this.executeInstruction(instruction);
            }
            
            return {
                success: true,
                output: this.output,
                variables: Object.fromEntries(this.variables),
                errors: this.errors
            };
        } catch (error) {
            this.errors.push({
                type: 'RUNTIME_ERROR',
                message: error.message
            });
            
            return {
                success: false,
                output: this.output,
                variables: Object.fromEntries(this.variables),
                errors: this.errors
            };
        }
    }

    executeInstruction(instruction) {
        switch (instruction.op) {
            case 'ASSIGN':
                this.executeAssign(instruction);
                break;
            case 'PRINT':
                this.executePrint(instruction);
                break;
            case '+':
                this.executeArithmetic(instruction, (a, b) => a + b);
                break;
            case '-':
                this.executeArithmetic(instruction, (a, b) => a - b);
                break;
            case '*':
                this.executeArithmetic(instruction, (a, b) => a * b);
                break;
            case '/':
                this.executeArithmetic(instruction, (a, b) => {
                    if (b === 0) {
                        throw new Error('Division by zero');
                    }
                    return a / b;
                });
                break;
            default:
                throw new Error(`Unknown operation: ${instruction.op}`);
        }
    }

    executeAssign(instruction) {
        const value = this.getValue(instruction.arg1);
        this.variables.set(instruction.result, value);
    }

    executePrint(instruction) {
        const value = this.getValue(instruction.arg1);
        this.output.push(value);
    }

    executeArithmetic(instruction, operation) {
        const left = this.getValue(instruction.arg1);
        const right = this.getValue(instruction.arg2);
        const result = operation(left, right);
        this.variables.set(instruction.result, result);
    }

    getValue(operand) {
        // Check if it's a number
        if (!isNaN(parseFloat(operand))) {
            return parseFloat(operand);
        }
        
        // Check if it's a variable
        if (this.variables.has(operand)) {
            return this.variables.get(operand);
        }
        
        throw new Error(`Undefined variable or invalid operand: ${operand}`);
    }
}

module.exports = { Interpreter };
