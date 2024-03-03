import pool from "../config/db.config.js";
import { CREATE_USER } from "../query/db.query.js";
import bcrypt from "bcrypt";

export default async function registerController(req, res) {
    const dbClient = await pool.connect();

    try {
        const { username, password, email, date_of_birth } = req.body;

        // console.log(username, password, email, date_of_birth);

        //we know that the data is valid and the user is not exist in the database
        //we can insert the data to the database
        //we can send the response to the dbClient

        //connect to the pool - one dbClient
        let password_hash = await bcrypt.hash(password, 10);

        //get the rows for the query
        const { rows } = await dbClient.query(CREATE_USER, [username, password_hash, email, date_of_birth]);

        if (rows.length === 0) {
            throw new Error("Insertion failed");
        }

        res.statusMessage = "Register successfully";
        return res.status(200).json({ message: "Register successfully" });

    } catch (err) {

        throw new Error(err.message);

    } finally {
        dbClient.release();
    }
}