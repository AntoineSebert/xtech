const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

exports.QueryVoid = async function(_query) {
	const client = await pool.connect();
	const result = await client.query("SELECT * FROM test_table");

	client.release();
};