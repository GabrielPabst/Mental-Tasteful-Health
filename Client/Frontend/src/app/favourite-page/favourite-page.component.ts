import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  howToCook: string;
  allergies: string[];
  healthy: boolean;
  hotOrCold: string;
}

@Component({
  selector: 'app-favourite-page',
  standalone: true,
  templateUrl: './favourite-page.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./favourite-page.component.css']
})
export class FavouritePageComponent {

  recipes = signal<Recipe[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadFavouriteRecipes();
  }

  /**
   * Lädt alle gespeicherten Lieblingsrezepte aus der Datenbank.
   */
  async loadFavouriteRecipes() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await lastValueFrom(this.http.get<Recipe[]>('http://127.0.0.1:5000/fav-recipes'));
      this.recipes.set(response);
      console.log("✅ Lieblingsrezepte geladen:", response);
    } catch (error) {
      console.error("❌ Fehler beim Laden der Lieblingsrezepte:", error);
      this.errorMessage.set("⚠️ Fehler beim Laden der Lieblingsrezepte.");
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Entfernt ein Rezept aus der Liste der Favoriten.
   */
  async removeFromFavourites(recipeId: number) {
    if (!confirm("Möchtest du dieses Rezept wirklich entfernen?")) return;

    try {
      await lastValueFrom(this.http.delete(`http://127.0.0.1:5000/fav-recipes/remove/${recipeId}`));
      console.log(`✅ Rezept mit ID ${recipeId} wurde entfernt.`);

      // Aktualisiert die Liste, indem das entfernte Rezept rausgefiltert wird.
      this.recipes.set(this.recipes().filter(r => r.id !== recipeId));
    } catch (error) {
      console.error(`❌ Fehler beim Entfernen des Rezepts ${recipeId}:`, error);
      this.errorMessage.set("⚠️ Rezept konnte nicht entfernt werden.");
    }
  }
}
