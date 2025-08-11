import os
import sys
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from pathlib import Path

class LLMRunner:
    def __init__(self, model_path=None):
        """
        Initialize the LLM Runner
        
        Args:
            model_path (str, optional): Path to the model directory. 
                                      Defaults to './models' if None.
        """
        self.model_path = Path(model_path) if model_path else Path(__file__).parent / 'models'
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = None
        self.tokenizer = None
    
    def load_model(self):
        """Load the model and tokenizer from the specified path"""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model directory not found at {self.model_path}")
            
        print(f"Loading model from {self.model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_path,
            torch_dtype=torch.float16 if self.device == 'cuda' else torch.float32,
            device_map='auto' if self.device == 'cuda' else None
        )
        if self.device == 'cuda':
            self.model = self.model.to(self.device)
        print("Model loaded successfully!")
    
    def generate_text(self, prompt, max_length=200, temperature=0.7):
        """
        Generate text based on the given prompt
        
        Args:
            prompt (str): Input text prompt
            max_length (int): Maximum length of generated text
            temperature (float): Controls randomness (0.0 to 1.0)
            
        Returns:
            str: Generated text
        """
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model and tokenizer must be loaded first")
            
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return generated_text

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='LLM Runner - Run local language models')
    parser.add_argument('--model', type=str, default=None,
                      help='Path to the model directory (default: ./models)')
    parser.add_argument('--prompt', type=str, required=True,
                      help='Input prompt for text generation')
    parser.add_argument('--max_length', type=int, default=200,
                      help='Maximum length of generated text')
    parser.add_argument('--temperature', type=float, default=0.7,
                      help='Sampling temperature (0.0 to 1.0)')
    
    args = parser.parse_args()
    
    try:
        runner = LLMRunner(args.model)
        runner.load_model()
        
        print("\nGenerating response...")
        print("-" * 50)
        response = runner.generate_text(
            args.prompt,
            max_length=args.max_length,
            temperature=args.temperature
        )
        print(response)
        print("-" * 50)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
