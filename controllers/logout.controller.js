import pool from "../config/db.config.js";
import { UPDATE_REFRESH_TOKEN } from "../query/db.query.js";

export default async function logoutController(req, res) {
    const client = await pool.connect();
    console.log(req.user);
    try {
        const { rows } = await client.query(UPDATE_REFRESH_TOKEN, [null, req.user.user_id]);

        res.clearCookie('accessToken');

        res.statusMessage = "Logout successfully";
        return res.status(200).send({ message: "Logout successfully" })

    } catch (err) {
        throw new Error(err.message);
    } finally {
        client.release();
    }
}