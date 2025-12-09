#include <stdio.h>
#include <time.h>
#include <string.h>
#include <stdlib.h>
#include "billing.h"
#include "cart.h"
#include "product.h"
#include "common.h"

// Internal helper
void generateReceiptHTML(float subtotal, float discount, float netTotal, char* outFilename, const char* name, const char* phone);
void saveLogInternal(float total);

int performCheckout(CheckoutResult* result, const char* name, const char* phone) {
    if (cartCount == 0) return 0; // Empty cart

    float subtotal = 0;
    for (int i = 0; i < cartCount; i++) subtotal += cart[i].total;

    float discount = 0;
    if (subtotal >= 2000) discount = subtotal * 0.20;
    else if (subtotal >= 1000) discount = subtotal * 0.10;

    float netTotal = subtotal - discount;

    result->subtotal = subtotal;
    result->discount = discount;
    result->netTotal = netTotal;
    strcpy(result->customerName, name);
    strcpy(result->customerPhone, phone);

    generateReceiptHTML(subtotal, discount, netTotal, result->receiptPath, name, phone);
    saveProducts(); // Save new stock levels
    saveLogInternal(netTotal);
    
    clearCart();
    return 1;
}

void generateReceiptHTML(float subtotal, float discount, float netTotal, char* outFilename, const char* name, const char* phone) {
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);
    sprintf(outFilename, "data/receipts/receipt_%ld.html", (long)t);
    
    FILE *f = fopen(outFilename, "w");
    if (!f) return;

    fprintf(f, "<html><head><style>");
    fprintf(f, "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fdfdfd; padding: 40px; }");
    fprintf(f, ".receipt { max-width: 400px; margin: auto; background: white; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 8px; border-top: 5px solid #0078d4; }");
    fprintf(f, "h2 { text-align: center; color: #333; margin-bottom: 5px; }");
    fprintf(f, ".info { font-size: 14px; color: #666; margin-bottom: 20px; text-align: center; }");
    fprintf(f, "table { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }");
    fprintf(f, "th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; color: #555; font-size: 12px; text-transform: uppercase; }");
    fprintf(f, "td { padding: 8px; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333; }");
    fprintf(f, ".total-section { text-align: right; margin-top: 10px; border-top: 2px solid #eee; padding-top: 10px; }");
    fprintf(f, ".total-row { font-size: 14px; color: #666; margin: 5px 0; }");
    fprintf(f, ".final-total { font-size: 20px; font-weight: bold; color: #0078d4; margin-top: 10px; }");
    fprintf(f, ".footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }");
    fprintf(f, ".btn { display: block; width: 100%%; text-align: center; background: #eee; padding: 10px; text-decoration: none; color: #333; border-radius: 4px; margin-top: 20px; }");
    fprintf(f, "@media print { .btn { display: none; } body { background: white; padding: 0; } .receipt { box-shadow: none; border: none; } }");
    fprintf(f, "</style></head><body>");
    
    fprintf(f, "<div class='receipt'>");
    fprintf(f, "<h2>Supermarket Receipt</h2>");
    fprintf(f, "<div class='info'>Date: %d-%02d-%02d %02d:%02d:%02d<br>Customer: <b>%s</b><br>Phone: %s</div>", 
        tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec, name, phone);

    fprintf(f, "<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>");
    for (int i = 0; i < cartCount; i++) {
        fprintf(f, "<tr><td>%s</td><td>%d</td><td>Tk. %.2f</td><td>Tk. %.2f</td></tr>", cart[i].name, cart[i].qty, cart[i].price, cart[i].total);
    }
    fprintf(f, "</tbody></table>");

    fprintf(f, "<div class='total-section'>");
    fprintf(f, "<div class='total-row'>Subtotal: Tk. %.2f</div>", subtotal);
    fprintf(f, "<div class='total-row'>Discount: -Tk. %.2f</div>", discount);
    fprintf(f, "<div class='final-total'>Total: Tk. %.2f</div>", netTotal);
    fprintf(f, "</div>");

    fprintf(f, "<div class='footer'>Thank you for shopping with us!<br>Authorized via SupermarketBillingSystem</div>");
    fprintf(f, "<a href='#' class='btn' onclick='window.print()'>Print Receipt</a>");
    fprintf(f, "</div></body></html>");
    
    fclose(f);
}

void saveLogInternal(float total) {
    FILE *f = fopen(LOG_FILE, "a");
    if (!f) return;
    time_t t = time(NULL);
    fprintf(f, "%ld: Sale of %.2f\n", (long)t, total);
    fclose(f);
}
