const express = require("express");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const path = require("path");
const PORT = process.env.PORT || 5000;

const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.AUTH0_CLIENT_SECRET,
	baseURL: 'https://xtech-42634.herokuapp.com',
	clientID: '1oLhWuzk6bIIDpmsrXIHjPN5FNPIBikW',
	issuerBaseURL: 'https://tight-sun-4633.eu.auth0.com'
};

const app = express();
const router = express.Router();

const feedback_controller = require('./controllers/feedback');
const bodyParser = require('body-parser');

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Tracing.Integrations.Express({ app }),
	],

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
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

router//.get("/", (req, res) => res.render("pages/index"))
	.get('/', (req, res) => {
		res.render("pages/index");
	})
	.get("/account", requiresAuth(), (req, res) => {
		res.send(JSON.stringify(req.oidc.user));
	})
	.get('/feedback', feedback_controller.get_feedback)
	.post('/feedback', feedback_controller.post_feedback)
	.get("/dashboard", requiresAuth(), (req, res) => res.render("pages/dashboard"))
	.get("/db", async (req, res) => {
		try {
			const client = await pool.connect();
			const result = await client.query("SELECT * FROM test_table");
			const results = { results: result ? result.rows : null };
			res.render("pages/db", results);
			client.release();
		} catch (err) {
			console.error(err);
			res.send("Error " + err);
		}
	});

app.use(router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
