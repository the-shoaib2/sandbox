# MiniLang Compiler

A simple compiler for the MiniLang programming language with a web-based interface.

## Features

- **Lexical Analysis**: Tokenizes MiniLang source code
- **Syntax Analysis**: Parses tokens into Abstract Syntax Trees (AST)
- **Code Generation**: Generates three-address intermediate code
- **Web Interface**: Interactive compiler with real-time visualization
- **Error Handling**: Comprehensive error reporting and debugging

## MiniLang Language Specification

MiniLang supports:
- Variable declarations: `let x = 5;`
- Arithmetic operations: `+`, `-`, `*`, `/`
- Print statements: `print(expression);`
- Comments: `// single line comments`

## Usage

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open browser to `http://localhost:3000`
4. Write MiniLang code and see compilation results in real-time

## Project Structure

```
MiniLang/
├── src/
│   ├── compiler/
│   │   ├── lexer.js       # Lexical analyzer
│   │   ├── parser.js      # Syntax analyzer
│   │   ├── codegen.js     # Code generator
│   │   └── errors.js      # Error handling
│   ├── web/
│   │   ├── public/        # Static assets
│   │   ├── views/         # HTML templates
│   │   └── server.js      # Express server
│   └── examples/          # Sample MiniLang programs
├── package.json
└── README.md
```

## Team

- Odito Al Nafiu: Project Lead + Backend Developer, Frontend Developer
- Ishrat Jahan: Frontend Developer, Data Visualizer, Tester/Documenter
