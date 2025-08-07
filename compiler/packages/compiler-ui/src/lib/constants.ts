import { LanguageType } from '../app/components/LanguageSelector';

export const DEFAULT_CODE_SNIPPETS: Record<LanguageType, string> = {
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
};
