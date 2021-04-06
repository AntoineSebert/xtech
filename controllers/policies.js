
exports.get_policies = function(req, res) {
	const isAuth = req.oidc.isAuthenticated();

	if(isAuth)
		res.render("pages/policies", { is_auth: isAuth });
	else {
		res.render("pages/policies", { files: files });
	}
};

exports.post_policies = function(req, res) {
	const isAuth = req.oidc.isAuthenticated();

};

exports.download = function(req, res, next) {
	const path = require('path');
	const filePath = path.join(__dirname, 'files', req.params.file);

	res.download(filePath, function(err) {
		if (!err) return; // file sent
		if (err.status !== 404) return next(err); // non-404 error
		// file for download not found
		res.statusCode = 404;
		res.send('Cant find that file, sorry!');
	});
};
