const { query, pool } = require('../db');
const { body, validationResult } = require('express-validator');

module.exports = {
	getRecipes: [
		body('kitchen').trim().isLength({ min: 1, max: 255 }).escape(),
		async (req, res) => {
			const validationErrors = validationResult(req);

			if(validationErrors.isEmpty())
				query(`SELECT name, ingredient, quantity
                       FROM recipes
                                INNER JOIN recipe_entries recipe ON recipes.name = recipe.recipe_name
                       WHERE kitchen = $1 group by name, ingredient, quantity`, [req.body.kitchen])
					.then(result => res.json({'recipes': result.rows}))
					.catch(err => {
						console.error(err.stack);
						res.status(400).json({'errors': [err.detail]});
					});
			else
				res.status(400).json({'errors': validationErrors.array()});
		}
	],
	addRecipe: [
		body('name').trim().isLength({ min: 1, max: 255 }).escape(),
		body('kitchen').trim().isLength({ min: 1, max: 255 }).escape(),
		body('recipe').custom(value => value.forEach((key, val) =>
			key.isAlpha().trim().isLength({ min: 1, max: 64 }).toLowerCase().escape()
			&& (val.isInt({ gt: 0}) || val.isFloat({ gt: 0.0}))
		)),
		async (req, res) => {
			const validationErrors = validationResult(req);

			if(validationErrors.isEmpty()) {
				const client = await pool.connect();

				try {
					await client.query('BEGIN');

					const name = req.body.name.toLowerCase();

					await client.query(
						`INSERT INTO recipes (kitchen, name) VALUES ('$1', '$2')`,
						[name, req.body.kitchen]
					);

					await Promise.all(req.body.recipe.map(e => client.query(
						`INSERT INTO recipe_entries (recipe_name, quantity, ingredient) VALUES ('$1', $2, '$3')`,
						[name, e[1], e[0]]
					)));

					await client.query('COMMIT');
					res.status(200);
				} catch (e) {
					await client.query('ROLLBACK');
					res.status(400).json({'errors': [e.detail]});
				} finally {
					client.release();
				}
			}
			else
				res.status(400).json({'errors': validationErrors.array()});
		}
	],
	deleteRecipes: [
		body('names').isArray().custom(value => value.forEach(
			e => e.trim().isLength({ min: 1, max: 255 }).escape()
		)),
		async (req, res) => {
			const validationErrors = validationResult(req);
			const normalized = req.body.names.map(e => e.toLowerCase());

			if(validationErrors.isEmpty())
				await query(`DELETE FROM recipes WHERE name IN ($1)`, [normalized.join('\',\'')])
					.then(result => res.json({'deleted': result.rowCount}))
					.catch(err => {
						console.error(err.stack);
						res.status(400).json({'errors': err.detail});
					});
			else
				res.status(400).json({'errors': validationErrors.array()});
		}
	],
};