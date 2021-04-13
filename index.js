const express = require("express");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const path = require("path");
const PORT = process.env.PORT || 5000;

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.AUTH0_CLIENT_SECRET,
	baseURL: process.env.BASE_URL,
	clientID: '1oLhWuzk6bIIDpmsrXIHjPN5FNPIBikW',
	issuerBaseURL: 'https://tight-sun-4633.eu.auth0.com'
};

const app = express();
const router = express.Router();

const feedback_controller = require('./controllers/feedback');
const policies_controller = require('./controllers/policies');
const dashboard_controller = require('./controllers/dashboard');
const bodyParser = require('body-parser');

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
app.use(express.static(path.join(__dirname, "public")))
	.set("views", path.join(__dirname, "views"))
	.set("view engine", "ejs");

router
	.get('/', (req, res) => res.render("pages/index"))
	.get("/account", requiresAuth(), (req, res) => {
		res.send(JSON.stringify(req.oidc.user));
	})
	.get('/feedback', feedback_controller.get_feedback)
	.post('/feedback', feedback_controller.post_feedback)
	.get('/post_feedback', (req, res) => res.render("pages/post-feedback"))
	.get('/policies', policies_controller.get_policies)
	.get('/policies/:file(*)', policies_controller.download)
	.post('/policies', policies_controller.post_policies)
	.get("/dashboard", requiresAuth(), dashboard_controller.get_dashboard);

app.use(router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
