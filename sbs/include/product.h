#ifndef PRODUCT_H
#define PRODUCT_H

#include "common.h"

extern Product products[MAX_PRODUCTS];
extern int productCount;

void loadProducts();
void saveProducts();
int findProduct(int id);
Product* getProductByIndex(int index);

#endif
