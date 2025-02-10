import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from WinkkClient.IngredientAnalyser import IngredientAnalyser


def main():
    analyser = IngredientAnalyser()
    user_input = input("Enter the data: ")
    response = analyser.generateResponse(user_input)
    print("Response from Ingredient Analyser:", response)

if __name__ == "__main__":
    main()