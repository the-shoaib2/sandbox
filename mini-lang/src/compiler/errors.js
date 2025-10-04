// Error handling utilities for MiniLang compiler
class CompilerError {
    constructor(type, message, line = null, column = null, phase = null) {
        this.type = type;
        this.message = message;
        this.line = line;
        this.column = column;
        this.phase = phase;
        this.timestamp = new Date().toISOString();
    }

    toString() {
        let str = `${this.type}: ${this.message}`;
        if (this.line !== null) {
            str += ` at line ${this.line}`;
            if (this.column !== null) {
                str += `, column ${this.column}`;
            }
        }
        if (this.phase) {
            str += ` (${this.phase} phase)`;
        }
        return str;
    }
}

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    addError(type, message, line = null, column = null, phase = null) {
        const error = new CompilerError(type, message, line, column, phase);
        this.errors.push(error);
        return error;
    }

    addWarning(type, message, line = null, column = null, phase = null) {
        const warning = new CompilerError(type, message, line, column, phase);
        this.warnings.push(warning);
        return warning;
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    hasWarnings() {
        return this.warnings.length > 0;
    }

    clear() {
        this.errors = [];
        this.warnings = [];
    }

    getAllErrors() {
        return [...this.errors];
    }

    getAllWarnings() {
        return [...this.warnings];
    }

    getFormattedReport() {
        let report = '';
        
        if (this.hasErrors()) {
            report += '## Errors:\n';
            this.errors.forEach((error, index) => {
                report += `${index + 1}. ${error.toString()}\n`;
            });
        }
        
        if (this.hasWarnings()) {
            report += '\n## Warnings:\n';
            this.warnings.forEach((warning, index) => {
                report += `${index + 1}. ${warning.toString()}\n`;
            });
        }
        
        if (!this.hasErrors() && !this.hasWarnings()) {
            report = 'No errors or warnings found.';
        }
        
        return report;
    }
}

module.exports = { CompilerError, ErrorHandler };
