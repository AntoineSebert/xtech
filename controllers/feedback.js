const { body, validationResult } = require('express-validator');
var session = require('express-session');

const db = require('../lib/db');

exports.get_feedback = function(req, res) {
	res.render("pages/feedback", {is_auth: req.oidc.isAuthenticated()});
};

exports.post_feedback = [
	body('location').trim(),
	body('feedback').trim().isLength({ min: 1 }).withMessage('Feedback empty.').escape(), // maxlength 4096
	(req, res) => {
		// check has sent feedback recently

		const errors = validationResult(req);

		if (errors.isEmpty()) {
			try {
				db.QueryVoid("INSERT INTO feedback VALUES(gen_random_uuid(), now(), ${req.body.content})")
					.then(() => res.render("pages/index")); // replace by success
			} catch (err) {
				console.error(err);
				// replace by status code 5xx
				res.render("pages/feedback", { s_auth: req.oidc.isAuthenticated(), errors: [{msg: err}] });
			}
		} else {
			// There are errors. Render form again with sanitized values/errors messages.
			// Error messages can be returned in an array using `errors.array()`.
			console.error(errors.array());
			res.render("pages/feedback", { is_auth: req.oidc.isAuthenticated(), errors: errors.array() });
		}
	}
];