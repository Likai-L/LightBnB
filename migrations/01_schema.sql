DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS property_reviews CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE properties (
  -- important information
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(65535),
  cost_per_night INTEGER NOT NULL DEFAULT 0,
  -- details
  parking_spaces INTEGER NOT NULL DEFAULT 0,
  number_of_bedrooms INTEGER NOT NULL DEFAULT 0,
  number_of_bathrooms INTEGER NOT NULL DEFAULT 0,
  -- photos
  thumbnail_url VARCHAR(2000),
  cover_url VARCHAR(2000),
  -- address
  country VARCHAR(255) NOT NULL,
  province VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  post_code VARCHAR(255) NOT NULL,
  -- active or not
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 0,
  message VARCHAR(65535)
);