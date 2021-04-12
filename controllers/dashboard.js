exports.get_dashboard = function(req, res) {
	const nickname = req.oidc.user.nickname;

	res.render("pages/dashboard", { nickname : nickname });
};