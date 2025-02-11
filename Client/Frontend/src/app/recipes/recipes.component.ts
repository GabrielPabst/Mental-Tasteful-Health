import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

  // Signals
  ingredients = signal('');
  ingredientList = signal<string[]>([]);
  // Wir belassen recipes für später, rufen aber aktuell keine Rezepte ab.
  recipes = signal<any[]>([]);

  constructor(private http: HttpClient) { }

  ngOnInit() { }

  searchIngredients() {
    // 1️⃣ Zutaten splitten und Leerzeichen entfernen
    const rawIngredients = this.ingredients().split(',').map(i => i.trim());

    // 2️⃣ API-Request an den /filter_ingredients-Endpoint
    this.http.post<{ filtered_ingredients: string }>('http://127.0.0.1:5000/filter_ingredients', {
      ingredients: rawIngredients
    }).subscribe(
      (response) => {
        // 3️⃣ Die API gibt einen String zurück -> in ein Array umwandeln
        const filtered = response.filtered_ingredients.split(',').map(i => i.trim());
        this.ingredientList.set(filtered);

        // 3.1️⃣ Gefilterte Zutaten in die Datenbank einfügen (über den /fridge/add Endpunkt)
        this.insertIngredients(filtered);

        // Aktuell werden keine Rezepte abgerufen:
        // this.getRecipes(filtered);
      },
      (error) => {
        console.error('Fehler beim Filtern der Zutaten:', error);
      }
    );
  }

  /**
   * Für jede gefilterte Zutat wird ein POST-Request an den vorhandenen
   * Endpunkt /fridge/add gesendet, der einen neuen Eintrag in der Fridge-Tabelle anlegt.
   * Der Endpunkt erwartet einen JSON-Body mit der Eigenschaft "name".
   */
  insertIngredients(filteredIngredients: string[]) {
    filteredIngredients.forEach(ingredient => {
      this.http.post<{ id: number }>('http://127.0.0.1:5000/fridge/add', {
        name: ingredient
      }).subscribe(
        (response) => {
          console.log(`Zutat "${ingredient}" erfolgreich eingefügt mit ID:`, response.id);
        },
        (error) => {
          console.error(`Fehler beim Einfügen der Zutat "${ingredient}":`, error);
        }
      );
    });
  }

  // Diese Methode behalten wir für später, um Rezepte abzurufen.
  getRecipes(ingredients: string[]) {
    this.http.post<{ recipes: { recipies: any[] } }>('http://127.0.0.1:5000/get_recipes', {
      ingredients: ingredients
    }).subscribe(
      (response) => {
        this.recipes.set(response.recipes.recipies);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Rezepte:', error);
      }
    );
  }
}
