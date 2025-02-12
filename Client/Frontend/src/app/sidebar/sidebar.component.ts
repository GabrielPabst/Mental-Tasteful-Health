import {Component, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  standalone: true,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isOpen = signal(false);

  constructor(private router: Router) {
  }

  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
    this.isOpen.set(false);
  }

  navigateToRefrigerator() {
    this.router.navigateByUrl('/refrigerator');
    this.isOpen.set(false);
  }

  navigateToRecipes() {
    this.router.navigateByUrl('/recipes');
    this.isOpen.set(false);
  }

  navigateToFavourite() {
    this.router.navigateByUrl('/favourite');
    this.isOpen.set(false);
  }
}
