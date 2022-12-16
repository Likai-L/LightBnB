/* eslint-disable camelcase */
const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'likailiu',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`
    SELECT *
    FROM users
    WHERE email = $1
    `, [email])
    .then((response) => {
      console.log(`Query excuted successfully: returned ${response.rows.length} rows`);
      if (response.rows.length === 0) return null;
      return response.rows[0];
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(`
    SELECT *
    FROM users
    WHERE id = $1
    `, [id])
    .then((response) => {
      console.log(`Query excuted successfully: returned ${response.rows.length} rows`);
      if (response.rows.length === 0) return null;
      return response.rows[0];
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
    .query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
    .then((response) => {
      console.log(`Query excuted successfully: returned ${response.rows.length} rows`);
      return response.rows[0];
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(`
    SELECT reservations.*, properties.*, AVG(rating)
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY start_date
    LIMIT $2;
    `, [guest_id, limit])
    .then((response) => {
      console.log(`Query excuted successfully: returned ${response.rows.length} rows`);
      return response.rows;
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  let queryParams = [limit];
  let queryString = `
   SELECT properties.*, AVG(property_reviews.rating) AS average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
  `;
  
  //WHERE clauses to filter properties
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `
    WHERE city LIKE $${queryParams.length}
    `;
  }
  
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length > 2) {
      queryString += `
      AND properties.owner_id = $${queryParams.length}
      `;
    } else {
      queryString += `
      WHERE properties.owner_id = $${queryParams.length}
      `;
    }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    if (queryParams.length > 2) {
      queryString += `
      AND properties.cost_per_night / 100 >= $${queryParams.length}
      `;
    } else {
      queryString += `
      WHERE properties.cost_per_night / 100 >= $${queryParams.length}
      `;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    if (queryParams.length > 2) {
      queryString += `
      AND properties.cost_per_night / 100 <= $${queryParams.length}
      `;
    } else {
      queryString += `
      WHERE properties.cost_per_night / 100 <= $${queryParams.length}
      `;
    }
  }

  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
    HAVING AVG(property_reviews.rating) >= $${queryParams.length}
    `;
  }
  
  queryString += `
  ORDER BY cost_per_night
  LIMIT $1;
  `;
  

  return pool.query(queryString, queryParams)
    .then((response) => {
      // log a successful message with only the number of rows to avoid filling up too much console real estate
      console.log(`Query excuted successfully: returned ${response.rows.length} rows`);
      console.log(queryString, queryParams);
      return response.rows;
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = [property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms];
    
  return pool
    .query(`
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
    `, queryParams)
    .then((response) => {
      console.log(`New row inserted:`, response.rows[0]);
      return response.rows[0];
    })
    .catch((error) => {
      console.log(error.message);
    });
};

exports.addProperty = addProperty;