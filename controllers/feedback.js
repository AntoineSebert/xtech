const { body, validationResult } = require('express-validator');
const db = require('../lib/db');

exports.post_feedback = [
	body('location')
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage('Location empty.')
		.escape(),
	body('kitchen')
		.trim()
		.isLength({ min: 1, max: 255 }) // isIn(kitchens)
		.withMessage('Kitchen empty.')
		.escape(),
	body('temperature'),
	body('delivery'),
	body('comment')
		.trim()
		.escape(),
	(req, res) => {
		// check has sent feedback recently
		// get last feedback sent by user, get time, check if less than 10min

		const errors = validationResult(req);

		//check if at least one is checkbox is ticked

		if (errors.isEmpty())
			db.pool
				.query(`
					INSERT INTO feedback(id, time, comment, kitchen, delivery, temperature, email, location)
					VALUES(
						DEFAULT,
						DEFAULT,
					    '${req.body.comment}',
				        '${req.body.kitchen}',
				        '${typeof req.body.delivery != 'undefined' && req.body.delivery}',
					    '${typeof req.body.temperature != 'undefined' && req.body.temperature}',
					    '${req.oidc.user.email}',
					    '${req.body.location}'
					)
				`)
				.then(() => res.redirect("/dashboard#feedback")) // add success operation
				.catch(err => {
					console.error(err.stack);
					// check view
					res.render(
						"pages/dashboard",
						{
							isAuth: req.oidc.isAuthenticated(),
							user: req.oidc.user,
							kitchens: kitchens,
							errors: [{ msg : db.err_msg}]
						}
					);
				});
		else {
			console.error(errors.array());
			// check view
			res.render(
				"pages/dashboard",
				{ isAuth: req.oidc.isAuthenticated(), user: req.oidc.user, kitchens: kitchens, errors: errors.array() }
			);
		}
	}
];