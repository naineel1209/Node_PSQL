import { config } from 'dotenv';
config();
import pool from '../config/db.config.js';
import { FIND_USER_NAME_OR_EMAIL, UPDATE_REFRESH_TOKEN } from '../query/db.query.js';
import jwt from 'jsonwebtoken';
import { isDate } from 'date-fns';

const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        throw new Error("Access token is missing");
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {

        if (err.message === "jwt expired") {
            console.log('we went inside catch block')
            const decoded = jwt.decode(accessToken);

            const client = await pool.connect();
            console.log('we got stuck here! 1')
            try {
                const { rows } = await client.query(FIND_USER_NAME_OR_EMAIL, [decoded.username, '']);
                console.log('we got stuck here! 2')

                if (rows.length === 0) {
                    throw new Error("User does not exist");
                }

                const user = rows[0];
                const refreshToken = user.refresh_token;

                const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
                console.log('we got stuck here! 3')

                if (!decodedRefreshToken) {
                    throw new Error("Refresh token is invalid");
                }

                const newAccessToken = jwt.sign({ decoded }, process.env.JWT_SECRET, { expiresIn: '15m' });
                const newRefreshToken = jwt.sign({ decoded }, process.env.JWT_SECRET, { expiresIn: '7d' });

                req.user = decoded;

                await client.query(UPDATE_REFRESH_TOKEN, [newRefreshToken, user.user_id]);
                console.log('we got stuck here! 4')
                res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

                next();
            } catch (err) {
                throw new Error(err.message);
            } finally {
                client.release();
            }
        }
    }
};

const handleLoginData = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new Error("Username or password is missing");
    }

    next();
}

const handleRegisterData = async (req, res, next) => {
    const { username, password, email, date_of_birth } = req.body;

    if (!username || !password || !email || !date_of_birth) {
        throw new Error("Some fields are missing");
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }

    if (email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/) === null) {
        throw new Error("Email is not valid");
    }

    if (isDate(new Date(date_of_birth)) === false) {
        throw new Error("Date of birth is not valid");
    } else {
        req.body.date_of_birth = new Date(date_of_birth);
    }

    const client = await pool.connect();
    try {
        const { rows } = await client.query(FIND_USER_NAME_OR_EMAIL, [username, email]);

        if (rows.length > 0) {
            throw new Error("User is already exist");
        }

        next();
    } catch (err) {
        throw new Error(err.message);
    } finally {
        client.release();
    }
};

export {
    handleLoginData,
    handleRegisterData,
    verifyToken
};