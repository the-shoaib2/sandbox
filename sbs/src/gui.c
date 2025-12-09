#include <windows.h>
#include <commctrl.h>
#include <commdlg.h>
#include <stdio.h>
#include <ctype.h>
#include "product.h"
#include "cart.h"
#include "billing.h"

// Defines
#define ID_LIST_PRODUCTS 101
#define ID_LIST_CART 102
#define ID_BTN_ADD 103
#define ID_BTN_REMOVE 104
#define ID_BTN_CHECKOUT 105
#define ID_EDIT_QTY 106
#define ID_EDIT_NAME 109
#define ID_EDIT_PHONE 110
#define ID_EDIT_SEARCH 111
#define ID_COMBO_CATEGORY 112
#define ID_EDIT_SCAN 113

// Global Handles
HWND hListProducts, hListCart, hBtnAdd, hBtnRemove, hBtnCheckout, hEditQty;
HWND hEditName, hEditPhone, hEditSearch, hComboCategory, hEditScan;
HFONT hFont;

// --- Helper Functions ---

// Rounded Button Helper
void MakeRounding(HWND hwnd) {
    RECT r;
    GetWindowRect(hwnd, &r);
    HRGN rgn = CreateRoundRectRgn(0, 0, r.right - r.left, r.bottom - r.top, 10, 10);
    SetWindowRgn(hwnd, rgn, TRUE);
}

void SetFontCallback(HWND hChild, LPARAM lParam) {
    SendMessage(hChild, WM_SETFONT, (WPARAM)lParam, TRUE);
}

void UpdateProductList(const char* search, const char* category);
void UpdateCartList();
void PopulateCategories();
void DialogCheckout(HWND parent, float sub, float disc, float net, char* receiptPath);

// Scan Box Proc
WNDPROC oldEditProc;
LRESULT CALLBACK ScanEditProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    if (msg == WM_KEYDOWN && wParam == VK_RETURN) {
        char buf[100];
        GetWindowText(hwnd, buf, 100);
        int id = atoi(buf);
        if (id > 0) {
            int res = addToCart(id, 1);
            if (res == 1) {
                UpdateCartList();
                SetWindowText(hwnd, "");
            } else {
                MessageBeep(MB_ICONWARNING);
            }
        }
        return 0;
    }
    return CallWindowProc(oldEditProc, hwnd, msg, wParam, lParam);
}

