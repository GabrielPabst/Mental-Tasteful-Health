import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-refrigerator',
  imports: [],
  templateUrl: './refrigerator.component.html',
  standalone: true,
  styleUrl: './refrigerator.component.css'
})
export class RefrigeratorComponent {

  ingridientsList = signal<[string, boolean][]>([
    ["Kakao", false],
    ["Mehl", false]
  ]);

  ngOnInit() {
    //not implemented
  }

  selectIngrident(ingredient: string) {
    this.ingridientsList.set(
      this.ingridientsList().map(([name, checked]) =>
        name === ingredient ? [name, !checked] : [name, checked]
      )
    );
  }

  generateMeal() {

  }
}
