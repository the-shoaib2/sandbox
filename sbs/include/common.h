#ifndef COMMON_H
#define COMMON_H

#define MAX_PRODUCTS 100
#define MAX_CART 100
#define PRODUCT_FILE "data/products.txt"
#define LOG_FILE "data/logs.txt"

typedef struct {
    int id;
    char name[50];
    char category[30];
    float price;
    int stock;
} Product;

typedef struct {
    int productId;
    char name[50];
    int qty;
    float price; // Unit price
    float total; // Total after Buy 2 Get 1
} CartItem;

#endif
