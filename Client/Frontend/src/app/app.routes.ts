import { Routes } from '@angular/router';
import {RecipesComponent} from './recipes/recipes.component';
import {LoginComponent} from './login/login.component';
import {RefrigeratorComponent} from './refrigerator/refrigerator.component';

export const routes: Routes = [
  {path: 'recipes', pathMatch: "full", component: RecipesComponent},
  {path: 'login', pathMatch: "full", component: LoginComponent},
  {path: "refrigerator", pathMatch: "full", component: RefrigeratorComponent},
];

