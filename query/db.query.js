export const FIND_USER_NAME_OR_EMAIL = 'SELECT * FROM users WHERE username = $1 OR email = $2';

export const CREATE_USER = 'INSERT INTO users (username, password_hash, email, date_of_birth) VALUES ($1, $2, $3, $4) RETURNING *';

export const UPDATE_REFRESH_TOKEN = 'UPDATE users SET refresh_token = $1 WHERE user_id = $2 RETURNING *';

export const FIND_USER_BY_ID = 'SELECT * FROM users WHERE user_id = $1';