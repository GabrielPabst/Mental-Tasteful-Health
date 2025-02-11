-- Generated by the database client.
CREATE TABLE fridge(
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    ingredient_name varchar(255),
    PRIMARY KEY(id)
);
COMMENT ON TABLE fridge IS 'Table to store ingredients in the fridge';
COMMENT ON COLUMN fridge.ingredient_name IS 'Name of the item';