const { query } = require('../db');
const { body, validationResult } = require('express-validator');

module.exports = {
	getRecipes: async (req, res) => {
		query(`SELECT * FROM recipes`)
			.then(result => res.json({'recipes': result.rows}))
			.catch(err => {
				console.error(err.stack);
				res.status(400).json({'errors': err.detail});
			});
	},
	addRecipe: [
		body('recipe').custom(value => value.forEach((key, val) =>
			key.isAlpha().trim().isLength({ min: 1, max: 64 }).toLowerCase().escape() && val.isNumeric()
		)),
		async (req, res) => {

		}
	],
	deleteRecipes: [
		body('ids').isArray(),
		body('ids').custom(value => value.forEach(e => e.isUUID(4))),
		async (req, res) => {
			let errors = [];

			const validationErrors = validationResult(req);

			if(!validationErrors.isEmpty())
				errors.concat(validationErrors.array());

			if(errors.length === 0)
				;
			/*
				await query(`DELETE FROM recipes WHERE id IN ($1)`, [req.body.ids.join('\',\'')])
					.then(result => res.json({'deleted': result.rowCount}))
					.catch(err => {
						console.error(err.stack);
						errors.push(err.detail);
						res.status(400).json({'errors': errors});
					});
			 */
			else
				res.status(400).json({'errors': errors});
		}
	],
};