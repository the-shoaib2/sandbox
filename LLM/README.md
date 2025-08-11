# LLM Runner

A simple Python application for running local language models with an easy-to-use interface. This tool allows you to load and run language models from the `models` directory and generate text based on prompts.

## Features

- Load local language models from the `models` directory
- Generate text with customizable parameters
- Simple command-line interface
- Can be built into a standalone executable

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git (for version control)

## Installation

1. Clone this repository:
   ```bash
   git clone <your-repository-url>
   cd LLM
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Running the script directly

```bash
python llm_runner.py --prompt "Your prompt here"
```

### Command-line Arguments

- `--model`: Path to the model directory (default: ./models)
- `--prompt`: Input prompt for text generation (required)
- `--max_length`: Maximum length of generated text (default: 200)
- `--temperature`: Sampling temperature (0.0 to 1.0, default: 0.7)

Example:
```bash
python llm_runner.py --prompt "Once upon a time" --max_length 100 --temperature 0.8
```

### Building an Executable

To create a standalone executable:

1. Run the build script:
   ```bash
   .\build.bat  # On Windows
   # or
   bash build.sh  # On Linux/macOS
   ```

2. The executable will be created in the `dist` folder.

3. Run the executable:
   ```bash
   .\dist\llm_runner.exe --prompt "Your prompt here"
   ```

## Adding Models

1. Place your model files in the `models` directory.
2. The directory should contain all necessary model files (pytorch_model.bin, config.json, tokenizer files, etc.).
3. The model will be automatically loaded from the `models` directory when you run the script.

## Notes

- The `models` directory is ignored by Git to prevent large files from being committed to version control.
- Make sure you have enough disk space for the models you plan to use.
- The first time you run the script, it may take some time to download the tokenizer and model files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
