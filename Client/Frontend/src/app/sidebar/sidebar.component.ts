import {Component, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
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
}
