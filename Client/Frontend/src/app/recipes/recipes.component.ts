import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-recipes',
  standalone: true,
  templateUrl: './recipes.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent {

  selectedFile: File | null = null;
  isLoading = signal<boolean>(false);
  ingredientList = signal<string[]>([]);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Wird aufgerufen, wenn eine Datei gezogen oder hochgeladen wird.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  /**
   * Bild an die API senden und Zutaten analysieren lassen.
   */
  async analyzeImage() {
    if (!this.selectedFile) {
      this.errorMessage.set('⚠️ Bitte wähle zuerst eine Datei aus.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    try {
      console.log("📡 Sende Bild zur Analyse...");

      const response: any = await lastValueFrom(this.http.post(
        'http://127.0.0.1:5000/analyze_image',
        formData
      ));

      console.log("🔍 API-Antwort von /analyze_image:", response);

      if (!response || !response.analysis) {
        throw new Error("❌ Keine Zutaten in der API-Antwort gefunden.");
      }

      const extractedIngredients = response.analysis
        .split(',')
        .map((i: string) => i.trim());

      // ✅ Zutaten anzeigen
      console.log("🔍 Rohdaten der API-Antwort:", response);
      console.log("📋 Antworttyp:", typeof response);
      console.log("📋 API-Antwort-Keys:", Object.keys(response || {}));

      this.ingredientList.set(extractedIngredients);
      console.log("✅ Zutaten:", extractedIngredients); // er kommt nie hier her btw

      // ✅ Zutaten speichern (wird erst nach Anzeige ausgeführt)
      await this.saveIngredientsToDB(extractedIngredients);

    } catch (error) {
      console.error("❌ Fehler bei der Analyse:", error);
      this.errorMessage.set("⚠️ Analyse fehlgeschlagen. Überprüfe das Bild.");
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Speichert die Zutaten in der Datenbank.
   */
  async saveIngredientsToDB(ingredients: string[]) {
    console.log("🛢️ Speichere Zutaten in der Datenbank:", ingredients);

    for (const ingredient of ingredients) {
      try {
        console.log(`📡 Speichere '${ingredient}'...`);

        const response = await lastValueFrom(this.http.post<{ id: number }>(
          'http://127.0.0.1:5000/fridge/add',  // ✅ Richtiger Endpoint!
          { name: ingredient }  // ✅ Richtiger JSON-Body!
        ));

        console.log(`✅ '${ingredient}' wurde erfolgreich gespeichert (ID: ${response?.id}).`);

      } catch (error) {
        console.error(`❌ Fehler beim Speichern von '${ingredient}':`, error);
        this.errorMessage.set(`⚠️ '${ingredient}' konnte nicht gespeichert werden.`);
      }
    }
  }


  onDragOver(event: DragEvent) {
    event.preventDefault(); // Standardverhalten verhindern (öffnet Datei im Browser)
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0]; // Datei speichern
      console.log("📂 Datei per Drag & Drop ausgewählt:", this.selectedFile);
    }
  }


}
