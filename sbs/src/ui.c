#include <stdio.h>
#include <stdlib.h>
#include "ui.h"
#include "product.h"
#include "cart.h"
#include "billing.h"
#include "utils.h"

void printHeader() {
    clearScreen();
    printf(ANSI_COLOR_BLUE);
    printf("╔══════════════════════════════════════╗\n");
    printf("║      SUPERMARKET BILLING SYSTEM      ║\n");
    printf("╚══════════════════════════════════════╝\n");
    printf(ANSI_COLOR_RESET);
}

void showMenu() {
    printHeader();
    printf("1. Show Products\n");
    printf("2. Add to Cart\n");
    printf("3. Remove from Cart\n");
    printf("4. View Cart\n");
    printf("5. Checkout\n");
    printf("6. Exit\n");
    printf("\nEnter choice: ");
}

void showProductsUI() {
    printHeader();
    printf(ANSI_COLOR_CYAN "\n%-5s %-20s %-10s %-10s\n", "ID", "Name", "Price", "Stock");
    printf("--------------------------------------------------\n" ANSI_COLOR_RESET);
    for (int i = 0; i < productCount; i++) {
        Product* p = getProductByIndex(i);
        if (p) {
            printf("%-5d %-20s %-10.2f %-10d\n", p->id, p->name, p->price, p->stock);
        }
    }
    printf("\n");
}

void viewCartUI() {
    printHeader();
    printf(ANSI_COLOR_MAGENTA "\n--- Your Cart ---\n" ANSI_COLOR_RESET);
    if (cartCount == 0) {
        printf("Cart is empty.\n");
    } else {
        printf(ANSI_COLOR_CYAN "%-20s %-5s %-10s\n", "Name", "Qty", "Total");
        printf("------------------------------------\n" ANSI_COLOR_RESET);
        for (int i = 0; i < cartCount; i++) {
            printf("%-20s x%-4d %.2f\n", cart[i].name, cart[i].qty, cart[i].total);
        }
    }
    printf("\n");
}

void addToCartUI() {
    int id, qty;
    showProductsUI(); // Show products so user knows IDs
    
    printf("Enter Product ID: ");
    if (scanf("%d", &id) != 1) {
        while(getchar() != '\n');
        return;
    }
    
    printf("Enter Qty: ");
    if (scanf("%d", &qty) != 1) {
        while(getchar() != '\n');
        return;
    }
    
    addToCart(id, qty);
}

void removeFromCartUI() {
    int id;
    viewCartUI();
    
    printf("Enter Product ID to remove: ");
    scanf("%d", &id);
    
    if (removeFromCart(id)) {
        printf(ANSI_COLOR_GREEN "Item removed." ANSI_COLOR_RESET "\n");
    } else {
        printf(ANSI_COLOR_RED "Item not in cart." ANSI_COLOR_RESET "\n");
    }
}
