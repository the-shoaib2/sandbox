export type Language = 'cpp' | 'c' | 'java' | 'python';

export interface CompilationStep {
  name: string;
  output: string;
  success: boolean;
  duration: number;
  error?: string;
}

export interface CompileOptions {
  sourceCode: string;
  language: Language;
  fileName?: string;
  optimize?: boolean;
  debug?: boolean;
}

export interface CompileResult {
  success: boolean;
  output?: string;
  error?: string;
  steps: CompilationStep[];
  binaryPath?: string;
}

export const SUPPORTED_LANGUAGES: { value: Language; label: string; extension: string }[] = [
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'c', label: 'C', extension: 'c' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'python', label: 'Python', extension: 'py' },
];

export const DEFAULT_CODE_SNIPPETS: Record<Language, string> = {
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
  python: `print("Hello, Python!")`
};
