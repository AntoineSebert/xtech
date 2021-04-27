const db = require('../lib/db');

exports.get_dashboard = async function(req, res) {
	try {
		const kitchens = await db.query("SELECT location FROM kitchens ORDER BY location");
		const feedbacks = await db.query(
			`SELECT location, state,
			(SELECT COUNT(*) from feedback where kitchen = kitchens.location and delivery) as delivery,
			(SELECT COUNT(*) from feedback where kitchen = kitchens.location and temperature) as temperature
			FROM kitchens order by temperature desc, delivery desc limit 50;`
		);

		res.render('pages/dashboard', {
			isAuth: true, user: req.oidc.user, kitchens: kitchens, feedbacks: feedbacks.rows
		});
	} catch (err) {
		console.log(err.stack);
		res.render("pages/dashboard", { isAuth: true, user: req.oidc.user, errors: [db.err_msg] });
	}
};