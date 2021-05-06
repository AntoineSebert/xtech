const { body, validationResult } = require('express-validator');
const { query } = require('../db');

module.exports = {
	getIngredients: async () => {
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

		console.log("here");

		return ingredients;
	},

	deleteIngredients: [
		async (req, res) => {
			let errors = [];

			const validationErrors = validationResult(req);

			if(!validationErrors.isEmpty())
				errors.concat(validationErrors.array());

			// escape !
			await query(`DELETE FROM ingredients WHERE id IN ('${req.body.ids.join('\',\'')}')`)
				.then(result => {
					console.log(result);

					return res.redirect('dashboard#ingredient');
				})
				.catch(err => {
					console.error(err.stack);
					errors.push(err.stack);
				});

			return res.redirect('dashboard#ingredient');
		}
	],

	addIngredients: async (i) => {
		const result = await query(`
			INSERT INTO ingredients (id, name, energy, protein, water, ash, fat, carbs, cost)
			VALUES (
			        DEFAULT,
			        ${i['name'].toLowerCase()},
			        ${i['energy']},
			        ${i['protein']},
			        ${i['water']},
			        ${i['ash']},
			        ${i['fat']},
			        ${i['carbs']},
			        ${i['cost']}
			)
		`);

		console.log(result);

		return 'Munich';
	},
};