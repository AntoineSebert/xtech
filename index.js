const express = require("express");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const path = require("path");
const PORT = process.env.PORT || 5000;
const { auth, requiresAuth } = require('express-openid-connect');
const bodyParser = require('body-parser');

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.AUTH0_CLIENT_SECRET,
	baseURL: process.env.BASE_URL,
	clientID: '1oLhWuzk6bIIDpmsrXIHjPN5FNPIBikW',
	issuerBaseURL: 'https://tight-sun-4633.eu.auth0.com'
};

const app = express();

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Tracing.Integrations.Express({ app }),
	],

	// We recommend adjusting this value in production, or using tracesSampler for finer control
	tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every transaction/span/breadcrumb is
// attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
app.use(auth(config));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static(path.join(__dirname, "public"), {
	setHeaders: (res, path, stat) => res.set('Permissions-Policy', 'interest-cohort=()')
}))
	.set("views", path.join(__dirname, "views"))
	.set("view engine", "ejs");

const router = express.Router()
	// PUBLIC SECTION
	.get('/', (req, res) =>
		res.render("pages/index", { isAuth: req.oidc.isAuthenticated() }))
	.get("/about-us", (req, res) =>
		res.render("pages/about-us", { isAuth: req.oidc.isAuthenticated() }))
	.get("/contact-us", (req, res) =>
		res.render("pages/contact-us", { isAuth: req.oidc.isAuthenticated(), user: req.oidc.user }))
	.get("/learn-more", (req, res) =>
		res.render("pages/learn-more", { isAuth: req.oidc.isAuthenticated() }))
	.get("/privacy", (req, res) =>
		res.render("pages/privacy", { isAuth: req.oidc.isAuthenticated() }))
	.get("/terms-of-service", (req, res) =>
		res.render("pages/terms-of-service", { isAuth: req.oidc.isAuthenticated() }))
	// PRIVATE SECTION
	.get("/dashboard", requiresAuth(), (req, res) =>
		res.render("pages/dashboard", { isAuth: req.oidc.isAuthenticated(), user: req.oidc.user }));

app.use(router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
