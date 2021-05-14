const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

module.exports = {
	query: (text, params) => pool.query(text, params),
	pool: () => pool,
	err_msg: "An error occurred while retrieving the data from the database",
};