const char* stristr(const char* haystack, const char* needle) {
    if (!*needle) return haystack;
    for (; *haystack; ++haystack) {
        if (tolower(*haystack) == tolower(*needle)) {
            const char *h, *n;
            for (h = haystack, n = needle; *h && *n; ++h, ++n) {
                if (tolower(*h) != tolower(*n)) break;
            }
            if (!*n) return haystack;
        }
    }
    return NULL;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch(msg) {
        case WM_CREATE:
            {
                hFont = CreateFont(19, 0, 0, 0, FW_REGULAR, FALSE, FALSE, FALSE, ANSI_CHARSET, 
                    OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, 
                    DEFAULT_PITCH | FF_SWISS, "Segoe UI");

                CreateWindow("STATIC", "Customer Name:", WS_VISIBLE | WS_CHILD, 20, 15, 100, 20, hwnd, NULL, NULL, NULL);
                hEditName = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_AUTOHSCROLL, 120, 12, 200, 24, hwnd, (HMENU)ID_EDIT_NAME, NULL, NULL);
                
                CreateWindow("STATIC", "Phone:", WS_VISIBLE | WS_CHILD, 340, 15, 50, 20, hwnd, NULL, NULL, NULL);
                hEditPhone = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_AUTOHSCROLL, 400, 12, 150, 24, hwnd, (HMENU)ID_EDIT_PHONE, NULL, NULL);

                 CreateWindow("STATIC", "SCAN BARCODE:", WS_VISIBLE | WS_CHILD, 600, 15, 100, 20, hwnd, NULL, NULL, NULL);
                hEditScan = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_NUMBER | ES_CENTER, 
                    600, 35, 120, 26, hwnd, (HMENU)ID_EDIT_SCAN, NULL, NULL);
                
                #ifndef GWLP_WNDPROC
                #define GWLP_WNDPROC -4
                #endif
                oldEditProc = (WNDPROC)SetWindowLongPtr(hEditScan, GWLP_WNDPROC, (LONG_PTR)ScanEditProc);

                 CreateWindow("STATIC", "Filter:", WS_VISIBLE | WS_CHILD, 20, 60, 50, 20, hwnd, NULL, NULL, NULL);
                 hComboCategory = CreateWindow("COMBOBOX", "", WS_VISIBLE | WS_CHILD | CBS_DROPDOWNLIST | WS_VSCROLL, 
                    70, 58, 120, 200, hwnd, (HMENU)ID_COMBO_CATEGORY, NULL, NULL);

                 CreateWindow("STATIC", "Search:", WS_VISIBLE | WS_CHILD, 210, 60, 50, 20, hwnd, NULL, NULL, NULL);
                hEditSearch = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_AUTOHSCROLL, 260, 58, 200, 24, hwnd, (HMENU)ID_EDIT_SEARCH, NULL, NULL);

                // --- Lists ---
                CreateWindow("STATIC", "Available Products", WS_VISIBLE | WS_CHILD, 20, 90, 200, 20, hwnd, NULL, NULL, NULL);
                // LVS_EX_GRIDLINES requires sending message LVM_SETEXTENDEDLISTVIEWSTYLE
                hListProducts = CreateWindow("LISTBOX", NULL, WS_VISIBLE | WS_CHILD | WS_BORDER | WS_VSCROLL | LBS_NOTIFY | LBS_HASSTRINGS,
                    20, 110, 480, 250, hwnd, (HMENU)ID_LIST_PRODUCTS, NULL, NULL);

                CreateWindow("STATIC", "Shopping Cart", WS_VISIBLE | WS_CHILD, 520, 90, 100, 20, hwnd, NULL, NULL, NULL);
                hListCart = CreateWindow("LISTBOX", NULL, WS_VISIBLE | WS_CHILD | WS_BORDER | WS_VSCROLL | LBS_NOTIFY,
                    520, 110, 240, 250, hwnd, (HMENU)ID_LIST_CART, NULL, NULL);

                // --- Action Controls ---
                CreateWindow("STATIC", "Qty:", WS_VISIBLE | WS_CHILD, 20, 380, 40, 20, hwnd, NULL, NULL, NULL);
                hEditQty = CreateWindow("EDIT", "1", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_NUMBER | ES_CENTER, 
                    60, 378, 50, 26, hwnd, (HMENU)ID_EDIT_QTY, NULL, NULL);

                hBtnAdd = CreateWindow("BUTTON", "ADD ITEM", WS_VISIBLE | WS_CHILD, 
                    130, 375, 120, 32, hwnd, (HMENU)ID_BTN_ADD, NULL, NULL);

                hBtnRemove = CreateWindow("BUTTON", "REMOVE", WS_VISIBLE | WS_CHILD, 
                    520, 375, 100, 32, hwnd, (HMENU)ID_BTN_REMOVE, NULL, NULL);

                hBtnCheckout = CreateWindow("BUTTON", "PAY & PRINT", WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON, 
                    630, 375, 130, 32, hwnd, (HMENU)ID_BTN_CHECKOUT, NULL, NULL);
                
                EnumChildWindows(hwnd, (WNDENUMPROC)SetFontCallback, (LPARAM)hFont);

                MakeRounding(hBtnAdd);
                MakeRounding(hBtnRemove);
                MakeRounding(hBtnCheckout);

                loadProducts();
                PopulateCategories();
                UpdateProductList("", "All");
                SetFocus(hEditScan);
            }
            break;

       // Apply Rounding after window creation/resizing when size is known?
       // Doing it in specific message or assuming fixed size logic.
       // Buttons are creating with fixed size, so we can round them.

        case WM_COMMAND:
            if (LOWORD(wParam) == ID_COMBO_CATEGORY && HIWORD(wParam) == CBN_SELCHANGE) {
                int idx = SendMessage(hComboCategory, CB_GETCURSEL, 0, 0);
                char cat[50];
                SendMessage(hComboCategory, CB_GETLBTEXT, idx, (LPARAM)cat);
                char search[100];
                GetWindowText(hEditSearch, search, 100);
                UpdateProductList(search, cat);
            }
            else if (HIWORD(wParam) == EN_CHANGE && LOWORD(wParam) == ID_EDIT_SEARCH) {
                char buf[100];
                GetWindowText(hEditSearch, buf, 100);
                int idx = SendMessage(hComboCategory, CB_GETCURSEL, 0, 0);
                char cat[50];
                if (idx != CB_ERR) SendMessage(hComboCategory, CB_GETLBTEXT, idx, (LPARAM)cat);
                else strcpy(cat, "All");
                UpdateProductList(buf, cat);
            }
            else if (LOWORD(wParam) == ID_BTN_ADD) {
                int selIdx = SendMessage(hListProducts, LB_GETCURSEL, 0, 0);
                if (selIdx != LB_ERR) {
                    char itemText[256];
                    SendMessage(hListProducts, LB_GETTEXT, selIdx, (LPARAM)itemText);
                    int pInfoId = atoi(itemText);
                    char buf[10];
                    GetWindowText(hEditQty, buf, 10);
                    if (addToCart(pInfoId, atoi(buf)) == 1) UpdateCartList();
                }
            }
            else if (LOWORD(wParam) == ID_BTN_REMOVE) {
                int selIdx = SendMessage(hListCart, LB_GETCURSEL, 0, 0);
                if (selIdx != LB_ERR) {
                   removeFromCart(cart[selIdx].productId);
                   UpdateCartList();
                }
            }
            else if (LOWORD(wParam) == ID_BTN_CHECKOUT) {
                char name[100], phone[20];
                GetWindowText(hEditName, name, 100);
                GetWindowText(hEditPhone, phone, 20);
                if (strlen(name) == 0) {
                    MessageBox(hwnd, "Please enter Customer Name.", "Missing Info", MB_ICONWARNING);
                    break;
                }
                CheckoutResult res;
                if (performCheckout(&res, name, phone)) {
                    DialogCheckout(hwnd, res.subtotal, res.discount, res.netTotal, res.receiptPath);
                    UpdateCartList();
                    UpdateProductList("", "All");
                } else {
                    MessageBox(hwnd, "Cart is empty!", "Warning", MB_ICONWARNING);
                }
            }
            break;

        case WM_DESTROY:
            DeleteObject(hFont);
            PostQuitMessage(0);
            break;
    }
    return DefWindowProc(hwnd, msg, wParam, lParam);
}

