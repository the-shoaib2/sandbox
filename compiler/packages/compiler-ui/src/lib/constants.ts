import { Language } from '../app/components/ui/language-selector';

export const DEFAULT_CODE_SNIPPETS: Record<Language, string> = {
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, C!\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
  python: `print("Hello, Python!")`,
  custom: `// Custom Language Example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

let result = fibonacci(10);
console.log("Fibonacci(10) =", result);`,
};
