const { body, validationResult } = require('express-validator');
var session = require('express-session');

const db = require('../lib/db');

exports.get_feedback = function(req, res) {
	const isAuth = req.oidc.isAuthenticated();

	if(isAuth)
		try {
			const results = db.QueryResult('SELECT * FROM feedback WHERE NOT reviewed');
			res.render('pages/feedback', { is_auth: isAuth, results: results });
		} catch (err) {
			res.render("pages/feedback", { is_auth: isAuth, errors: [db.err_msg] });
		}
	else
		res.render("pages/feedback", { is_auth: isAuth });
};

exports.post_feedback = [
	body('location').trim().isLength({ min: 1 }).withMessage('Location empty.').escape(), // maxlength 128
	body('content').trim().isLength({ min: 1 }).withMessage('Feedback content empty.').escape(), // maxlength 4096
	(req, res) => {
		// check has sent feedback recently

		const errors = validationResult(req);

		if (errors.isEmpty())
			try {
				db.QueryVoid(
					`INSERT INTO feedback (id, time, content, location, reviewed)
						VALUES(DEFAULT, DEFAULT, '${req.body.content}', '${req.body.location}', DEFAULT)`
				).then(() => res.redirect("pages/index")); // replace by success
			} catch (err) {
				res.render("pages/feedback", { s_auth: req.oidc.isAuthenticated(), errors: [db.err_msg] });
			}
		else
			res.render("pages/feedback", { is_auth: req.oidc.isAuthenticated(), errors: errors.array() });
	}
];