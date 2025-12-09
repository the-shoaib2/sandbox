@echo off
if not exist obj mkdir obj
echo Compiling Resources...
windres res/resource.rc -o obj/resource.o

echo Compiling Source...
gcc -Iinclude -c src/gui.c -o obj/gui.o
gcc -Iinclude -c src/product.c -o obj/product.o
gcc -Iinclude -c src/cart.c -o obj/cart.o
gcc -Iinclude -c src/billing.c -o obj/billing.o
echo Linking...
gcc obj/gui.o obj/product.o obj/cart.o obj/billing.o obj/resource.o -o supermarket.exe -mwindows -lgdi32 -luser32 -lkernel32 -lshell32 -lcomdlg32

echo Build Complete! Run supermarket.exe to start.
pause