void DialogCheckout(HWND parent, float sub, float disc, float net, char* receiptPath) {
    char msg[1024];
    sprintf(msg, "Checkout Successful!\n\n"
                 "Customer: %s\n"
                 "--------------------------\n"
                 "Subtotal: Tk. %.2f\n"
                 "Discount: Tk. %.2f\n"
                 "--------------------------\n"
                 "NET TOTAL: Tk. %.2f\n\n"
                 "Choose Action:", 
                 "Customer", sub, disc, net); // Need to pass customer name if we want, simplified for now
    
    int result = MessageBox(parent, msg, "Bill Generated", MB_YESNOCANCEL | MB_ICONINFORMATION);
    // YES = Print (Open), NO = Save As, CANCEL = Close
    // We can't customize strings easily with MessageBox. 
    // Implementing custom dialog is better but complex in one file.
    // Let's use logic: MessageBox is simple "OK". We ask user "Open Receipt?"
    
    if (MessageBox(parent, "Do you want to OPEN the receipt for Printing?", "Print Receipt", MB_YESNO | MB_ICONQUESTION) == IDYES) {
        ShellExecute(NULL, "open", receiptPath, NULL, NULL, SW_SHOW);
    }
    
    if (MessageBox(parent, "Do you want to SAVE a copy?", "Save Receipt", MB_YESNO | MB_ICONQUESTION) == IDYES) {
        OPENFILENAME ofn;
        char szFile[260];
        strcpy(szFile, "receipt_copy.html");
        
        ZeroMemory(&ofn, sizeof(ofn));
        ofn.lStructSize = sizeof(ofn);
        ofn.hwndOwner = parent;
        ofn.lpstrFile = szFile;
        ofn.nMaxFile = sizeof(szFile);
        ofn.lpstrFilter = "HTML Files\0*.html\0All Files\0*.*\0";
        ofn.nFilterIndex = 1;
        ofn.lpstrFileTitle = NULL;
        ofn.nMaxFileTitle = 0;
        ofn.lpstrInitialDir = NULL;
        ofn.Flags = OFN_PATHMUSTEXIST | OFN_OVERWRITEPROMPT;

        if (GetSaveFileName(&ofn) == TRUE) {
            CopyFile(receiptPath, ofn.lpstrFile, FALSE);
            MessageBox(parent, "File Saved Successfully!", "Saved", MB_ICONINFORMATION);
        }
    }
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WNDCLASS wc = {0};
    wc.lpszClassName = "SupermarketApp";
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW);
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(1));

    RegisterClass(&wc);

    int width = 800; int height = 480;
    int x = (GetSystemMetrics(SM_CXSCREEN) - width) / 2;
    int y = (GetSystemMetrics(SM_CYSCREEN) - height) / 2;

    CreateWindow("SupermarketApp", "POS System v3.1 (Taka)", WS_VISIBLE | WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX & ~WS_THICKFRAME,
        x, y, width, height, NULL, NULL, hInstance, NULL);

    MSG msg;
    while(GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

void PopulateCategories() {
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"All");
    SendMessage(hComboCategory, CB_SETCURSEL, 0, 0);
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"Dairy");
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"Fruit");
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"Bakery");
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"Care");
    SendMessage(hComboCategory, CB_ADDSTRING, 0, (LPARAM)"Drinks");
}

void UpdateProductList(const char* search, const char* category) {
    SendMessage(hListProducts, LB_RESETCONTENT, 0, 0);
    char buf[200];
    for (int i = 0; i < productCount; i++) {
        Product* p = getProductByIndex(i);
        if (category && strcmp(category, "All") != 0 && strcmp(category, "") != 0) {
            if (strcmp(p->category, category) != 0) continue;
        }
        if (search && strlen(search) > 0) {
            if (!stristr(p->name, search) && (strtol(search, NULL, 10) != p->id)) {
                continue;
            }
        }
        sprintf(buf, "%d | %s | Tk. %.2f | %s | Stock: %d", p->id, p->name, p->price, p->category, p->stock);
        SendMessage(hListProducts, LB_ADDSTRING, 0, (LPARAM)buf);
    }
}

void UpdateCartList() {
    SendMessage(hListCart, LB_RESETCONTENT, 0, 0);
    char buf[100];
    for (int i = 0; i < cartCount; i++) {
        sprintf(buf, "%s | x%d | Tk. %.2f", cart[i].name, cart[i].qty, cart[i].total);
        SendMessage(hListCart, LB_ADDSTRING, 0, (LPARAM)buf);
    }
}
