CC = gcc
CFLAGS = -Wall -Iinclude
SRC_DIR = src
OBJ_DIR = obj
BIN_DIR = .

# List of source files
SRCS = $(wildcard $(SRC_DIR)/*.c)
# Generate object filenames
OBJS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(SRCS))

# Output executable
TARGET = $(BIN_DIR)/supermarket.exe

# Resource file
RC_FILE = res/resource.rc
RES_OBJ = $(OBJ_DIR)/resource.o

# Flags for GUI
GUI_FLAGS = -mwindows

all: $(TARGET)

$(TARGET): $(OBJS) $(RES_OBJ)
	$(CC) $(CFLAGS) $(GUI_FLAGS) -o $@ $^ -lgdi32 -luser32 -lkernel32

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

$(RES_OBJ): $(RC_FILE) | $(OBJ_DIR)
	windres $(RC_FILE) -o $(RES_OBJ)

$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

clean:
	rm -rf $(OBJ_DIR) $(TARGET)

.PHONY: all clean
