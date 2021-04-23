const db = require('../lib/db');

exports.get_dashboard = function(req, res) {
	db.pool
		.query("SELECT location FROM kitchens ORDER BY location")
		.then(kitchens => res.render("pages/dashboard", { isAuth: true, user: req.oidc.user, kitchens: kitchens }))
		.catch(err => {
			console.error(err.stack);
			res.render("pages/dashboard", { isAuth: true, user: req.oidc.user, errors: [db.err_msg] });
		});
};