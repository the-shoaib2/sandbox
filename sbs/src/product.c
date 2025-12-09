#include <stdio.h>
#include <stdlib.h>
#include "product.h"

Product products[MAX_PRODUCTS];
int productCount = 0;

void loadProducts() {
    FILE *f = fopen(PRODUCT_FILE, "r");
    if (!f) {
        // Create file if it doesn't exist for robustness
        f = fopen(PRODUCT_FILE, "w");
        if (f) fclose(f);
        return;
    }
    productCount = 0;
    while(fscanf(f, "%d %s %f %d %s", &products[productCount].id, products[productCount].name, &products[productCount].price, &products[productCount].stock, products[productCount].category) != EOF) {
        productCount++;
    }
    fclose(f);
}

void saveProducts() {
    FILE *f = fopen(PRODUCT_FILE, "w");
    if (!f) return;
    for (int i = 0; i < productCount; i++) {
        fprintf(f, "%d %s %.2f %d %s\n", products[i].id, products[i].name, products[i].price, products[i].stock, products[i].category);
    }
    fclose(f);
}

int findProduct(int id) {
    for (int i = 0; i < productCount; i++) {
        if (products[i].id == id) return i;
    }
    return -1;
}

Product* getProductByIndex(int index) {
    if (index >= 0 && index < productCount) {
        return &products[index];
    }
    return NULL;
}
