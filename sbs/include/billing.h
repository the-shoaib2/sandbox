#ifndef BILLING_H
#define BILLING_H

typedef struct {
    float subtotal;
    float discount;
    float netTotal;
    char receiptPath[256];
    char customerName[100];
    char customerPhone[20];
} CheckoutResult;

// Returns 1 if successful, 0 if cart empty
int performCheckout(CheckoutResult* result, const char* name, const char* phone);

#endif
