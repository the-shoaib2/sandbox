const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { MiniLangCompiler } = require('../compiler/compiler');
const { Interpreter } = require('../compiler/interpreter');
const { MultiLanguageCompiler } = require('../compiler/multi-lang-compiler');
const { CloudCompiler } = require('../compiler/cloud-compiler');
const { BrowserCompiler } = require('../compiler/browser-compiler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes prefix
app.use('/api', express.Router());

// Set view engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Initialize compiler and interpreter
const compiler = new MiniLangCompiler();
const interpreter = new Interpreter();
const multiLangCompiler = new MultiLanguageCompiler();
const cloudCompiler = new CloudCompiler();
const browserCompiler = new BrowserCompiler();

// Serve the main page (keep for backward compatibility)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/compile', (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'No source code provided'
            });
        }

        const result = compiler.compile(code);
        
        // Execute intermediate code if compilation was successful
        let executionResult = null;
        if (result.success && result.intermediateCode.length > 0) {
            executionResult = interpreter.execute(result.intermediateCode);
        }
        
        // Format the response for the UI
        const response = {
            success: result.success,
            tokens: compiler.formatTokens(result.tokens),
            ast: result.ast ? compiler.formatAST(result.ast) : null,
            intermediateCode: compiler.formatIntermediateCode(result.intermediateCode),
            symbolTable: result.symbolTable,
            errors: result.errors,
            warnings: result.warnings,
            execution: executionResult
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Server error: ${error.message}`
        });
    }
});

app.get('/api/examples/:language', (req, res) => {
    const { language } = req.params;
    
    const examples = {
        minilang: [
            {
                name: 'Basic Variable Assignment',
                code: `// Basic variable assignment
let x = 10;
let y = 20;
print(x);
print(y);`
            },
            {
                name: 'Arithmetic Operations',
                code: `// Arithmetic operations
let a = 5;
let b = 3;
let sum = a + b;
let product = a * b;
print(sum);
print(product);`
            },
            {
                name: 'Complex Expression',
                code: `// Complex arithmetic expression
let x = 10;
let y = 5;
let z = (x + y) * 2 - 3;
print(z);`
            }
        ],
        javascript: [
            {
                name: 'Basic Variables',
                code: `// JavaScript variables and functions
const x = 10;
const y = 5;
const result = x + y * 2;
console.log(result);

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`
            },
            {
                name: 'Array Operations',
                code: `// JavaScript array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((a, b) => a + b, 0);

console.log('Original:', numbers);
console.log('Doubled:', doubled);
console.log('Sum:', sum);`
            }
        ],
        python: [
            {
                name: 'Basic Python',
                code: `# Python example with functions
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

x = 10
y = 5
result = x + y * 2
print(f"Result: {result}")
print(f"Fibonacci(10): {fibonacci(10)}")`
            },
            {
                name: 'List Comprehension',
                code: `# Python list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]

print("Numbers:", numbers)
print("Squares:", squares)
print("Evens:", evens)`
            }
        ],
        java: [
            {
                name: 'Basic Java Class',
                code: `// Java class example
public class Calculator {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int result = calc.add(10, 5);
        System.out.println("Result: " + result);
    }
    
    public int add(int a, int b) {
        return a + b;
    }
    
    public int multiply(int a, int b) {
        return a * b;
    }
}`
            }
        ],
        cpp: [
            {
                name: 'C++ Classes',
                code: `// C++ class example
#include <iostream>
#include <vector>
using namespace std;

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }
    
    int multiply(int a, int b) {
        return a * b;
    }
};

int main() {
    Calculator calc;
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    cout << "Addition: " << calc.add(10, 5) << endl;
    cout << "Multiplication: " << calc.multiply(3, 4) << endl;
    
    return 0;
}`
            }
        ]
    };
    
    res.json(examples[language] || examples.minilang);
});

// New endpoint for multi-language compilation
app.post('/api/compile-multi', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'No source code provided'
            });
        }

        if (!language) {
            return res.status(400).json({
                success: false,
                error: 'No language specified'
            });
        }

        // Handle MiniLang compilation
        if (language.toLowerCase() === 'minilang') {
            const result = compiler.compile(code);
            
            let executionResult = null;
            if (result.success && result.intermediateCode.length > 0) {
                executionResult = interpreter.execute(result.intermediateCode);
            }
            
            return res.json({
                success: result.success,
                tokens: compiler.formatTokens(result.tokens),
                ast: result.ast ? compiler.formatAST(result.ast) : null,
                intermediateCode: compiler.formatIntermediateCode(result.intermediateCode),
                symbolTable: result.symbolTable,
                errors: result.errors,
                warnings: result.warnings,
                execution: executionResult,
                language: 'MiniLang'
            });
        }

        // Handle other languages with multiple fallback options
        let result;
        
        // Try local compilation first
        try {
            result = await multiLangCompiler.compile(code, language);
            if (result.success) {
                return res.json(result);
            }
        } catch (localError) {
            console.log(`Local compilation failed for ${language}: ${localError.message}`);
        }
        
        // Try cloud compilation as fallback
        try {
            result = await cloudCompiler.compile(code, language);
            if (result.success) {
                return res.json(result);
            }
        } catch (cloudError) {
            console.log(`Cloud compilation failed for ${language}: ${cloudError.message}`);
        }
        
        // Final fallback to browser-based execution (for JavaScript)
        try {
            result = await browserCompiler.compile(code, language);
            res.json(result);
        } catch (browserError) {
            res.json({
                success: false,
                output: '',
                errors: `All compilation methods failed for ${language}. Please install local compilers or check your internet connection.`,
                executionOutput: '',
                compilationTime: 0,
                language: language,
                service: 'None'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Server error: ${error.message}`
        });
    }
});

// Endpoint to check compiler availability
app.get('/api/compilers', (req, res) => {
    const availability = multiLangCompiler.checkCompilerAvailability();
    res.json(availability);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`MiniLang Compiler Server running on http://localhost:${PORT}`);
    console.log('Open your browser to start using the compiler!');
});

module.exports = app;
