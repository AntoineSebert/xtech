const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

exports.err_msg = "An error occurred while retrieving the data from the database";

exports.pool = pool;

exports.get_client = async function() {
	return await pool.connect();
};

// param query
// return result(ok(res), err(err))