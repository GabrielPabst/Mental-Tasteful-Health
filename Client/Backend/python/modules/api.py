import json
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from WinkkClient.RecipeGenerator import RecipeGenerator
from WinkkClient.BonusRecipeGenerator import BonusRecipeGenerator
from WinkkClient.IngredientAnalyser import IngredientAnalyser
from WinkkClient.AdditionalIngredientGenerator import AdditionalIngredientGenerator
from WinkkClient.DetailGenerator import DetailGenerator
from WinkkClient.ImageAnalyser import ImageAnalyser
from helpers.JsonFormatter import JsonFormatter
import psycopg2
from psycopg2.extras import RealDictCursor
app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
CORS(app, resources={r"/*": {"origins": "*"}})

# Endpoint 1: Get recipes based on ingredients
@app.route('/get_recipes', methods=['POST'])
def get_recipes():
    ingredients = request.json.get('ingredients', [])
    preffered_cuisine = request.json.get('cuisine',"all")
    recipe_count = request.json.get('recipe_count', 2)
    # Find recipes that include all ingredients
    matching_recipes = RecipeGenerator().generateResponse(" ".join(ingredients), preffered_cuisine, recipe_count)
    matching_recipes = JsonFormatter(matching_recipes).remove_backticks()
    try:
        matching_recipes = json.loads(matching_recipes)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to decode JSON"}), 500
    return jsonify({"recipes": matching_recipes})
# Endpoint: Get bonus recipes
@app.route('/bonus_recipe', methods=['POST'])
def get_bonus_recipes():
    ingredients = request.json.get('ingredients', [])
    preffered_cuisine = request.json.get('cuisine', "all")
    additional_ingredients_count = request.json.get('additional_ingredients_count', 2)
    
    recipe_generator = BonusRecipeGenerator()
    response = recipe_generator.generateResponse(" ".join(ingredients), preffered_cuisine, additional_ingredients_count)
    response = JsonFormatter(response).remove_backticks()
    try:
        response = json.loads(response)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to decode JSON"}), 500
    
    return jsonify({"bonus_recipes": response})
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
    count = request.json.get('count', 2)
    add = AdditionalIngredientGenerator()
    filtered_ingredients = add.generateResponse(" ".join(ingredients), count)
    return jsonify({"additional_ingredients": filtered_ingredients})
@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)

    generator = ImageAnalyser()
    ingredient_analyser = IngredientAnalyser()
    response = generator.generateResponse(image_path)
    response = ingredient_analyser.generateResponse(response)
    return jsonify({"analysis": response})

# Endpoint: Generate detailed recipe
@app.route('/generate_detailed_recipe', methods=['POST'])
def generate_detailed_recipe():
    user_input = request.json
    
    generator = DetailGenerator()
    response = generator.generateResponse(user_input, "all")
    response = re.sub(r"```json|```", "", response).strip()
    response = json.loads(response)
    return jsonify({"detailed_recipe": response})

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="mydatabase",
        user="myuser",
        password="mypassword"
    )
    return conn
# Endpoint: Get all recipes
@app.route('/fav-recipes', methods=['GET'])
def get_all_recipes():
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM fav_recipe')
        recipes = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(recipes)

    # Endpoint: Get recipe by ID
@app.route('/fav-recipes/<int:id>', methods=['GET'])
def get_recipe_by_id(id):
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM fav_recipe WHERE id = %s', (id,))
        recipe = cursor.fetchone()
        cursor.close()
        conn.close()
        if recipe is None:
            return jsonify({"error": "Recipe not found"}), 404
        return jsonify(recipe)

    # Endpoint: Add a new recipe
@app.route('/fav-recipes/add', methods=['POST'])
def add_recipe():
        new_recipe = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO fav_recipe (name, ingredients, how_to_cook, allergies, healthy, hot_or_cold, user_id) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
            (new_recipe['name'], new_recipe['ingredients'], new_recipe['howToCook'], new_recipe['allergies'], new_recipe['healthy'], new_recipe['hotOrCold'], new_recipe['userID'])
        )
        recipe_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"id": recipe_id}), 201

    # Endpoint: Delete a recipe by ID
