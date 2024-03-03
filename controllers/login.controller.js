import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.config.js';
import { UPDATE_REFRESH_TOKEN, FIND_USER_NAME_OR_EMAIL } from '../query/db.query.js';
import loginDal from './login.dal.js';

export default async function loginController(req, res) {
    const { username, password } = req.body;

    const client = await pool.connect();

    try {
        const { rows, rowCount } = await client.query(FIND_USER_NAME_OR_EMAIL, [username, '']);

        if (rowCount === 0) {
            throw new Error("User does not exist");
        }

        const user = rows[0];
        const checkPass = await bcrypt.compare(password, rows[0].password_hash);

        if (!checkPass) {
            throw new Error("Password is not correct");
        }

        delete user.password_hash;

        const accessToken = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '10s' });
        const refreshToken = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await client.query(UPDATE_REFRESH_TOKEN, [refreshToken, user.user_id]);
        await loginDal.updateRefreshToken(refreshToken, user.user_id);
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });


        //experimental code
        req.session.user = user;

        return res.status(200).json({ message: "Login successfully" });

    } catch (error) {
        throw new Error(error.message);
    } finally {
        client.release();
    }
};