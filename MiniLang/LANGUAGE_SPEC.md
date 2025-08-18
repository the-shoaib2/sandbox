# MiniLang Language Specification

## Overview
MiniLang is a simple programming language designed for educational purposes to demonstrate compiler construction concepts.

## Grammar (EBNF)

```ebnf
program         ::= statement_list
statement_list  ::= statement*
statement       ::= let_statement | print_statement
let_statement   ::= 'let' IDENTIFIER '=' expression ';'
print_statement ::= 'print' '(' expression ')' ';'
expression      ::= term (('+' | '-') term)*
term            ::= factor (('*' | '/') factor)*
factor          ::= NUMBER | IDENTIFIER | '(' expression ')'
```

## Tokens

| Token Type | Description | Example |
|------------|-------------|---------|
| `LET` | Variable declaration keyword | `let` |
| `PRINT` | Print function keyword | `print` |
| `IDENTIFIER` | Variable names | `x`, `myVar`, `result` |
| `NUMBER` | Integer or floating-point numbers | `42`, `3.14` |
| `ASSIGN` | Assignment operator | `=` |
| `PLUS` | Addition operator | `+` |
| `MINUS` | Subtraction operator | `-` |
| `MULTIPLY` | Multiplication operator | `*` |
| `DIVIDE` | Division operator | `/` |
| `LPAREN` | Left parenthesis | `(` |
| `RPAREN` | Right parenthesis | `)` |
| `SEMICOLON` | Statement terminator | `;` |
| `COMMENT` | Single-line comment | `// comment` |

## Language Features

### Variable Declaration
```minilang
let x = 10;
let pi = 3.14159;
let result = x + pi;
```

### Arithmetic Operations
- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`

### Print Statements
```minilang
print(42);
print(x + y);
print((a + b) * c);
```

### Comments
```minilang
// This is a single-line comment
let x = 5; // Inline comment
```

## Example Programs

### Basic Calculator
```minilang
let a = 10;
let b = 5;
let sum = a + b;
let difference = a - b;
let product = a * b;
let quotient = a / b;

print(sum);
print(difference);
print(product);
print(quotient);
```

### Complex Expressions
```minilang
let x = 10;
let y = 5;
let z = (x + y) * 2 - 3;
print(z); // Outputs: 27
```

## Compilation Phases

1. **Lexical Analysis**: Converts source code into tokens
2. **Syntax Analysis**: Parses tokens into an Abstract Syntax Tree (AST)
3. **Code Generation**: Generates three-address intermediate code
4. **Execution**: Interprets the intermediate code (optional)

## Error Handling

The compiler provides comprehensive error reporting for:
- Lexical errors (invalid characters)
- Syntax errors (grammar violations)
- Semantic errors (undefined variables)
- Runtime errors (division by zero, etc.)

## Three-Address Code Format

The compiler generates intermediate code in three-address format:

```
t1 = 10 + 5
t2 = t1 * 2
result = t2 - 3
print result
```

## Future Extensions

Potential language extensions:
- Boolean data type and operations
- Conditional statements (if/else)
- Loop constructs (while, for)
- Function definitions
- Arrays and strings
- File I/O operations
