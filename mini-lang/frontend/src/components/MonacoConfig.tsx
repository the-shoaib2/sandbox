import { useEffect } from 'react';
import { loader } from '@monaco-editor/react';

export const useMonacoConfig = () => {
  useEffect(() => {
    loader.init().then((monaco) => {
      // Register MiniLang language
      monaco.languages.register({ id: 'minilang' });

      // Define MiniLang syntax highlighting
      monaco.languages.setMonarchTokensProvider('minilang', {
        tokenizer: {
          root: [
            // Keywords
            [/\b(let|print|if|else|while|for|function|return)\b/, 'keyword'],
            
            // Identifiers
            [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
            
            // Numbers
            [/\d+(\.\d+)?/, 'number'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            
            // Comments
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            
            // Operators
            [/[+\-*/=<>!&|]/, 'operator'],
            
            // Delimiters
            [/[{}()\[\]]/, 'delimiter.bracket'],
            [/[;,.]/, 'delimiter'],
            
            // Whitespace
            [/\s+/, 'white'],
          ],
          
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop']
          ],
          
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
        },
      });

      // Define MiniLang language configuration
      monaco.languages.setLanguageConfiguration('minilang', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      });

      // Add completion provider for MiniLang
      monaco.languages.registerCompletionItemProvider('minilang', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = [
            {
              label: 'let',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'let ${1:variable} = ${2:value};',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Declare a variable',
              range: range
            },
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'print ${1:expression};',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print a value to output',
              range: range
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Conditional statement',
              range: range
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'while (${1:condition}) {\n\t${2:// code}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While loop',
              range: range
            }
          ];

          return { suggestions };
        }
      });

      // Define custom theme for MiniLang
      monaco.editor.defineTheme('minilang-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
          { token: 'identifier', foreground: '9cdcfe' },
          { token: 'number', foreground: 'b5cea8' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
          { token: 'operator', foreground: 'd4d4d4' },
          { token: 'delimiter', foreground: 'd4d4d4' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editorLineNumber.foreground': '#858585',
          'editorCursor.foreground': '#aeafad',
          'editor.selectionBackground': '#264f78',
          'editor.lineHighlightBackground': '#2a2d2e',
        }
      });
    });
  }, []);
};

export default useMonacoConfig;
