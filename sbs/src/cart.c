#include <string.h>
#include "cart.h"
#include "product.h"

CartItem cart[MAX_CART];
int cartCount = 0;

int addToCart(int productId, int qty) {
    if (qty <= 0) return -3; // Invalid quantity

    int idx = findProduct(productId);
    if (idx == -1) return -1; // Product not found

    if (products[idx].stock < qty) return -2; // Not enough stock

    // Checking if already in cart
    int cartIdx = -1;
    for(int i=0; i<cartCount; i++) {
        if(cart[i].productId == productId) {
             cartIdx = i;
             break;
        }
    }

    products[idx].stock -= qty;

    if (cartIdx != -1) {
        cart[cartIdx].qty += qty;
        int freeItems = cart[cartIdx].qty / 3;
        int payable = cart[cartIdx].qty - freeItems;
        cart[cartIdx].total = payable * products[idx].price;
    } else {
        cart[cartCount].productId = productId;
        strcpy(cart[cartCount].name, products[idx].name);
        cart[cartCount].qty = qty;
        cart[cartCount].price = products[idx].price;
        
        int freeItems = qty / 3;
        int payable = qty - freeItems;
        cart[cartCount].total = payable * products[idx].price;
        cartCount++;
    }
    return 1; // Success
}

int removeFromCart(int productId) {
    int cartIdx = -1;
    for (int i = 0; i < cartCount; i++) {
        if (cart[i].productId == productId) {
            cartIdx = i;
            break;
        }
    }

    if (cartIdx == -1) return 0; // Not found

    // Restore stock
    int pIdx = findProduct(productId);
    if (pIdx != -1) {
        products[pIdx].stock += cart[cartIdx].qty;
    }

    // Remove from array
    for (int i = cartIdx; i < cartCount - 1; i++) {
        cart[i] = cart[i+1];
    }
    cartCount--;
    return 1; // Success
}

void clearCart() {
    cartCount = 0;
}
