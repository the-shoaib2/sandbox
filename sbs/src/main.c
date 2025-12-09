#include <stdio.h>
#include <stdlib.h>
#include "product.h"
#include "ui.h"
#include "billing.h"
#include "utils.h"

int main() {
    loadProducts();
    int choice;
    do {
        showMenu();
        if (scanf("%d", &choice) != 1) {
            while(getchar() != '\n'); // clear buffer
            choice = 0;
        }

        printf("\n"); // Spacing

        switch(choice) {
            case 1: 
                showProductsUI(); 
                pauseInput();
                break;
            case 2: 
                addToCartUI(); 
                pauseInput();
                break;
            case 3: 
                removeFromCartUI(); 
                pauseInput();
                break;
            case 4: 
                viewCartUI(); 
                pauseInput();
                break;
            case 5: 
                checkout(); 
                pauseInput();
                break;
            case 6: 
                printf("Exiting...\n"); 
                break;
            default: 
                printf(ANSI_COLOR_RED "Invalid choice!" ANSI_COLOR_RESET "\n");
                pauseInput();
        }
    } while(choice != 6); 

    return 0;
}
