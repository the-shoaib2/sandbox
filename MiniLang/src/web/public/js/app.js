// MiniLang Compiler Web Interface
class MiniLangUI {
    constructor() {
        this.editor = null;
        this.examples = [];
        this.currentLanguage = 'minilang';
        this.languageExamples = {};
        this.init();
    }

    init() {
        this.setupMonacoEditor();
        this.setupEventListeners();
        this.loadExamples();
        this.setupTabs();
        this.initializeLanguageExamples();
    }

    setupMonacoEditor() {
        require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            // Initialize custom language definitions
            MonacoConfig.initializeLanguages();
            
            this.editor = monaco.editor.create(document.getElementById('codeEditor'), {
                value: `// Welcome to MiniLang!
// Try this example:

let x = 10;
let y = 5;
let result = x + y * 2;
print(result);`,
                ...MonacoConfig.getEditorOptions('minilang', 'vs-dark')
            });
            
            // Add keyboard shortcuts
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                this.compile();
            });
            
            // Add Ctrl+S to format code
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.editor.getAction('editor.action.formatDocument').run();
            });
        });
    }

    setupEventListeners() {
        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Theme selector
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // Compile button
        document.getElementById('compileBtn').addEventListener('click', () => {
            this.compile();
        });

        // Clear button
        document.getElementById('clearCode').addEventListener('click', () => {
            if (this.editor) {
                this.editor.setValue('');
                this.clearResults();
            }
        });

        // Load example button
        document.getElementById('loadExample').addEventListener('click', () => {
            this.showExampleModal();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.hideExampleModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('exampleModal');
            if (event.target === modal) {
                this.hideExampleModal();
            }
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                button.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        });
    }

    async loadExamples() {
        try {
            const response = await fetch(`/examples?language=${this.currentLanguage}`);
            this.examples = await response.json();
        } catch (error) {
            console.error('Failed to load examples:', error);
        }
    }

    async showExampleModal() {
        // Reload examples for current language
        await this.loadExamples();
        
        const modal = document.getElementById('exampleModal');
        const examplesList = document.getElementById('examplesList');
        
        examplesList.innerHTML = '';
        
        this.examples.forEach((example, index) => {
            const exampleDiv = document.createElement('div');
            exampleDiv.className = 'example-item';
            exampleDiv.innerHTML = `
                <div class="example-name">${example.name}</div>
                <div class="example-preview">${example.code.substring(0, 100)}...</div>
            `;
            
            exampleDiv.addEventListener('click', () => {
                if (this.editor) {
                    this.editor.setValue(example.code);
                    this.hideExampleModal();
                    if (this.currentLanguage === 'minilang') {
                        this.compile();
                    }
                }
            });
            
            examplesList.appendChild(exampleDiv);
        });
        
        modal.style.display = 'block';
    }

    hideExampleModal() {
        document.getElementById('exampleModal').style.display = 'none';
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        
        // Update language indicator
        const indicator = document.getElementById('languageIndicator');
        indicator.textContent = this.getLanguageDisplayName(language);
        indicator.className = `language-indicator ${language}`;
        
        if (this.editor) {
            const currentValue = this.editor.getValue();
            
            // Set Monaco language
            const model = this.editor.getModel();
            monaco.editor.setModelLanguage(model, this.getMonacoLanguage(language));
            
            // Load example for the selected language if editor is empty or has default content
            if (!currentValue.trim() || this.isDefaultContent(currentValue)) {
                this.loadLanguageExample(language);
            }
            
            // Reload examples for the new language
            this.loadExamples();
        }
    }
    
    getLanguageDisplayName(language) {
        const displayNames = {
            'minilang': 'MiniLang',
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust',
            'typescript': 'TypeScript'
        };
        return displayNames[language] || language.toUpperCase();
    }
    
    changeTheme(theme) {
        if (this.editor) {
            monaco.editor.setTheme(theme);
        }
    }
    
    getMonacoLanguage(language) {
        const languageMap = {
            'minilang': 'minilang',
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'typescript': 'typescript'
        };
        return languageMap[language] || 'plaintext';
    }
    
    isDefaultContent(content) {
        return content.includes('Welcome to MiniLang') || content.includes('let x = 10');
    }
    
    loadLanguageExample(language) {
        const example = this.languageExamples[language];
        if (example && this.editor) {
            this.editor.setValue(example);
        }
    }
    
    initializeLanguageExamples() {
        this.languageExamples = {
            'minilang': `// Welcome to MiniLang!
// Try this example:

let x = 10;
let y = 5;
let result = x + y * 2;
print(result);`,
            'javascript': `// JavaScript Example
const x = 10;
const y = 5;
const result = x + y * 2;
console.log(result);

// Function example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
            'python': `# Python Example
x = 10
y = 5
result = x + y * 2
print(result)

# Function example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
            'java': `// Java Example
public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 5;
        int result = x + y * 2;
        System.out.println(result);
        
        // Fibonacci example
        System.out.println(fibonacci(10));
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
            'cpp': `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int x = 10;
    int y = 5;
    int result = x + y * 2;
    cout << result << endl;
    
    cout << fibonacci(10) << endl;
    return 0;
}`,
            'c': `// C Example
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int x = 10;
    int y = 5;
    int result = x + y * 2;
    printf("%d\\n", result);
    
    printf("%d\\n", fibonacci(10));
    return 0;
}`,
            'csharp': `// C# Example
