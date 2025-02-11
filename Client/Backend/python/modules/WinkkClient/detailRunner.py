import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from WinkkClient.DetailGenerator import DetailGenerator
from helpers.JsonFormatter import JsonFormatter

def main():
    user_input = input("Enter your detailed recipe request: ")
    user_input = """ {
            "name": "Würziges Rindfleisch mit Ananas",
            "ingredients": ["Rindfleisch", "Ananas", "Chilipulver", "Sojasauce"],
            "howToCook": "Rindfleisch in Streifen schneiden und in einer Pfanne anbraten. Ananaswürfel hinzufügen und mit Sojasauce und Chilipulver würzen. Kurz köcheln lassen und heiß servieren.",
            "allergies": ["Soja"],
            "healthy": true,
            "hotOrCold": "heiß"
        }"""
    generator = DetailGenerator()
    response = generator.generateResponse(user_input, "all")
    response = JsonFormatter(response).remove_backticks()
    print("Generated Detailed Recipe:", response)

if __name__ == "__main__":
    main()