const { query, connect } = require('../db');
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
		body('recipe_name').trim().isLength({ min: 1, max: 255 }).escape(),
		body('kitchen').trim().isLength({ min: 1, max: 255 }).escape(),
		/*
		body('recipe').custom(value => value.forEach((key, val) =>
			key.isAlpha().trim().isLength({ min: 1, max: 64 }).toLowerCase().escape()
			&& (val.isInt({ gt: 0}) || val.isFloat({ gt: 0.0}))
		)),
		 */
		async (req, res) => {
			const validationErrors = validationResult(req);

			if(validationErrors.isEmpty()) {
				const client = await connect();

				try {
					await client.query('BEGIN');

					const name = req.body.recipe_name; // to lower case

					await client.query(
						`INSERT INTO recipes (kitchen, name) VALUES ($1, $2)`,
						[req.body.kitchen, name]
					);

					await Promise.all(req.body.recipe.map(e => client.query(
						`INSERT INTO recipe_entries (recipe_name, quantity, ingredient) VALUES ($1, $2, $3)`,
						[name, e.quantity, e.name]
					)));

					await client.query('COMMIT');
					res.redirect("/dashboard#recipe");
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