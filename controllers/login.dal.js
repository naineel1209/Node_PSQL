class LoginDAL {
    async updateRefreshToken(email, password) {
        const sql = `
            UPDATE users
                SET refresh_token = $1
                WHERE 
                    email = $2 
                AND 
                    password_hash = $3
                returning *;
            `;
        const parameters = [refreshToken, email, password];
        const queryResult = await client.query(sql, parameters);
        return queryResult.rows[0];
    }
}



export default new LoginDAL();