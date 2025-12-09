# Supermarket Billing System - Project Report

## Project Overview

**Project Name:** Supermarket Billing System  
**Language:** C  
**Platform:** Windows (Console & GUI)  
**Build System:** Makefile + Batch Script  
**Status:** Complete and Functional

---

## Project Description

A console-based supermarket billing system written in C that manages product inventory, shopping cart operations, and automated billing with discount calculations. The system features a user-friendly menu-driven interface with support for logging and receipt generation.

---

## Key Features

- **Product Management**: Manage inventory with product categories (Dairy, Fruit, Bakery, Care, Drinks)
- **Shopping Cart**: Add/remove items with real-time stock validation
- **Automated Billing**: Automatic discount calculation (Buy 2 Get 1 Free promotion)
- **Receipt Generation**: Generates and saves receipts for each transaction
- **Sales Logging**: All transactions logged in `logs.txt`
- **Data Persistence**: Product and transaction data stored in text files

---

## Project Structure

```
sbs/
├── src/                    # Source files
│   ├── main.c             # Entry point and main menu loop
│   ├── gui.c              # GUI implementation (14KB)
│   ├── product.c          # Product management functions
│   ├── cart.c             # Shopping cart operations
│   ├── billing.c          # Billing and discount logic
│   ├── ui.c               # User interface utilities
│   └── utils.c            # Utility functions
├── include/               # Header files
│   ├── common.h           # Common data structures and constants
│   ├── product.h          # Product function declarations
│   ├── cart.h             # Cart function declarations
│   ├── billing.h          # Billing function declarations
│   ├── ui.h               # UI function declarations
│   └── utils.h            # Utility function declarations
├── data/                  # Data files
│   ├── products.txt       # Product inventory (21 products)
│   ├── logs.txt           # Transaction logs
│   └── receipts/          # Generated receipts directory
├── res/                   # Resources
│   ├── resource.rc        # Resource file for GUI
│   └── app_icon.ico       # Application icon
├── obj/                   # Compiled object files (generated)
├── Makefile               # Build configuration for Unix/Linux
├── build.bat              # Build script for Windows
├── README.md              # Project documentation
├── .gitignore             # Git ignore rules
└── PROJECT_REPORT.md      # This report

```

---

## Data Structures

### Product Structure
```c
typedef struct {
    int id;              // Product ID
    char name[50];       // Product name
    char category[30];   // Category (Dairy, Fruit, etc.)
    float price;         // Unit price
    int stock;           // Available stock
} Product;
```

### Cart Item Structure
```c
typedef struct {
    int productId;       // Reference to product
    char name[50];       // Product name
    int qty;             // Quantity in cart
    float price;         // Unit price
    float total;         // Total after discounts
} CartItem;
```

---

## Product Inventory

**Total Products:** 21 items across 5 categories

### Categories & Products

| Category | Products | Count |
|----------|----------|-------|
| **Dairy** | Milk, Cheese, Butter, Yogurt | 4 |
| **Fruit** | Apple, Banana, Orange, Grapes | 4 |
| **Bakery** | Bread, Croissant, Bagel, Cake | 4 |
| **Care** | Shampoo, Soap, Toothpaste, Brush | 4 |
| **Drinks** | Coke, Pepsi, Water, Juice, Tea | 5 |

**Sample Products:**
- Milk: $2.50 (50 units)
- Banana: $0.50 (150 units)
- Bread: $2.00 (40 units)
- Shampoo: $5.50 (20 units)
- Water: $0.50 (200 units)

---

## Build & Compilation

### Build Tools Required
- **GCC** (MinGW on Windows)
- **Windres** (Resource compiler)
- **Make** (for Makefile) or batch script

### Compilation Process

**Option 1: Windows Batch Script**
```cmd
build.bat
```
Compiles:
- `gui.c` → `obj/gui.o`
- `product.c` → `obj/product.o`
- `cart.c` → `obj/cart.o`
- `billing.c` → `obj/billing.o`
- `resource.rc` → `obj/resource.o`

Links to: `supermarket.exe`

**Option 2: Makefile (Unix/Linux)**
```bash
make
```

**Compiler Flags:**
- `-Wall`: Enable all warnings
- `-Iinclude`: Include header directory
- `-mwindows`: GUI mode (no console window)
- Libraries: `-lgdi32 -luser32 -lkernel32 -lshell32 -lcomdlg32`

