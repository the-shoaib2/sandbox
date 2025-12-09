#include <stdio.h>
#include <stdlib.h>
#include "utils.h"

void clearScreen() {
    #ifdef _WIN32
        system("cls");
    #else
        system("clear");
    #endif
}

void pauseInput() {
    printf("\nPress Enter to continue...");
    while(getchar() != '\n');
    getchar(); // Wait for actual input if buffer was empty, might need tuning based on call site
}

void printLine(char ch, int length, const char* color) {
    if (color) printf("%s", color);
    for (int i = 0; i < length; i++) {
        putchar(ch);
    }
    if (color) printf(ANSI_COLOR_RESET);
    printf("\n");
}
