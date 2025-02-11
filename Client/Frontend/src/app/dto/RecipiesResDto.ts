export interface RecipiesResDto {
  recipes: Recipes;
}

export interface Recipes {
  recipies: Recipe[];
}

export interface Recipe {
  allergies: string[];
  healthy: boolean;
  hotOrCold: string;
  howToCook: string;
  ingredients: string[];
  name: string;
}
