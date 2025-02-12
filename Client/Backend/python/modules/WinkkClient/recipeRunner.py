import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from WinkkClient.RecipeGenerator import RecipeGenerator
from helpers.JsonFormatter import JsonFormatter
import json

def main():
    user_input = input("Enter your recipe request: ")
    generator = RecipeGenerator()
    response = generator.generateResponse(user_input, "all", 1)
    response = JsonFormatter(response).remove_backticks()
    print("Generated Recipe:", response)

if __name__ == "__main__":
    main()