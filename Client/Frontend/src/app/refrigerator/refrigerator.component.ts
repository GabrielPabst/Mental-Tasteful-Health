import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {Recipe, RecipiesResDto} from '../dto/RecipiesResDto';
import {FormsModule} from '@angular/forms';
import {FridgeResDto} from '../dto/FridgeResDto';
import {DetailedRecipesResDto} from '../dto/DetailedRecipesResDto';


@Component({
  selector: 'app-refrigerator',
  imports: [FormsModule],
  templateUrl: './refrigerator.component.html',
  standalone: true,
  styleUrls: ['./refrigerator.component.css']
})
export class RefrigeratorComponent implements OnInit {

  ingredientsList = signal<FridgeResDto[] | null>(null);

  selectedIngredientsList = signal<string[]>([]);

  recipes = signal<Recipe[]>([]);

  detailedRecipe = signal<DetailedRecipesResDto | null>(null);
  newIngredient = signal<string>('');

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    await this.loadFridgeItems();
  }

  async loadFridgeItems(): Promise<void> {
    this.http.get<FridgeResDto[]>('http://127.0.0.1:5000/fridge').subscribe(
      (response) => {
        this.ingredientsList.set(response);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kühlschrank-Daten:', error);
      }
    );
  }

  selectIngredient(ingredient: FridgeResDto) {

    if(this.selectedIngredientsList().includes(ingredient.ingredient_name)) {
      this.selectedIngredientsList.set(
        this.selectedIngredientsList().filter((name) => name !== ingredient.ingredient_name)
      );
    } else {
      this.selectedIngredientsList.set([...this.selectedIngredientsList(), ingredient.ingredient_name]);
    }
  }

  removeIngredientFromSelectedList(ingredient: string) {
    this.selectedIngredientsList.set(
      this.selectedIngredientsList().filter((name) => name !== ingredient)
    );
  }

  async generateMeal() {

    if(this.selectedIngredientsList().length !== 0) {
      try {
        const response = await firstValueFrom(
          this.http.post<RecipiesResDto>(
            'http://127.0.0.1:5000/get_recipes',
            {ingredients: this.selectedIngredientsList()}
          )
        );

        console.log(response);

        if(response.recipes.recipies.length === 0) {
          alert("Es wurden keine Rezepte gefunden.");
        }

        this.recipes.set(
          response.recipes.recipies.map((recipe: Recipe) => {
            return {
              name: recipe.name,
              ingredients: recipe.ingredients,
              howToCook: recipe.howToCook,
              allergies: recipe.allergies,
              healthy: recipe.healthy,
              hotOrCold: recipe.hotOrCold
            };
          })
        );
      } catch (error) {
        console.error('Fehler beim Abrufen der Rezepte (Test):', error);
      }
    }
    else{
      alert("Bitte wählen Sie mindestens eine Zutat aus.");
    }
  }

  async showDetailedRecipe(recipe: Recipe) {
    try {
      const response = await firstValueFrom(
        this.http.post<DetailedRecipesResDto>(
          'http://127.0.0.1:5000/generate_detailed_recipe',
          {
            name: recipe.name,
            ingredients: recipe.ingredients,
            howToCook: recipe.howToCook,
            allergies: recipe.allergies,
            healthy: recipe.healthy,
            hotOrCold: recipe.hotOrCold
          }
        )
      );

      this.detailedRecipe.set(response);

      console.log(this.detailedRecipe());
    } catch (error) {
      console.error('Fehler beim Abrufen des detaillierten Rezepts:', error);
    }

  }


  closeModal() {
    this.detailedRecipe.set(null);
  }

  async addIngredient(addIngredientDialog: HTMLDialogElement) {
    if(this.newIngredient() === '') {
      alert("Bitte geben Sie eine Zutat ein.");
    }

    try{
      const response = await firstValueFrom(
        this.http.post<number>("http://127.0.0.1:5000/fridge/add", {
          ingredient_name: this.newIngredient()
        }));

      await this.loadFridgeItems();

      addIngredientDialog.close();

    } catch (error) {
      console.error('Fehler beim Hinzufügen einer Zutat:', error);
    }
  }

  async removeIngredient(ingredientElement: FridgeResDto) {

    try{
      const response = await firstValueFrom(
        this.http.delete<number>("http://127.0.0.1:5000/fridge/remove/" + ingredientElement.id));

      this.removeIngredientFromSelectedList(ingredientElement.ingredient_name);

      await this.loadFridgeItems();

    } catch (error) {
      console.error('Fehler beim Löschen einer Zutat:', error);
    }
  }

  async editIngredient(ingredient: FridgeResDto) {

    try{
      const response = await firstValueFrom(
        this.http.put<number>("http://127.0.0.1:5000/fridge/update/" + ingredient.id, {
          ingredient_name: ingredient.ingredient_name
        }));

      await this.loadFridgeItems();
    }
    catch (e) {
      console.log("Error while updating ingredient: ", e);
    }
  }
}
