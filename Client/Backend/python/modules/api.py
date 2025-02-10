import json
from flask import Flask, request, jsonify
from WinkkClient.RecipeGenerator import RecipeGenerator
from WinkkClient.IngredientAnalyser import IngredientAnalyser
from WinkkClient.AdditionalIngredientGenerator import AdditionalIngredientGenerator
from helpers.JsonFormatter import JsonFormatter
app = Flask(__name__)


# Endpoint 1: Get recipes based on ingredients
@app.route('/get_recipes', methods=['POST'])
def get_recipes():
    ingredients = request.json.get('ingredients', [])
    
    # Find recipes that include all ingredients
    matching_recipes = RecipeGenerator().generateResponse(" ".join(ingredients), "all")
    matching_recipes = JsonFormatter(matching_recipes).remove_backticks()
    matching_recipes = json.loads(matching_recipes)
    
    return jsonify({"recipes": matching_recipes})

# Endpoint 2: Filter ingredients array (removing duplicates)
@app.route('/filter_ingredients', methods=['POST'])
def filter_ingredients():
    ingredients = request.json.get('ingredients', [])

    ingredient_analyser = IngredientAnalyser()
    filtered_ingredients = ingredient_analyser.generateResponse(" ".join(ingredients))
    return jsonify({"filtered_ingredients": filtered_ingredients})

@app.route('/additional_ingredients', methods=['POST'])
def additional_ingredients():
    ingredients = request.json.get('ingredients', [])

    add = AdditionalIngredientGenerator()
    filtered_ingredients = add.generateResponse(" ".join(ingredients), 2)
    return jsonify({"additional_ingredients": filtered_ingredients})
if __name__ == '__main__':
    app.run(debug=True)