---

## Main Menu System

The application provides a menu-driven interface with 6 options:

1. **View Products** - Display all available products with stock levels
2. **Add to Cart** - Add items to shopping cart with quantity
3. **Remove from Cart** - Remove items from cart
4. **View Cart** - Display current cart contents
5. **Checkout** - Process payment and generate receipt
6. **Exit** - Close application

---

## Core Functionality

### Product Management (`product.c`)
- Load products from `data/products.txt`
- Display product list with categories
- Stock validation and updates

### Shopping Cart (`cart.c`)
- Add items with quantity validation
- Remove items from cart
- Display cart contents with totals

### Billing System (`billing.c`)
- Calculate subtotals
- Apply promotional discounts (Buy 2 Get 1 Free)
- Calculate taxes
- Generate final bill amount
- Log transactions to `logs.txt`

### User Interface (`ui.c`, `gui.c`)
- Menu display and navigation
- Input validation
- Color-coded output (ANSI colors)
- Receipt formatting

### Utilities (`utils.c`)
- Input/output helpers
- Pause/continue prompts
- String processing

---

## File I/O Operations

### Input Files
- **`data/products.txt`**: Product inventory (ID, Name, Price, Stock, Category)

### Output Files
- **`data/logs.txt`**: Transaction logs (append-only)
- **`data/receipts/`**: Individual receipt files (generated per transaction)

### Format
Products file format: `ID Name Price Stock Category`

---

## Constants & Limits

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_PRODUCTS` | 100 | Maximum products in system |
| `MAX_CART` | 100 | Maximum items in cart |
| `PRODUCT_FILE` | `data/products.txt` | Product data file path |
| `LOG_FILE` | `data/logs.txt` | Transaction log path |

---

## Git Configuration

### Ignored Files/Directories
- `logs.txt` - Transaction logs
- `receipts/` - Generated receipts
- `*.exe` - Compiled executables
- `*.o` - Object files
- `.vscode/` - IDE configuration

---

## Running the Application

### Method 1: Double-Click
1. Double-click `build.bat` to compile
2. Double-click `supermarket.exe` to run

### Method 2: Command Line
```cmd
.\build.bat
.\supermarket.exe
```

---

## Technical Specifications

| Aspect | Details |
|--------|---------|
| **Language** | C (ANSI C compatible) |
| **Platform** | Windows (MinGW/GCC) |
| **GUI Framework** | Windows API (GDI32) |
| **Data Storage** | Plain text files |
| **Compilation** | Static linking |
| **Executable Size** | ~500KB (with resources) |

---

## Code Statistics

| File | Size | Purpose |
|------|------|---------|
| `gui.c` | 14.1 KB | GUI implementation |
| `billing.c` | 4.6 KB | Billing logic |
| `ui.c` | 2.6 KB | UI utilities |
| `cart.c` | 1.9 KB | Cart operations |
| `product.c` | 1.2 KB | Product management |
| `utils.c` | 611 B | Utility functions |
| `main.c` | 1.2 KB | Entry point |

**Total Source Code:** ~26 KB

---

## Features Highlights

✅ **Inventory Management** - Track 21 products across 5 categories  
✅ **Dynamic Pricing** - Flexible product pricing system  
✅ **Promotional Discounts** - Buy 2 Get 1 Free offer  
✅ **Stock Validation** - Prevents overselling  
✅ **Receipt Generation** - Automatic receipt creation  
✅ **Transaction Logging** - Complete audit trail  
✅ **User-Friendly UI** - Menu-driven interface  
✅ **Error Handling** - Input validation and error messages  

---

## Potential Enhancements

- Database integration (SQLite/MySQL)
- Advanced discount rules
- Customer loyalty program
- Barcode scanning support
- Multi-user authentication
- Real-time inventory sync
- Sales analytics dashboard
- Mobile app integration

---

## Conclusion

The Supermarket Billing System is a well-structured C application that demonstrates core programming concepts including data structures, file I/O, and user interface design. The modular architecture allows for easy maintenance and future enhancements.

**Project Status:** ✅ Complete and Ready for Use

---

*Report Generated: December 9, 2025*
