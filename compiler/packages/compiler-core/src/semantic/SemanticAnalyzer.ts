import { Node, Identifier, Declaration, Program, FunctionDeclaration } from '../types/unified';

type SymbolTable = Map<string, {
  type: 'variable' | 'function';
  declaredAt: number;
  isUsed: boolean;
  node: Node;
}>;

export class SemanticError extends Error {
  constructor(message: string, public node: Node) {
    super(message);
    this.name = 'SemanticError';
  }
}

export class SemanticAnalyzer {
  private symbolTables: SymbolTable[] = [new Map()];
  private currentScope: number = 0;
  private errors: string[] = [];
  private nodeCount: number = 0;

  constructor(private ast: Node) {}

  private get symbolTable(): SymbolTable {
    return this.symbolTables[this.currentScope];
  }

  private lookupInCurrentScope(name: string): boolean {
    return this.symbolTable.has(name);
  }

  private enterScope(): void {
    this.symbolTables.push(new Map());
    this.currentScope++;
  }

  private leaveScope(): void {
    if (this.currentScope > 0) {
      this.symbolTables.pop();
      this.currentScope--;
    }
  }

  analyze(): { errors: string[] } {
    this.processNode(this.ast);
    return { errors: this.errors };
  }

  private processDeclarations(program: Node): void {
    for (const node of (program as any).body) {
      if (node.type === 'FunctionDeclaration') {
        this.declareFunction(node);
      } else if (node.type === 'VariableDeclaration') {
        this.processVariableDeclaration(node);
      }
    }
  }

  private declareFunction(node: Node): void {
    const funcName = (node as any).id?.name;
    if (!funcName) return;
    
    if (this.lookupInCurrentScope(funcName)) {
      this.errors.push(`Function '${funcName}' is already declared in this scope`);
      return;
    }
    
    this.symbolTables[this.currentScope].set(funcName, {
      type: 'function',
      declaredAt: this.nodeCount,
      isUsed: false,
      node
    });
  }

  private processVariableDeclaration(node: Node): void {
    for (const declaration of (node as any).declarations) {
      this.declareVariable(declaration.id as Identifier, 'variable');
      if (declaration.init) {
        this.processNode(declaration.init as Node);
      }
    }
  }

  private declareVariable(identifier: Identifier, kind: 'variable' | 'function'): void {
    const varName = identifier.name;
    
    if (this.lookupInCurrentScope(varName)) {
      this.errors.push(`Variable '${varName}' is already declared in this scope`);
      return;
    }
    
    this.symbolTables[this.currentScope].set(varName, {
      type: kind,
      declaredAt: this.nodeCount,
      isUsed: false,
      node: identifier
    });
  }

  private processNode(node: Node): void {
    if (!node) return;
    
    this.nodeCount++;
    
    switch (node.type) {
      case 'Program':
        // Handle program body if it exists
        if ('body' in node && Array.isArray((node as any).body)) {
          (node as any).body.forEach((stmt: Node) => this.processNode(stmt));
        }
        break;
        
      case 'FunctionDeclaration':
        this.enterScope();
        this.declareFunction(node);
        // Handle function parameters if they exist
        if ('params' in node && Array.isArray((node as any).params)) {
          (node as any).params.forEach((param: Node) => this.declareVariable(param as Identifier, 'variable'));
        }
        // Handle function body if it exists
        if ('body' in node) {
          if (Array.isArray((node as any).body)) {
            (node as any).body.forEach((stmt: Node) => this.processNode(stmt));
          } else if (typeof (node as any).body === 'object' && (node as any).body !== null) {
            this.processNode((node as any).body);
          }
        }
        this.leaveScope();
        break;
        
      case 'VariableDeclaration':
        // Handle variable declarations if they exist
        if ('declarations' in node && Array.isArray((node as any).declarations)) {
          (node as any).declarations.forEach((decl: any) => {
            if (decl.id) {
              this.declareVariable(decl.id as Identifier, 'variable');
            }
            if (decl.init) {
              this.processNode(decl.init as Node);
            }
          });
        }
        break;
        
      case 'Identifier':
        this.checkIdentifier(node as Identifier);
        break;
        
      case 'ReturnStatement':
        if ('argument' in node && node.argument) {
          this.processNode(node.argument as Node);
        }
        break;

      // Handle expressions
      case 'BinaryExpression':
      case 'UnaryExpression':
      case 'CallExpression':
      case 'MemberExpression':
      case 'ConditionalExpression':
        // Process all child nodes that are AST nodes
        Object.values(node).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(child => {
              if (child && typeof child === 'object' && 'type' in child) {
                this.processNode(child as Node);
              }
            });
          } else if (value && typeof value === 'object' && 'type' in value) {
            this.processNode(value as Node);
          }
        });
        break;
        
      // Ignore these node types for now
      case 'Literal':
      case 'ThisExpression':
      case 'Super':
        break;
        
      default:
        // For debugging - uncomment to see unhandled node types
        // console.warn(`Unhandled node type: ${node.type}`);
        break;
    }
  }

  private checkIdentifier(identifier: Identifier): void {
    if (!this.symbolTable.has(identifier.name)) {
      throw new SemanticError(`Identifier '${identifier.name}' is not defined`, identifier);
    }
  }

  private processCallExpression(node: any): void {
    const callee = node.callee;
    
    if (callee.type === 'Identifier') {
      const symbol = this.symbolTable.get(callee.name);
      
      if (!symbol) {
        throw new SemanticError(`Function '${callee.name}' is not defined`, callee);
      }
      
      if (symbol.type !== 'function') {
        throw new SemanticError(`'${callee.name}' is not a function`, callee);
      }
      
      // Check arguments count
      const funcDecl = symbol.node as FunctionDeclaration;
      if (node.arguments.length !== funcDecl.params.length) {
        throw new SemanticError(
          `Expected ${funcDecl.params.length} arguments but got ${node.arguments.length}`,
          node
        );
      }
    }
    
    // Process arguments
    node.arguments.forEach((arg: any) => this.processNode(arg));
  }
}

export function analyze(ast: Program): void {
  const analyzer = new SemanticAnalyzer(ast);
  analyzer.analyze();
}
