import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {Recipe, RecipiesResDto} from '../dto/RecipiesResDto';
import {FormsModule} from '@angular/forms';
import {FridgeResDto} from '../dto/FridgeResDto';


@Component({
  selector: 'app-refrigerator',
  standalone: true,
  templateUrl: './refrigerator.component.html',
  styleUrls: ['./refrigerator.component.css'],
  imports: [
    FormsModule
  ]
})
export class RefrigeratorComponent implements OnInit {

  ingredientsList = signal<FridgeResDto[] | null>(null);

  selectedIngredientsList = signal<string[]>([]);

  recipes = signal<Recipe[]>([]);

  detailedRecipe = signal<any | null>(null);
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

    console.log(this.selectedIngredientsList());
    console.log(this.selectedIngredientsList());

    if(this.selectedIngredientsList().length === 0) {
      alert("Bitte wählen Sie mindestens eine Zutat aus.");
    }

    try {
      const response = await firstValueFrom(
        this.http.post<RecipiesResDto>(
          'http://127.0.0.1:5000/get_recipes',
          { ingredients: this.selectedIngredientsList() }
        )
      );

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


  showDetailedRecipe(recipe: any) {
    this.http.post<{ detailed_recipe: any }>(
      'http://127.0.0.1:5000/generate_detailed_recipe',
      {
        name: recipe.name,
        ingredients: recipe.ingredients,
        howToCook: recipe.howToCook,
        allergies: recipe.allergies,
        healthy: recipe.healthy,
        hotOrCold: recipe.hotOrCold
      }
    ).subscribe(
      (response) => {
        this.detailedRecipe.set(response.detailed_recipe);
      },
      (error) => {
        console.error('Fehler beim Abrufen des detaillierten Rezepts:', error);
      }
    );
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
