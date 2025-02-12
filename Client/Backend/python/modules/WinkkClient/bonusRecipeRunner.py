import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from WinkkClient.BonusRecipeGenerator import BonusRecipeGenerator

def main():
    user_input = input("Enter your ingredients: ")
    user_preffered_cuisine = input("Enter your cuisine: ")
    additional_ingredients_count = input("Enter your ingredient count: ")

    recipe_generator = BonusRecipeGenerator()
    response = recipe_generator.generateResponse(user_input, user_preffered_cuisine, additional_ingredients_count)
    print("Generated Recipe:", response)

if __name__ == "__main__":
    main()