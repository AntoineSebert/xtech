exports.get_dashboard = function(req, res) {
	res.render("pages/dashboard", { isAuth: req.oidc.isAuthenticated(), nickname: req.oidc.user.nickname });
};