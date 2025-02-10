import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
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
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {

  // Signals
  ingredients = signal('');
  ingredientList = signal<string[]>([]);
  recipes = signal<any[]>([]); // Speichert die Rezepte

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

        // 4️⃣ Jetzt Rezepte mit den gefilterten Zutaten abrufen
        this.getRecipes(filtered);
      },
      (error) => {
        console.error('Fehler beim Filtern der Zutaten:', error);
      }
    );
  }

  getRecipes(ingredients: string[]) {
    this.http.post<{ recipes: { recipies: any[] } }>('http://127.0.0.1:5000/get_recipes', {
      ingredients: ingredients
    }).subscribe(
      (response) => {
        // Rezepte speichern (API gibt ein Objekt mit `recipes.recipies` zurück)
        this.recipes.set(response.recipes.recipies);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Rezepte:', error);
      }
    );
  }
}
