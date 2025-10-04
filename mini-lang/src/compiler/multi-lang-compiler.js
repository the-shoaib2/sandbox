// Multi-Language Compiler Support for C, C++, Python, Java, etc.
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

class MultiLanguageCompiler {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async compile(code, language) {
        const timestamp = Date.now();
        const result = {
            success: false,
            output: '',
            errors: '',
            executionOutput: '',
            compilationTime: 0,
            language: language
        };

        const startTime = Date.now();

        try {
            switch (language.toLowerCase()) {
                case 'c':
                    return await this.compileC(code, timestamp);
                case 'cpp':
                case 'c++':
                    return await this.compileCpp(code, timestamp);
                case 'python':
                    return await this.runPython(code, timestamp);
                case 'java':
                    return await this.compileJava(code, timestamp);
                case 'javascript':
                    return await this.runJavaScript(code, timestamp);
                case 'go':
                    return await this.compileGo(code, timestamp);
                case 'rust':
                    return await this.compileRust(code, timestamp);
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
        } catch (error) {
            result.errors = error.message;
            result.compilationTime = Date.now() - startTime;
            return result;
        }
    }

    async compileC(code, timestamp) {
        const sourceFile = path.join(this.tempDir, `program_${timestamp}.c`);
        const outputFile = path.join(this.tempDir, `program_${timestamp}`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Compile with gcc
            const compileResult = await execAsync(`gcc "${sourceFile}" -o "${outputFile}" 2>&1`);
            
            // Execute the compiled program
            const execResult = await execAsync(`"${outputFile}" 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile, outputFile]);
            
            return {
                success: true,
                output: 'Compilation successful',
                errors: compileResult.stderr || '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'C'
            };
        } catch (error) {
            this.cleanup([sourceFile, outputFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Compilation failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'C'
            };
        }
    }

    async compileCpp(code, timestamp) {
        const sourceFile = path.join(this.tempDir, `program_${timestamp}.cpp`);
        const outputFile = path.join(this.tempDir, `program_${timestamp}`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Compile with g++
            const compileResult = await execAsync(`g++ "${sourceFile}" -o "${outputFile}" 2>&1`);
            
            // Execute the compiled program
            const execResult = await execAsync(`"${outputFile}" 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile, outputFile]);
            
            return {
                success: true,
                output: 'Compilation successful',
                errors: compileResult.stderr || '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'C++'
            };
        } catch (error) {
            this.cleanup([sourceFile, outputFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Compilation failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'C++'
            };
        }
    }

    async runPython(code, timestamp) {
        const sourceFile = path.join(this.tempDir, `program_${timestamp}.py`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Execute with python3
            const execResult = await execAsync(`python3 "${sourceFile}" 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile]);
            
            return {
                success: true,
                output: 'Execution successful',
                errors: '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'Python'
            };
        } catch (error) {
            this.cleanup([sourceFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Execution failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'Python'
            };
        }
    }

    async compileJava(code, timestamp) {
        // Extract class name from code
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : 'Program';
        
        const sourceFile = path.join(this.tempDir, `${className}.java`);
        const classFile = path.join(this.tempDir, `${className}.class`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Compile with javac
            const compileResult = await execAsync(`javac "${sourceFile}" 2>&1`);
            
            // Execute with java
            const execResult = await execAsync(`cd "${this.tempDir}" && java ${className} 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile, classFile]);
            
            return {
                success: true,
                output: 'Compilation successful',
                errors: compileResult.stderr || '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'Java'
            };
        } catch (error) {
            this.cleanup([sourceFile, classFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Compilation failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'Java'
            };
        }
    }

    async runJavaScript(code, timestamp) {
        try {
            // Execute with node
            const execResult = await execAsync(`echo '${code.replace(/'/g, "\\'")}' | node`, { timeout: 5000 });
            
            return {
                success: true,
                output: 'Execution successful',
                errors: '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'JavaScript'
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Execution failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'JavaScript'
            };
        }
    }

    async compileGo(code, timestamp) {
        const sourceFile = path.join(this.tempDir, `program_${timestamp}.go`);
        const outputFile = path.join(this.tempDir, `program_${timestamp}`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Compile with go
            const compileResult = await execAsync(`go build -o "${outputFile}" "${sourceFile}" 2>&1`);
            
            // Execute the compiled program
            const execResult = await execAsync(`"${outputFile}" 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile, outputFile]);
            
            return {
                success: true,
                output: 'Compilation successful',
                errors: compileResult.stderr || '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'Go'
            };
        } catch (error) {
            this.cleanup([sourceFile, outputFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Compilation failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'Go'
            };
        }
    }

    async compileRust(code, timestamp) {
        const sourceFile = path.join(this.tempDir, `program_${timestamp}.rs`);
        const outputFile = path.join(this.tempDir, `program_${timestamp}`);
        
        fs.writeFileSync(sourceFile, code);
        
        try {
            // Compile with rustc
            const compileResult = await execAsync(`rustc "${sourceFile}" -o "${outputFile}" 2>&1`);
            
            // Execute the compiled program
            const execResult = await execAsync(`"${outputFile}" 2>&1`, { timeout: 5000 });
            
            // Cleanup
            this.cleanup([sourceFile, outputFile]);
            
            return {
                success: true,
                output: 'Compilation successful',
                errors: compileResult.stderr || '',
                executionOutput: execResult.stdout || '',
                compilationTime: 0,
                language: 'Rust'
            };
        } catch (error) {
            this.cleanup([sourceFile, outputFile]);
            return {
                success: false,
                output: '',
                errors: error.message || error.stderr || 'Compilation failed',
                executionOutput: '',
                compilationTime: 0,
                language: 'Rust'
            };
        }
    }

    cleanup(files) {
        files.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        });
    }

    checkCompilerAvailability() {
        const compilers = {
            gcc: 'gcc --version',
            'g++': 'g++ --version',
            python3: 'python3 --version',
            javac: 'javac -version',
            node: 'node --version',
            go: 'go version',
            rustc: 'rustc --version'
        };

        const availability = {};

        Object.keys(compilers).forEach(compiler => {
            try {
                exec(compilers[compiler], (error) => {
                    availability[compiler] = !error;
                });
            } catch (error) {
                availability[compiler] = false;
            }
        });

        return availability;
    }
}

module.exports = { MultiLanguageCompiler };
