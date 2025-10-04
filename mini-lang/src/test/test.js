// Test Suite for MiniLang Compiler
const { MiniLangCompiler } = require('../compiler/compiler');
const { Interpreter } = require('../compiler/interpreter');

class TestSuite {
    constructor() {
        this.compiler = new MiniLangCompiler();
        this.interpreter = new Interpreter();
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    addTest(name, code, expectedSuccess = true, expectedOutput = null) {
        this.tests.push({
            name,
            code,
            expectedSuccess,
            expectedOutput
        });
    }

    runTests() {
        console.log('🧪 Running MiniLang Compiler Tests...\n');
        
        this.tests.forEach((test, index) => {
            console.log(`Test ${index + 1}: ${test.name}`);
            console.log(`Code: ${test.code}`);
            
            const result = this.compiler.compile(test.code);
            
            if (result.success === test.expectedSuccess) {
                if (test.expectedOutput && result.success) {
                    const execResult = this.interpreter.execute(result.intermediateCode);
                    if (JSON.stringify(execResult.output) === JSON.stringify(test.expectedOutput)) {
                        console.log('✅ PASSED\n');
                        this.passed++;
                    } else {
                        console.log(`❌ FAILED - Expected output: ${JSON.stringify(test.expectedOutput)}, Got: ${JSON.stringify(execResult.output)}\n`);
                        this.failed++;
                    }
                } else {
                    console.log('✅ PASSED\n');
                    this.passed++;
                }
            } else {
                console.log(`❌ FAILED - Expected success: ${test.expectedSuccess}, Got: ${result.success}`);
                if (result.errors.length > 0) {
                    console.log(`Errors: ${result.errors.map(e => e.message).join(', ')}`);
                }
                console.log('');
                this.failed++;
            }
        });
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        console.log(`Success rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);
    }
}

// Define test cases
const testSuite = new TestSuite();

// Basic tests
testSuite.addTest(
    'Simple variable assignment',
    'let x = 5;',
    true
);

testSuite.addTest(
    'Print statement',
    'let x = 10; print(x);',
    true,
    [10]
);

testSuite.addTest(
    'Arithmetic operations',
    'let a = 5; let b = 3; let sum = a + b; print(sum);',
    true,
    [8]
);

testSuite.addTest(
    'Complex expression',
    'let x = 10; let y = 5; let result = (x + y) * 2; print(result);',
    true,
    [30]
);

testSuite.addTest(
    'Multiple operations',
    'let a = 10; let b = 2; let sum = a + b; let diff = a - b; print(sum); print(diff);',
    true,
    [12, 8]
);

// Error tests
testSuite.addTest(
    'Undefined variable error',
    'print(undefined_var);',
    false
);

testSuite.addTest(
    'Syntax error - missing semicolon',
    'let x = 5',
    false
);

testSuite.addTest(
    'Syntax error - invalid expression',
    'let x = +;',
    false
);

// Run tests if this file is executed directly
if (require.main === module) {
    testSuite.runTests();
}

module.exports = { TestSuite };