using System;

class Program {
    static void Main() {
        int x = 10;
        int y = 5;
        int result = x + y * 2;
        Console.WriteLine(result);
        
        Console.WriteLine(Fibonacci(10));
    }
    
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}`,
            'go': `// Go Example
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    x := 10
    y := 5
    result := x + y*2
    fmt.Println(result)
    
    fmt.Println(fibonacci(10))
}`,
            'rust': `// Rust Example
fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let x = 10;
    let y = 5;
    let result = x + y * 2;
    println!("{}", result);
    
    println!("{}", fibonacci(10));
}`,
            'typescript': `// TypeScript Example
function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const x: number = 10;
const y: number = 5;
const result: number = x + y * 2;
console.log(result);

console.log(fibonacci(10));`
        };
    }

    async compile() {
        if (!this.editor) {
            this.updateStatus('error', 'Editor not initialized');
            return;
        }
        
        const sourceCode = this.editor.getValue();
        
        if (!sourceCode.trim()) {
            this.updateStatus('error', 'No code to compile');
            return;
        }

        this.updateStatus('compiling', 'Compiling...');
        this.clearResults();

        try {
            let endpoint, requestBody;
            
            if (this.currentLanguage === 'minilang') {
                endpoint = '/api/compile';
                requestBody = { code: sourceCode };
            } else {
                endpoint = '/api/compile-multi';
                requestBody = { code: sourceCode, language: this.currentLanguage };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            
            if (this.currentLanguage === 'minilang') {
                this.displayResults(result);
            } else {
                this.displayMultiLangResults(result);
            }
            
        } catch (error) {
            this.updateStatus('error', 'Network error');
            this.displayErrors([{
                type: 'NETWORK_ERROR',
                message: `Failed to connect to compiler: ${error.message}`
            }]);
        }
    }

    updateStatus(type, message) {
        const indicator = document.getElementById('statusIndicator');
        indicator.textContent = message;
        indicator.className = `status-indicator ${type}`;
    }

    clearResults() {
        document.getElementById('tokensOutput').innerHTML = '<p class="placeholder">Compile your code to see tokens...</p>';
        document.getElementById('astOutput').innerHTML = '<p class="placeholder">Compile your code to see the AST...</p>';
        document.getElementById('intermediateOutput').innerHTML = '<p class="placeholder">Compile your code to see intermediate code...</p>';
        document.getElementById('symbolsOutput').innerHTML = '<p class="placeholder">Compile your code to see the symbol table...</p>';
        document.getElementById('executionOutput').innerHTML = '<p class="placeholder">Compile your code to see execution results...</p>';
        document.getElementById('errorsOutput').innerHTML = '<p class="placeholder">No errors or warnings.</p>';
    }

    displayResults(result) {
        // Display tokens
        this.displayTokens(result.tokens);
        
        // Display AST
        this.displayAST(result.ast);
        
        // Display intermediate code
        this.displayIntermediateCode(result.intermediateCode);
        
        // Display symbol table
        this.displaySymbolTable(result.symbolTable);
        
        // Display execution results
        this.displayExecution(result.execution);
        
        // Display any errors or warnings
        if (result.errors && result.errors.length > 0) {
            this.displayErrors(result.errors);
        } else {
            document.getElementById('errorsOutput').innerHTML = '<p class="placeholder success-state">✅ No errors or warnings.</p>';
        }
    }

    displayMultiLangResults(result) {
        // Clear MiniLang-specific tabs
        document.getElementById('tokensOutput').innerHTML = '<p class="placeholder">Not available for this language</p>';
        document.getElementById('astOutput').innerHTML = '<p class="placeholder">Not available for this language</p>';
        document.getElementById('intermediateOutput').innerHTML = '<p class="placeholder">Not available for this language</p>';
        document.getElementById('symbolsOutput').innerHTML = '<p class="placeholder">Not available for this language</p>';
        
        // Display execution results
        const executionContainer = document.getElementById('executionOutput');
        if (result.success) {
            this.updateStatus('success', `${result.language} compilation successful`);
            
            let html = '<div class="execution-results">';
            html += `<h4>🎯 ${result.language} Execution Results</h4>`;
            
            if (result.executionOutput) {
                html += '<div class="output-section">';
                html += '<h5>Program Output:</h5>';
                html += `<pre class="output-text">${result.executionOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
                html += '</div>';
            }
            
            if (result.output && result.output !== 'Compilation successful' && result.output !== 'Execution successful') {
                html += '<div class="compilation-info">';
                html += '<h5>Compilation Info:</h5>';
                html += `<pre class="info-text">${result.output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
                html += '</div>';
            }
            
            html += '</div>';
            executionContainer.innerHTML = html;
            
            // Clear errors
            document.getElementById('errorsOutput').innerHTML = '<p class="placeholder success-state">✅ No errors or warnings.</p>';
        } else {
            this.updateStatus('error', `${result.language} compilation failed`);
            executionContainer.innerHTML = '<p class="placeholder">Compilation failed</p>';
            
            // Display errors
            if (result.errors) {
                const errorHtml = `<div class="error-item error">
                    <strong>Compilation Error:</strong><br>
                    <pre>${result.errors.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>`;
                document.getElementById('errorsOutput').innerHTML = errorHtml;
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayTokens(tokens) {
        const container = document.getElementById('tokensOutput');
        
        if (!tokens || tokens.length === 0) {
            container.innerHTML = '<p class="placeholder">No tokens generated.</p>';
            return;
        }

        const tokenList = document.createElement('div');
        tokenList.className = 'token-list';
        
        tokens.forEach(token => {
            if (token.type === 'EOF' || token.type === 'NEWLINE' || token.type === 'COMMENT') return;
            
            const tokenElement = document.createElement('span');
            tokenElement.className = `token ${token.type}`;
            tokenElement.textContent = `${token.type}: ${token.value}`;
            tokenElement.title = `Position: ${token.position}`;
            tokenList.appendChild(tokenElement);
        });
        
        container.innerHTML = '';
        container.appendChild(tokenList);
    }

    displayAST(ast) {
        const container = document.getElementById('astOutput');
        
        if (!ast) {
            container.innerHTML = '<p class="placeholder">No AST generated.</p>';
            return;
        }

        const astDiv = document.createElement('div');
        astDiv.className = 'ast-tree';
        astDiv.textContent = ast;
        
        container.innerHTML = '';
        container.appendChild(astDiv);
    }

    displayIntermediateCode(code) {
        const container = document.getElementById('intermediateOutput');
        
        if (!code || code.length === 0) {
            container.innerHTML = '<p class="placeholder">No intermediate code generated.</p>';
            return;
        }

        const codeDiv = document.createElement('div');
        codeDiv.className = 'intermediate-code';
        
        code.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'code-line';
            lineDiv.innerHTML = `
                <span class="line-number">${line.line}</span>
                <span class="instruction">${line.instruction}</span>
            `;
            codeDiv.appendChild(lineDiv);
        });
        
        container.innerHTML = '';
        container.appendChild(codeDiv);
    }

    displaySymbolTable(symbolTable) {
        const container = document.getElementById('symbolsOutput');
        
        if (!symbolTable || Object.keys(symbolTable).length === 0) {
            container.innerHTML = '<p class="placeholder">No symbols in table.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'symbol-table';
        
        // Header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        Object.entries(symbolTable).forEach(([symbol, info]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${symbol}</td>
                <td>${info.type}</td>
                <td>${info.initialized ? 'Initialized' : 'Declared'}</td>
            `;
            tbody.appendChild(row);
        });
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    displayErrors(errors) {
        const container = document.getElementById('errorsOutput');
        
        if (!errors || errors.length === 0) {
            container.innerHTML = '<p class="placeholder">No errors or warnings.</p>';
            return;
        }

        const errorsDiv = document.createElement('div');
        
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = `error-item ${error.type.includes('WARNING') ? 'warning' : 'error'}`;
            
            let errorText = `${error.type}: ${error.message}`;
            if (error.line) {
                errorText += ` (Line ${error.line}`;
                if (error.column) {
                    errorText += `, Column ${error.column}`;
                }
                errorText += ')';
            }
            if (error.phase) {
                errorText += ` - ${error.phase} Phase`;
            }
            
            errorDiv.textContent = errorText;
            errorsDiv.appendChild(errorDiv);
        });
        
        container.innerHTML = '';
        container.appendChild(errorsDiv);
    }

    displayExecution(execution) {
        const container = document.getElementById('executionOutput');
        
        if (!execution) {
            container.innerHTML = '<p class="placeholder">No execution results.</p>';
            return;
        }

        const executionDiv = document.createElement('div');
        
        if (execution.success) {
            // Display program output
            if (execution.output && execution.output.length > 0) {
                const outputSection = document.createElement('div');
                outputSection.innerHTML = '<h4>📤 Program Output:</h4>';
                
                const outputList = document.createElement('div');
                outputList.className = 'execution-output';
                
                execution.output.forEach((value, index) => {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'output-line';
                    outputLine.textContent = `${index + 1}: ${value}`;
                    outputList.appendChild(outputLine);
                });
                
                outputSection.appendChild(outputList);
                executionDiv.appendChild(outputSection);
            }
            
            // Display final variable values
            if (execution.variables && Object.keys(execution.variables).length > 0) {
                const varsSection = document.createElement('div');
                varsSection.innerHTML = '<h4 style="margin-top: 15px;">💾 Final Variable Values:</h4>';
                
                const varsTable = document.createElement('table');
                varsTable.className = 'symbol-table';
                varsTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                
                const tbody = varsTable.querySelector('tbody');
                Object.entries(execution.variables).forEach(([name, value]) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${name}</td>
                        <td>${value}</td>
                    `;
                    tbody.appendChild(row);
                });
                
                varsSection.appendChild(varsTable);
                executionDiv.appendChild(varsSection);
            }
        } else {
            // Display execution errors
            const errorSection = document.createElement('div');
            errorSection.innerHTML = '<h4>❌ Execution Errors:</h4>';
            
            execution.errors.forEach(error => {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-item error';
                errorDiv.textContent = `${error.type}: ${error.message}`;
                errorSection.appendChild(errorDiv);
            });
            
            executionDiv.appendChild(errorSection);
        }
        
        container.innerHTML = '';
        container.appendChild(executionDiv);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MiniLangUI();
});
