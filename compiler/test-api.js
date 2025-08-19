// Test script to verify the compile-phases API
const fetch = require('node-fetch');

async function testCompilerAPI() {
  const testCode = `let x = 42;
let y = "Hello, World!";
function greet(name) {
    return "Hello, " + name;
}
let result = greet(y);`;

  try {
    console.log('Testing compiler API...');
    
    const response = await fetch('http://localhost:3001/api/compile-phases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCode: testCode,
        language: 'custom',
        fileName: 'test.js',
        optimize: false,
        debug: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testCompilerAPI();
