const { body, validationResult } = require('express-validator');
const { query, err_msg } = require('../db');

exports.post_feedback = [
	body('location')
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage('Location empty.')
		.escape(),
	body('kitchen')
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage('Kitchen empty.')
		.escape(),
	body('temperature').toBoolean(),
	body('delivery').toBoolean(),
	body('comment')
		.trim()
		.escape(),
	async (req, res) => {
		let errors = [];

		await query(`
			SELECT *
			FROM feedback
			WHERE email = $1 AND time >= (NOW() - INTERVAL '1 hour')
			ORDER BY time DESC
		`,
		[req.oidc.user.email])
			.then(result => {
				if(result.rows.length > 0)
					errors.push("You already sent feedback less than one hour ago, at: " + result.rows[0].time);
			})
			.catch(err => {
				console.error(err.stack);
				errors.push(err.detail);
			});

		if(errors.length === 0) {
			if(!req.body.delivery && !req.body.temperature)
				errors.push("At least one of the proposed issues (temperature or delivery) must be reported.");

			if(errors.length === 0) {
				const validationErrors = validationResult(req);

				if(!validationErrors.isEmpty())
					for (const err in validationErrors.array())
						errors.concat(err.msg);

				if(errors.length === 0)
					query(
						`INSERT INTO feedback(id, time, comment, kitchen, delivery, temperature, email, location)
							VALUES(DEFAULT, DEFAULT, $1, $2, $3, $4, $5, $6)`,
						[
							req.body.comment,
							req.body.kitchen,
							req.body.delivery,
							req.body.temperature,
							req.oidc.user.email,
							req.body.location
						]
					)
						.then(() => res.redirect("/dashboard#feedback")) // add success operation
						.catch(err => {
							console.error(err.stack);
							errors.concat(err.detail);
						});
			}
		}

		res.render(
			"pages/dashboard", { isAuth: req.oidc.isAuthenticated(), user: req.oidc.user, errors: errors }
		);
	}
];