const { body, validationResult } = require('express-validator');
var session = require('express-session');

const db = require('../lib/db');

exports.get_feedback = function(req, res) {
	const isAuth = req.oidc.isAuthenticated();

	if(isAuth)
		db.pool.connect()
			.then(client => {
				return client
					.query("SELECT * FROM feedback WHERE NOT reviewed ORDER BY time")
					.then(unreviewed => {
						client.release();
						res.render("pages/feedback", { isAuth: isAuth, unreviewed: unreviewed });
					})
					.catch(err => {
						client.release();
						console.log(err.stack);
						res.render("pages/feedback", { isAuth: isAuth, errors: [db.err_msg] });
					});
			});
	else
		db.pool.connect()
			.then(client => {
				return client
					.query("SELECT * FROM locations ORDER BY name")
					.then(locations => {
						client.release();
						res.render("pages/feedback", { isAuth: isAuth, locations: locations });
					})
					.catch(err => {
						client.release();
						console.log(err.stack);
						res.render("pages/feedback", { isAuth: isAuth, errors: [db.err_msg] });
					});
			});
};

exports.post_feedback = [
	body('location')
		.trim()
		.isLength({ min: 1, max: 128 })
		.withMessage('Location empty.')
		.escape(),
	body('content')
		.trim()
		.isLength({ min: 1, max: 4096 })
		.withMessage('Feedback content empty.')
		.escape(),
	(req, res) => {
		// check has sent feedback recently

		const errors = validationResult(req);

		if (errors.isEmpty())
			db.pool.connect()
				.then(client => {
					return client
						.query(`INSERT INTO feedback (id, time, content, location, reviewed)
						VALUES(DEFAULT, DEFAULT, '${req.body.content}', '${req.body.location}', DEFAULT)`)
						.then(() => {
							client.release();
							res.redirect("/");
						})
						.catch(err => {
							client.release();
							console.log(err.stack);
							res.render("pages/feedback", { s_auth: req.oidc.isAuthenticated(), errors: [db.err_msg] });
						});
				}); // replace by email to location ?
		else
			res.render("pages/feedback", { is_auth: req.oidc.isAuthenticated(), errors: errors.array() });
	}
];