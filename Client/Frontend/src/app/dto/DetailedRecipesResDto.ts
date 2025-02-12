export interface DetailedRecipesResDto {
  "detailed_recipe": {
    "name": "string",
    "ingredients": [ "string" ],
    "detailed_steps": [ "string" ],
    "allergies": [ "string" ],
    "healthy": boolean,
    "hotOrCold": "string"
  }
}
