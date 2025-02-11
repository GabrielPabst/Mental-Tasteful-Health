import { Component, OnInit } from '@angular/core';

// Damit TypeScript die globale Variable "google" kennt:
declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
})
export class LoginComponent implements OnInit {

  private googleAuthClient: any;
  public isGoogleClientLoaded = false; // Optional: um den Button zu deaktivieren, solange der Client nicht geladen ist

  ngOnInit(): void {
    this.loadGoogleAuthScript();
  }

  triggerGoogleLogin(): void {
    if (this.googleAuthClient) {
      // Der Aufruf muss von einer Benutzeraktion (z.B. Button-Klick) erfolgen, damit Google ihn akzeptiert
      this.googleAuthClient.requestAccessToken();
    } else {
      console.error("Google Auth Client nicht geladen!");
    }
  }

  private loadGoogleAuthScript(): void {
    // Falls das Script noch nicht im Dokument vorhanden ist, laden wir es dynamisch
    if (!document.getElementById('google-js')) {
      const script = document.createElement("script");
      script.id = "google-js";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      // Sobald das Script geladen ist, initialisieren wir den Login-Client
      script.onload = () => this.initializeGoogleLogin();
      document.head.appendChild(script);
    } else {
      this.initializeGoogleLogin();
    }
  }

  private initializeGoogleLogin(): void {
    // Überprüfe, ob das Google-Objekt korrekt geladen wurde
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      console.error("Google API konnte nicht geladen werden!");
      return;
    }

    // Initialisiere den Token-Client mit deiner korrekten Client-ID und gewünschten Scopes
    this.googleAuthClient = google.accounts.oauth2.initTokenClient({
      client_id: '751706940753-h6qstqnac7cldnp18a21r7d261icd1ag.apps.googleusercontent.com', // Ersetze ggf. durch deine Client-ID
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
      callback: (response: any) => {
        // Dieser Callback wird nach erfolgreichem Login ausgeführt
        console.log("Google Login erfolgreich!", response);
        alert("Login erfolgreich! Token: " + response.access_token);
      }
    });

    // Optional: Markiere, dass der Client geladen wurde (z.B. um den Button zu aktivieren)
    this.isGoogleClientLoaded = true;
  }
}