@app.route('/fav-recipes/remove/<int:id>', methods=['DELETE'])
def delete_recipe(id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM fav_recipe WHERE id = %s RETURNING id', (id,))
        deleted_id = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if deleted_id is None:
            return jsonify({"error": "Recipe not found"}), 404
        return jsonify({"id": deleted_id[0]}), 200
        # Endpoint: Get all ingredients in the fridge
@app.route('/fridge', methods=['GET'])
def get_all_ingredients():
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM fridge')
        ingredients = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(ingredients)
# Endpoint: Get ingredient by ID
@app.route('/fridge/<int:id>', methods=['GET'])
def get_ingredient_by_id(id):
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM fridge WHERE id = %s', (id,))
        ingredient = cursor.fetchone()
        cursor.close()
        conn.close()
        if ingredient is None:
            return jsonify({"error": "Ingredient not found"}), 404
        return jsonify(ingredient)
        # Endpoint: Add a new ingredient to the fridge
@app.route('/fridge/add', methods=['POST'])
def add_ingredient():
        new_ingredient = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO fridge (ingredient_name) VALUES (%s) RETURNING id',
             (new_ingredient['ingredient_name'],)
           )
        ingredient_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"id": ingredient_id}), 201

        # Endpoint: Delete an ingredient from the fridge by ID
@app.route('/fridge/remove/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM fridge WHERE id = %s RETURNING id', (id,))
        deleted_id = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if deleted_id is None:
              return jsonify({"error": "Ingredient not found"}), 404
        return jsonify({"id": deleted_id[0]}), 200
        # Endpoint: Update an ingredient in the fridge by ID
@app.route('/fridge/update/<int:id>', methods=['PUT'])
def update_ingredient(id):
        updated_ingredient = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
             'UPDATE fridge SET ingredient_name = %s WHERE id = %s RETURNING id',
             (updated_ingredient['name'], id)
        )
        updated_id = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if updated_id is None:
            return jsonify({"error": "Ingredient not found"}), 404
        return jsonify({"id": updated_id[0]}), 200

        # Endpoint: Get all users
@app.route('/users', methods=['GET'])
def get_all_users():
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM users')
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(users)

        # Endpoint: Get user by ID
@app.route('/users/<int:id>', methods=['GET'])
def get_user_by_id(id):
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM users WHERE id = %s', (id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user)

        # Endpoint: Add a new user
@app.route('/users/add', methods=['POST'])
def add_user():
        new_user = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (google_id, email, name, profile_picture) VALUES (%s, %s, %s, %s) RETURNING id',
            (new_user['google_id'], new_user['email'], new_user.get('name'), new_user.get('profile_picture'))
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"id": user_id}), 201

        # Endpoint: Delete a user by ID
@app.route('/users/remove/<int:id>', methods=['DELETE'])
def delete_user(id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE id = %s RETURNING id', (id,))
        deleted_id = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if deleted_id is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": deleted_id[0]}), 200
# Endpoint: Update nutriscore by user ID
@app.route('/users/<int:id>/update/nutriscore', methods=['POST'])
def update_nutriscore(id):
    new_nutriscore = request.json.get('nutriscore')
    if new_nutriscore is None:
        return jsonify({"error": "Nutriscore is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE users SET nutriscore = %s WHERE id = %s RETURNING id',
        (new_nutriscore, id)
    )
    updated_id = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_id is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": updated_id[0]}), 200

# Endpoint: Get nutriscore by user ID
@app.route('/users/<int:id>/get/nutriscore', methods=['GET'])
def get_nutriscore(id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT nutriscore FROM users WHERE id = %s', (id,))
    nutriscore = cursor.fetchone()
    cursor.close()
    conn.close()
    if nutriscore is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(nutriscore)


if __name__ == '__main__':
    app.run(debug=True)
