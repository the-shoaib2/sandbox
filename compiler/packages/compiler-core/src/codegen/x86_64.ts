import { IRInstruction } from '../ir/IRGenerator';

export class X86_64CodeGenerator {
  private output: string[] = [];
  private labelCount = 0;
  private tempToReg: Map<string, string> = new Map();
  private nextReg = 0;
  private readonly regs = ['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15'];
  private usedRegs: Set<string> = new Set();
  private stackOffset = 0;
  private variables = new Map<string, number>();
  private currentFunction: string | null = null;

  generate(ir: IRInstruction[]): string {
    this.output = [];
    this.emitHeader();

    // First pass: process function declarations
    for (const instr of ir) {
      if (instr.op === 'func') {
        this.emitFunctionPrologue(instr.dest!);
      }
    }

    // Second pass: generate code
    for (const instr of ir) {
      this.generateInstruction(instr);
    }

    return this.output.join('\n');
  }

  private emitHeader(): void {
    this.output.push('.intel_syntax noprefix');
    this.output.push('.global main');
    this.output.push('');
  }

  private emitFunctionPrologue(name: string): void {
    this.currentFunction = name;
    this.output.push(`
${name}:`);
    this.output.push('  push rbp');
    this.output.push('  mov rbp, rsp');
  }

  private emitFunctionEpilogue(): void {
    this.output.push('  mov rsp, rbp');
    this.output.push('  pop rbp');
    this.output.push('  ret');
    this.currentFunction = null;
  }

  private getRegister(temp: string): string {
    if (this.tempToReg.has(temp)) {
      return this.tempToReg.get(temp)!;
    }

    if (this.nextReg >= this.regs.length) {
      // Spill to stack
      this.stackOffset += 8;
      this.variables.set(temp, -this.stackOffset);
      return `[rbp - ${this.stackOffset}]`;
    }

    const reg = this.regs[this.nextReg++];
    this.usedRegs.add(reg);
    this.tempToReg.set(temp, reg);
    return reg;
  }

  private freeRegister(reg: string): void {
    if (this.usedRegs.has(reg)) {
      this.usedRegs.delete(reg);
      // Find and remove from tempToReg
      for (const [temp, r] of this.tempToReg.entries()) {
        if (r === reg) {
          this.tempToReg.delete(temp);
          break;
        }
      }
      // Reset nextReg if possible
      this.nextReg = Math.min(this.nextReg, this.regs.indexOf(reg));
    }
  }

  private generateInstruction(instr: IRInstruction): void {
    switch (instr.op) {
      case 'func':
        this.emitFunctionPrologue(instr.dest!);
        // Allocate space for parameters
        for (let i = 0; i < (instr.params?.length || 0); i++) {
          const reg = this.regs[i];
          const paramTemp = instr.params![i];
          this.tempToReg.set(paramTemp, reg);
          this.usedRegs.add(reg);
        }
        break;

      case '=':
        if (instr.dest && instr.args && instr.args.length === 1) {
          const dest = this.getRegister(instr.dest);
          const src = instr.args[0];
          if (typeof src === 'number') {
            this.output.push(`  mov ${dest}, ${src}`);
          } else if (typeof src === 'string' && this.tempToReg.has(src)) {
            this.output.push(`  mov ${dest}, ${this.tempToReg.get(src)}`);
          } else if (typeof src === 'string') {
            this.output.push(`  mov ${dest}, ${src}`);
          }
        }
        break;

      case '+':
      case '-':
      case '*':
      case '/':
        if (instr.dest && instr.args && instr.args.length === 2) {
          const dest = this.getRegister(instr.dest);
          const left = this.getRegister(instr.args[0] as string);
          const right = this.getRegister(instr.args[1] as string);
          
          switch (instr.op) {
            case '+':
              this.output.push(`  add ${dest}, ${right}`);
              break;
            case '-':
              this.output.push(`  sub ${dest}, ${right}`);
              break;
            case '*':
              this.output.push(`  imul ${dest}, ${right}`);
              break;
            case '/':
              this.output.push('  cqo');
              this.output.push(`  idiv ${right}`);
              break;
          }
          
          this.freeRegister(left);
          this.freeRegister(right);
        }
        break;

      case 'jmp':
        if (instr.args && instr.args.length === 1) {
          this.output.push(`  jmp ${instr.args[0]}`);
        }
        break;

      case 'jmpf':
        if (instr.args && instr.args.length === 2) {
          const cond = this.getRegister(instr.args[0] as string);
          const label = instr.args[1] as string;
          this.output.push(`  test ${cond}, ${cond}`);
          this.output.push(`  jz ${label}`);
          this.freeRegister(cond);
        }
        break;

      case 'label':
        if (instr.label) {
          this.output.push(`${instr.label}:`);
        }
        break;

      case 'call':
        if (instr.func) {
          // Save caller-saved registers
          const callerSaved = ['rax', 'rcx', 'rdx', 'rsi', 'rdi', 'r8', 'r9', 'r10', 'r11'];
          const savedRegs: string[] = [];
          
          for (const reg of callerSaved) {
            if (this.usedRegs.has(reg)) {
              this.output.push(`  push ${reg}`);
              savedRegs.push(reg);
            }
          }
          
          // Move arguments to correct registers
          const argRegs = ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9'];
          for (let i = 0; i < Math.min(instr.args?.length || 0, argRegs.length); i++) {
            const arg = instr.args![i];
            if (typeof arg === 'string' && this.tempToReg.has(arg)) {
              this.output.push(`  mov ${argRegs[i]}, ${this.tempToReg.get(arg)}`);
            } else if (typeof arg === 'number') {
              this.output.push(`  mov ${argRegs[i]}, ${arg}`);
            }
          }
          
          // Call function
          this.output.push(`  call ${instr.func}`);
          
          // Restore caller-saved registers
          for (let i = savedRegs.length - 1; i >= 0; i--) {
            this.output.push(`  pop ${savedRegs[i]}`);
          }
          
          // Store return value
          if (instr.dest) {
            const dest = this.getRegister(instr.dest);
            if (dest !== 'rax') {
              this.output.push(`  mov ${dest}, rax`);
            }
          }
        }
        break;

      case 'ret':
        if (instr.args && instr.args.length === 1) {
          const retVal = instr.args[0];
          if (retVal !== null) {
            if (typeof retVal === 'string' && this.tempToReg.has(retVal)) {
              this.output.push(`  mov rax, ${this.tempToReg.get(retVal)}`);
            } else if (typeof retVal === 'number') {
              this.output.push(`  mov rax, ${retVal}`);
            }
          }
        }
        this.emitFunctionEpilogue();
        break;

      // Add more instructions as needed
    }
  }
}

export function generateX86_64(ir: IRInstruction[]): string {
  const generator = new X86_64CodeGenerator();
  return generator.generate(ir);
}
