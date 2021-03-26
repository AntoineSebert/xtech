const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

exports.err_msg = "An error occured while retrieving the data from the database";

exports.QueryVoid = async function(_query) {
	// escape query

	const client = await pool.connect();
	await client.query(_query);

	client.release();
};

exports.QueryResult = async function(_query) {
	// escape query

	const client = await pool.connect();
	const result = await client.query(_query);
	const results = { results: result ? result.rows : null };

	client.release();

	return results;
};