import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {

  // Signals
  ingredients = signal('');
  ingredientList = signal<string[]>([]);
  // Properties

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }


  searchIngredients() {
    // 1️⃣ Zutaten splitten und Leerzeichen entfernen
    const rawIngredients = this.ingredients().split(',').map(i => i.trim());

    // 2️⃣ API-Request an den /filter_ingredients-Endpoint
    this.http.post<{ filtered_ingredients: string }>('http://127.0.0.1:5000/filter_ingredients', {
      ingredients: rawIngredients
    }).subscribe(
      (response) => {
        // 3️⃣ Die API gibt einen String zurück -> in ein Array umwandeln
        this.ingredientList.set(response.filtered_ingredients.split(',').map(i => i.trim()));
      },
      (error) => {
        console.error('Fehler beim Filtern der Zutaten:', error);
      }
    );
  }

}
