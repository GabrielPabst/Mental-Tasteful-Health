import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-refrigerator',
  standalone: true,
  templateUrl: './refrigerator.component.html',
  styleUrls: ['./refrigerator.component.css'],
  // Importiere HttpClientModule, NgForOf und NgIf, damit diese Direktiven in dieser Komponente genutzt werden können.
  imports: [HttpClientModule, NgForOf, NgIf]
})
export class RefrigeratorComponent implements OnInit {

  // Signal, das eine Liste von Tupeln [Zutat, ausgewählt] speichert.
  // Wird in ngOnInit durch loadFridgeItems() befüllt.
  ingridientsList = signal<[string, boolean][]>([]);

  // Signal für die Rezepte, die von der API zurückgegeben werden.
  recipes = signal<any[]>([]);

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadFridgeItems();
  }

  /**
   * Holt alle Einträge aus dem Kühlschrank über den korrekten Endpunkt (/fridge)
   * und wandelt sie in das Format [ingredient_name, false] um.
   */
  loadFridgeItems(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/fridge').subscribe(
      (response) => {
        // Hier wird angenommen, dass jedes Objekt in der Antwort mindestens die Eigenschaft "ingredient_name" besitzt.
        const list = response.map(item => [item.ingredient_name, false] as [string, boolean]);
        this.ingridientsList.set(list);
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
  selectIngrident(ingredient: string) {
    this.ingridientsList.set(
      this.ingridientsList().map(([name, checked]) =>
        name === ingredient ? [name, !checked] : [name, checked]
      )
    );
  }

  /**
   * Wird aufgerufen, wenn der Benutzer "Mahlzeit generieren" klickt.
   * Es werden alle Zutaten ermittelt, die als ausgewählt markiert sind,
   * und anschließend ein Request an den Rezept-Endpoint (/get_recipes) gesendet.
   * Der Rückgabewert wird dabei unter dem Schlüssel "recipies" erwartet (wie in der originalen Recipes-Komponente).
   */
  generateMeal() {
    // Filtere alle Zutaten, bei denen der Boolean-Wert true ist.
    const selectedIngredients = this.ingridientsList()
      .filter(([name, checked]) => checked)
      .map(([name, _]) => name);

    console.log("Ausgewählte Zutaten: ", selectedIngredients);

    // Falls keine Zutaten ausgewählt wurden, wird kein Request gesendet.
    if (selectedIngredients.length === 0) {
      console.log("Keine Zutaten ausgewählt.");
      return;
    }

    // Sende einen POST-Request an den /get_recipes-Endpunkt mit den ausgewählten Zutaten.
    this.http.post<{ recipes: { recipies: any[] } }>('http://127.0.0.1:5000/get_recipes', {
      ingredients: selectedIngredients
    }).subscribe(
      (response) => {
        // Die Rezepte werden im Signal gespeichert.
        this.recipes.set(response.recipes.recipies);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Rezepte:', error);
      }
    );
  }

  /**
   * Eine TrackBy-Funktion für *ngFor, die anhand des Zutaten-Namens
   * die einzelnen Einträge identifiziert.
   */
  trackByName(index: number, ingredient: [string, boolean]): string {
    return ingredient[0];
  }
}
