import { Program, Node, Identifier, Literal, BinaryExpression, UnaryExpression, CallExpression, VariableDeclaration, FunctionDeclaration, IfStatement, ReturnStatement, Expression } from '../types/unified';

type IRValue = string | number | boolean | null;

export interface IRInstruction {
  op: string;
  dest?: string;
  args?: (string | number | boolean | null)[];
  label?: string;
  func?: string;
  params?: string[];
}

export class IRGenerator {
  private tempCount = 0;
  private labelCount = 0;
  private currentFunction: string | null = null;
  private instructions: IRInstruction[] = [];
  private variables = new Map<string, string>();
  private scopes: Set<string>[] = [new Set()];

  generate(ast: Program): IRInstruction[] {
    this.instructions = [];
    this.currentFunction = null;
    this.enterScope();
    
    // Process global declarations
    for (const node of ast.body) {
      if (node.type === 'FunctionDeclaration') {
        this.processFunctionDeclaration(node as FunctionDeclaration);
      } else if (node.type === 'VariableDeclaration') {
        this.processVariableDeclaration(node as VariableDeclaration);
      }
    }
    
    this.leaveScope();
    return this.instructions;
  }

  private enterScope(): void {
    this.scopes.push(new Set());
  }

  private leaveScope(): void {
    this.scopes.pop();
  }

  private addVariable(name: string): string {
    const temp = `t${this.tempCount++}`;
    this.scopes[this.scopes.length - 1].add(name);
    this.variables.set(name, temp);
    return temp;
  }

  private getVariable(name: string): string {
    // Search from innermost to outermost scope
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.variables.get(name) || name;
      }
    }
    return name; // Return original name if not found (will be caught by semantic analysis)
  }

  private newLabel(prefix = 'L'): string {
    return `${prefix}${this.labelCount++}`;
  }

  private addInstruction(instr: IRInstruction): void {
    this.instructions.push(instr);
  }

  private processFunctionDeclaration(node: FunctionDeclaration): void {
    // Save current function context
    const previousFunction = this.currentFunction;
    this.currentFunction = node.id.name;
    
    // Add function header
    this.addInstruction({
      op: 'func',
      dest: node.id.name,
      params: node.params.map(p => p.name)
    });
    
    this.enterScope();
    
    // Process parameters
    for (const param of node.params) {
      this.addVariable(param.name);
    }
    
    // Process function body
    this.processNode(node.body);
    
    // Add implicit return if needed
    if (this.instructions[this.instructions.length - 1]?.op !== 'ret') {
      this.addInstruction({ op: 'ret', args: [null] });
    }
    
    this.leaveScope();
    this.currentFunction = previousFunction;
  }

  private processVariableDeclaration(node: VariableDeclaration): void {
    for (const decl of node.declarations) {
      const varName = decl.id.name;
      const temp = this.addVariable(varName);
      
      if (decl.init) {
        const value = this.processExpression(decl.init);
        this.addInstruction({
          op: '=',
          dest: temp,
          args: [value]
        });
      }
    }
  }

  private processNode(node: Node): void {
    switch (node.type) {
      case 'Program':
        node.body.forEach((stmt: any) => this.processNode(stmt));
        break;
      
      case 'BlockStatement':
        this.enterScope();
        for (const stmt of node.body) {
          this.processNode(stmt);
        }
        this.leaveScope();
        break;
      
      case 'ExpressionStatement':
        this.processExpression(node.expression);
        break;
      
      case 'IfStatement':
        this.processIfStatement(node as IfStatement);
        break;
      
      case 'ReturnStatement':
        const value = node.argument ? this.processExpression(node.argument) : null;
        this.addInstruction({
          op: 'ret',
          args: [value]
        });
        break;
      
      // Add more statement types as needed
    }
  }

  private processIfStatement(node: IfStatement): void {
    const test = this.processExpression(node.test);
    const elseLabel = this.newLabel('else');
    const endLabel = this.newLabel('endif');
    
    // Jump to else if condition is false
    this.addInstruction({
      op: 'jmpf',
      args: [test, elseLabel]
    });
    
    // Then branch
    this.processNode(node.consequent);
    this.addInstruction({
      op: 'jmp',
      args: [endLabel]
    });
    
    // Else branch (if it exists)
    this.addInstruction({
      op: 'label',
      label: elseLabel
    });
    
    if (node.alternate) {
      this.processNode(node.alternate);
    }
    
    this.addInstruction({
      op: 'label',
      label: endLabel
    });
  }

  private processExpression(node: Expression): string | number | boolean | null {
    switch (node.type) {
      case 'Identifier':
        return this.getVariable(node.name);
      
      case 'Literal':
        return node.value;
      
      case 'BinaryExpression':
        return this.processBinaryExpression(node as BinaryExpression);
      
      case 'UnaryExpression':
        return this.processUnaryExpression(node as UnaryExpression);
      
      case 'CallExpression':
        return this.processCallExpression(node as CallExpression);
      
      // Add more expression types as needed
      
      default:
        throw new Error(`Unsupported expression type: ${(node as any).type}`);
    }
  }

  private processBinaryExpression(node: BinaryExpression): string {
    const left = this.processExpression(node.left);
    const right = this.processExpression(node.right);
    const temp = `t${this.tempCount++}`;
    
    this.addInstruction({
      op: node.operator,
      dest: temp,
      args: [left, right]
    });
    
    return temp;
  }

  private processUnaryExpression(node: UnaryExpression): string {
    const arg = this.processExpression(node.argument);
    const temp = `t${this.tempCount++}`;
    
    this.addInstruction({
      op: node.operator,
      dest: temp,
      args: [arg]
    });
    
    return temp;
  }

  private processCallExpression(node: CallExpression): string {
    if (node.callee.type !== 'Identifier') {
      throw new Error('Only simple function calls are supported');
    }
    
    const args = node.arguments.map(arg => this.processExpression(arg as any));
    const temp = `t${this.tempCount++}`;
    
    this.addInstruction({
      op: 'call',
      dest: temp,
      func: node.callee.name,
      args
    });
    
    return temp;
  }
}

export function generateIR(ast: Program): IRInstruction[] {
  const generator = new IRGenerator();
  return generator.generate(ast);
}
