const db = require('../db');

exports.get_dashboard = async function(req, res) {
	try {
		const kitchens = await db.query("SELECT location FROM kitchens ORDER BY location");
		const feedbacks = await db.query(`
			with new_feedback as (SELECT kitchen, delivery, temperature
                                   from feedback
                                   WHERE time >= (NOW() - interval '1 month'))
             SELECT location,
                    (SELECT COUNT(*) from new_feedback where kitchen = kitchens.location and delivery)    as delivery,
                    (SELECT COUNT(*) from new_feedback where kitchen = kitchens.location and temperature) as temperature
             FROM kitchens
             limit 50
		`);
		const ingredients = await db.query("select * from ingredients order by name");
		const ingredientsComments = await db.query(`
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

		res.render('pages/dashboard', {
			isAuth: true,
			user: req.oidc.user,
			kitchens: kitchens,
			feedbacks: feedbacks.rows,
			ingredients: ingredients
		});
	} catch (err) {
		console.log(err.stack);
		res.render("pages/dashboard", { isAuth: true, user: req.oidc.user, errors: [db.err_msg] });
	}
};