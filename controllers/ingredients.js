const { body, validationResult } = require('express-validator');
const { query } = require('../db');

module.exports = {
	getIngredients: async (req, res) => {
		try {
			const ingredients = await query("select * from ingredients order by name");
			const ingredientsComments = await query(`
			SELECT c.table_schema,c.table_name,c.column_name,pgd.description
			FROM pg_catalog.pg_statio_all_tables as st
			    inner join pg_catalog.pg_description pgd on (pgd.objoid=st.relid)
			    inner join information_schema.columns c on (
			        pgd.objsubid=c.ordinal_position
			            and c.table_schema=st.schemaname
			            and c.table_name=st.relname
			            and c.table_name = 'ingredients')
			`);

			ingredients['units'] = Object.fromEntries(
				ingredientsComments.rows.map(r => [r['column_name'], r['description']])
			);

			res.json({'ingredients': ingredients});
		} catch(err) {
			console.error(err.stack);
			res.status(400).json({'errors': err.detail});
		}
	},
	deleteIngredients: [
		body('ids').isArray(),
		body('ids').custom(value => value.forEach(e => e.isUUID(4))),
		async (req, res) => {
			let errors = [];

			const validationErrors = validationResult(req);

			if(!validationErrors.isEmpty())
				errors.concat(validationErrors.array());

			if(errors.length === 0)
				await query(`DELETE FROM ingredients WHERE id IN ('${req.body.ids.join('\',\'')}')`)
					.then(result => res.json({'deleted': result.rowCount}))
					.catch(err => {
						console.error(err.stack);
						errors.push(err.detail);
						res.status(400).json({'errors': errors});
					});
			else
				res.status(400).json({'errors': errors});
		}
	],
	addIngredient: [
		body('name')
			.isAlpha()
			.trim()
			.isLength({ min: 1, max: 64 })
			.toLowerCase()
			.escape(),
		body(['energy', 'protein', 'water', 'ash', 'fat', 'carbs']).isNumeric(),
		body('cost').isCurrency(),
		async (req, res) => {
			let errors = [];
			const validationErrors = validationResult(req);

			if(!validationErrors.isEmpty())
				errors.concat(validationErrors.array());

			if(errors.length === 0)
				query(
					`INSERT INTO ingredients (id, name, energy, protein, water, ash, fat, carbs, cost)
					VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8)`,
					[
						req.body.name,
						req.body.energy,
						req.body.protein,
						req.body.water,
						req.body.ash,
						req.body.fat,
						req.body.carbs,
						req.body.cost
					]
				)
					.then((result) => res.json({'added': result.rowCount}))
					.catch(err => {
						console.error(err.stack);
						errors.push(err.detail);
						res.status(400).json({'errors': errors});
					});
			else {
				console.error(errors);
				res.status(400).json({'errors': errors});
			}
		}
	],
};