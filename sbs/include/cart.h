#ifndef CART_H
#define CART_H

#include "common.h"

extern CartItem cart[MAX_CART];
extern int cartCount;

// Returns 1 on success, 0 on failure, -1 if product not found, -2 if no stock, -3 if invalid qty
int addToCart(int productId, int qty);

// Returns 1 on success, 0 if not in cart
int removeFromCart(int productId);

void clearCart();

#endif
