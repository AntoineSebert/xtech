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
	//check if at least one is checkbox is ticked
	body('temperature'),
	body('delivery'),
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
					errors.push(
						{ msg : "You already sent feedback less than one hour ago, at: " + result.rows[0].time}
					);
			})
			.catch(err => {
				console.error(err.stack);
				errors.push(err.detail);
			});

		const validationErrors = validationResult(req);

		if(!validationErrors.isEmpty())
			errors.concat(validationErrors.array());

		if(errors.length === 0)
			query(
				`INSERT INTO feedback(id, time, comment, kitchen, delivery, temperature, email, location)
				VALUES(
					DEFAULT,
					DEFAULT,
				    $1,
			        $2,
			        $3,
				    $4,
				    $5,
				    $6
				)`,
				[
					req.body.comment,
					req.body.kitchen,
					typeof req.body.delivery != 'undefined' && req.body.delivery,
					typeof req.body.temperature != 'undefined' && req.body.temperature,
					req.oidc.user.email,
					req.body.location
				]
			)
				.then(() => res.redirect("/dashboard#feedback")) // add success operation
				.catch(err => {
					console.error(err.stack);
					res.render(
						"pages/dashboard",
						{
							isAuth: req.oidc.isAuthenticated(),
							user: req.oidc.user,
							errors: [{ msg : err_msg}]
						}
					);
				});
		else
			res.render(
				"pages/dashboard",
				{ isAuth: req.oidc.isAuthenticated(), user: req.oidc.user, errors: errors }
			);
	}
];