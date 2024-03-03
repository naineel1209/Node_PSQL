import { Router } from 'express';
import { FIND_USER_BY_ID } from '../query/db.query.js';
import { verifyToken } from '../middlewares/middlewares.js';
import pool from '../config/db.config.js';
const router = Router({ mergeParams: true });

//Path: /private

router.get('/', verifyToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const { rows } = await client.query(FIND_USER_BY_ID, [req.user.user_id]);

        if (rows.length === 0) {
            throw new Error("User does not exist");
        }

        const user = rows[0];
        delete user.password_hash;

        res.statusMessage = "Get user successfully";
        return res.status(200).render('private', {
            user
        })
    } catch (err) {
        throw new Error(err.message);
    } finally {
        client.release();
    }
});

export default router;