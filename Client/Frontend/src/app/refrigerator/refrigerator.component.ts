import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgForOf, NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {Recipe, RecipiesResDto} from '../dto/RecipiesResDto';


@Component({
  selector: 'app-refrigerator',
  standalone: true,
  templateUrl: './refrigerator.component.html',
  styleUrls: ['./refrigerator.component.css'],
  imports: []
})
export class RefrigeratorComponent implements OnInit {

  ingredientsList = signal<[string, boolean][]>([]);

  recipes = signal<Recipe[]>([]);

  detailedRecipe = signal<any | null>(null);

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    await this.loadFridgeItems();
  }

  /**
   * Holt alle Einträge aus dem Kühlschrank über den Endpunkt (/fridge)
   * und wandelt sie in das Format [ingredient_name, false] um.
   */
  async loadFridgeItems(): Promise<void> {
    await this.http.get<any[]>('http://127.0.0.1:5000/fridge').subscribe(
      (response) => {
        const list = response.map(item => [item.ingredient_name, false] as [string, boolean]);
        this.ingredientsList.set(list);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kühlschrank-Daten:', error);
      }
    );
  }

  /**
   * Schaltet den ausgewählten Status der Zutat um.
   * @param ingredient Der Name der Zutat, die selektiert wurde.
   */
  selectIngredient(ingredient: string) {
    this.ingredientsList.set(
      this.ingredientsList().map(([name, checked]) =>
        name === ingredient ? [name, !checked] : [name, checked]
      )
    );
  }

  /**
   * TrackBy-Funktion für *ngFor, um effizient zu rendern.
   */
  trackByName(index: number, ingredient: [string, boolean]): string {
    return ingredient[0];
  }

  /**
   * Wird aufgerufen, wenn "Mahlzeit generieren" geklickt wird.
   * Es wird ein festes Array mit den Zutaten aus dem Test-Request gesendet:
   * { "ingredients": ["lettuce", "tomato", "cheese", "sausage"] }
   */
  async generateMeal() {
    const testIngredients = ["lettuce", "tomato", "cheese", "sausage"];
    console.log("Test Ingredients: ", testIngredients);
    const uniqueIngredients = [
      ...new Set(
        this.ingredientsList()
          .filter(([_, checked]) => checked)
          .map(([name, _]) => name)
      )
    ];

    console.log(uniqueIngredients);

    try {
      const response = await firstValueFrom(
        this.http.post<RecipiesResDto>(
          'http://127.0.0.1:5000/get_recipes',
          { ingredients: uniqueIngredients }
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


  /**
   * Wird aufgerufen, wenn der "Detaillierte Schritte anzeigen"-Button in einer Rezeptkarte geklickt wird.
   * Sendet einen POST-Request an den /generate_detailed_recipe-Endpunkt mit den Rezeptdaten.
   */
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

  /**
   * Schließt das Modal, indem das Signal detailedRecipe auf null gesetzt wird.
   */
  closeModal() {
    this.detailedRecipe.set(null);
  }
}
