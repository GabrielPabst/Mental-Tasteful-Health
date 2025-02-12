import { Routes } from '@angular/router';
import {RecipesComponent} from './recipes/recipes.component';
import {LoginComponent} from './login/login.component';
import {RefrigeratorComponent} from './refrigerator/refrigerator.component';
import {FavouritePageComponent} from './favourite-page/favourite-page.component';

export const routes: Routes = [
  {path: "recipes", pathMatch: "full", component: RecipesComponent},
  {path: "login", pathMatch: "full", component: LoginComponent},
  {path: "refrigerator", pathMatch: "full", component: RefrigeratorComponent},
  {path: "favourite", pathMatch: "full", component: FavouritePageComponent},
  {path: "", pathMatch: "full", redirectTo: "/login"}
];

