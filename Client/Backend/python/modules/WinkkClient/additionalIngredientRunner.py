import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from AdditionalIngredientGenerator import AdditionalIngredientGenerator

def main():
    generator = AdditionalIngredientGenerator()
    user_input = input("Enter the data: ")
    user_additional_ingredient = 2
    response = generator.generateResponse(user_input, user_additional_ingredient)
    print("Generated Response:", response)

if __name__ == "__main__":
    main()