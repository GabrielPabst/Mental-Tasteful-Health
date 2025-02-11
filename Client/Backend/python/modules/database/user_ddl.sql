-- Generated by the database client.
CREATE TABLE users(
    id SERIAL NOT NULL,
    google_id varchar(255) NOT NULL,
    email varchar(320) NOT NULL,
    name varchar(255),
    profile_picture text,
    PRIMARY KEY(id)
);
CREATE UNIQUE INDEX users_google_id_key ON users USING btree ("google_id");
CREATE UNIQUE INDEX users_email_key ON users USING btree ("email");