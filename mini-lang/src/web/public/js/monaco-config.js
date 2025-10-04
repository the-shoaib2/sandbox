// Monaco Editor Configuration and Language Definitions
class MonacoConfig {
    static initializeLanguages() {
        // Define custom MiniLang language with better syntax highlighting
        monaco.languages.register({ id: 'minilang' });
        
        monaco.languages.setMonarchTokensProvider('minilang', {
            keywords: ['let', 'print'],
            operators: ['+', '-', '*', '/', '='],
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            
            tokenizer: {
                root: [
                    // Keywords
                    [/\b(let|print)\b/, 'keyword'],
                    
                    // Numbers
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/\d+/, 'number'],
                    
                    // Identifiers
                    [/[a-zA-Z_]\w*/, 'identifier'],
                    
                    // Comments
                    [/\/\/.*$/, 'comment'],
                    
                    // Operators and punctuation
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],
                    
                    // Whitespace
                    [/\s+/, 'white'],
                    
                    // Strings (if we add them later)
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string'],
                ],
                
                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, 'string', '@pop']
                ]
            }
        });
        
        // Define theme for MiniLang
        monaco.editor.defineTheme('minilang-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
                { token: 'identifier', foreground: '9cdcfe' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'operator', foreground: 'd4d4d4' },
                { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
                { token: 'string', foreground: 'ce9178' }
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#858585',
                'editorCursor.foreground': '#aeafad',
                'editor.selectionBackground': '#264f78',
                'editor.lineHighlightBackground': '#2a2d2e'
            }
        });
        
        // Configure language features
        monaco.languages.registerCompletionItemProvider('minilang', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'let',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'let ${1:variable} = ${2:value};',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Variable declaration'
                    },
                    {
                        label: 'print',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'print(${1:expression});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Print statement'
                    }
                ];
                
                return { suggestions };
            }
        });
    }
    
    static getEditorOptions(language = 'minilang', theme = 'vs-dark') {
        return {
            language: language,
            theme: theme,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            minimap: { enabled: true },
            wordWrap: 'on',
            folding: true,
            lineNumbersMinChars: 3,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
            },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            formatOnType: true,
            formatOnPaste: true,
            dragAndDrop: true,
            links: true,
            colorDecorators: true,
            contextmenu: true,
            mouseWheelZoom: true,
            multiCursorModifier: 'ctrlCmd',
            accessibilitySupport: 'auto'
        };
    }
}

// Export for use in main app
window.MonacoConfig = MonacoConfig;
