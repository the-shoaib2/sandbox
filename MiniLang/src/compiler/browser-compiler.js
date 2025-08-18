// Browser-based compilation service for client-side execution
class BrowserCompiler {
    constructor() {
        this.supportedLanguages = ['javascript', 'python', 'c', 'cpp', 'java'];
    }

    async compile(code, language) {
        const startTime = Date.now();
        
        try {
            switch (language.toLowerCase()) {
                case 'javascript':
                    return this.executeJavaScript(code);
                case 'python':
                    return this.executePythonInBrowser(code);
                case 'c':
                case 'cpp':
                    return this.compileCppInBrowser(code, language);
                case 'java':
                    return this.compileJavaInBrowser(code);
                default:
                    return {
                        success: false,
                        output: '',
                        errors: `Browser compilation not supported for ${language}`,
                        executionOutput: '',
                        compilationTime: Date.now() - startTime,
                        language: language,
                        service: 'Browser'
                    };
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: error.message,
                executionOutput: '',
                compilationTime: Date.now() - startTime,
                language: language,
                service: 'Browser'
            };
        }
    }

    executeJavaScript(code) {
        try {
            // Create a safe execution context
            const output = [];
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn
            };

            // Override console methods to capture output
            console.log = (...args) => {
                output.push(args.map(arg => String(arg)).join(' '));
            };
            console.error = (...args) => {
                output.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
            };
            console.warn = (...args) => {
                output.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
            };

            // Execute the code in a try-catch
            const func = new Function(code);
            func();

            // Restore console
            Object.assign(console, originalConsole);

            return {
                success: true,
                output: 'JavaScript execution successful',
                errors: '',
                executionOutput: output.join('\n'),
                compilationTime: 0,
                language: 'JavaScript',
                service: 'Browser'
            };
        } catch (error) {
            // Restore console
            Object.assign(console, {
                log: console.log,
                error: console.error,
                warn: console.warn
            });

            return {
                success: false,
                output: '',
                errors: error.message,
                executionOutput: '',
                compilationTime: 0,
                language: 'JavaScript',
                service: 'Browser'
            };
        }
    }

    executePythonInBrowser(code) {
        // For Python, we'll use Pyodide (Python in browser) if available
        // For now, return a helpful message
        return {
            success: false,
            output: '',
            errors: 'Python execution in browser requires Pyodide. Please use cloud compilation or install Python locally.',
            executionOutput: '',
            compilationTime: 0,
            language: 'Python',
            service: 'Browser'
        };
    }

    compileCppInBrowser(code, language) {
        // For C/C++, we could use WebAssembly compilation
        // For now, return a helpful message
        return {
            success: false,
            output: '',
            errors: `${language.toUpperCase()} compilation in browser requires WebAssembly toolchain. Please use cloud compilation or install ${language === 'c' ? 'gcc' : 'g++'} locally.`,
            executionOutput: '',
            compilationTime: 0,
            language: language.toUpperCase(),
            service: 'Browser'
        };
    }

    compileJavaInBrowser(code) {
        return {
            success: false,
            output: '',
            errors: 'Java compilation in browser is not supported. Please use cloud compilation or install JDK locally.',
            executionOutput: '',
            compilationTime: 0,
            language: 'Java',
            service: 'Browser'
        };
    }
}

module.exports = { BrowserCompiler };
