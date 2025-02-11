-- Generated by the database client.
CREATE TABLE fav_recipe(
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    name varchar(255),
    ingredients text[],
    how_to_cook text,
    allergies text[],
    healthy boolean,
    hot_or_cold varchar(10),
    user_id integer,
    PRIMARY KEY(id),
    CONSTRAINT fav_recipe_user_id_fkey FOREIGN key(user_id) REFERENCES users(id)
);
COMMENT ON COLUMN fav_recipe.name IS 'Name of the recipe';
COMMENT ON COLUMN fav_recipe.ingredients IS 'List of ingredients';
COMMENT ON COLUMN fav_recipe.how_to_cook IS 'Instructions on how to cook the recipe';
COMMENT ON COLUMN fav_recipe.allergies IS 'List of allergies';
COMMENT ON COLUMN fav_recipe.healthy IS 'Indicates if the recipe is healthy';
COMMENT ON COLUMN fav_recipe.hot_or_cold IS 'Indicates if the recipe is served hot or cold';