const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

exports.err_msg = "An error occurred while retrieving the data from the database";

exports.get_client = function() {
	return pool.connect();
};

exports.query = (text, params) => pool.query(text, params);
//exports.query = (text) => pool.query(text);