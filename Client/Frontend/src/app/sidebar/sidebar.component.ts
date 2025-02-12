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
  isOpen = signal(true);

  constructor(private router: Router) {
  }

  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

  navigateToRefrigerator() {
    this.router.navigateByUrl('/refrigerator');
  }

  navigateToRecipes() {
    this.router.navigateByUrl('/recipes');
  }

  navigateToFavourite() {
    this.router.navigateByUrl('/favourite');
  }
}
