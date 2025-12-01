const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const next = require("next");
const { v4: uuidv4 } = require("uuid");

const { getPersonalizedResponse } = require("./chatbot");
const {
	getOrCreateUser,
	getUserProfile,
	updateUserProfile,
	getConversationHistory,
	saveFeedback,
	getUserTopics,
	getAnalytics,
	clearOldCache,
} = require("./db");
const { getAllPersonalities } = require("./personalities");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "./src" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();

	server.use(express.json());
	server.use(cookieParser());
	server.use(
		session({
			secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
			resave: false,
			saveUninitialized: true,
			cookie: {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			},
		})
	);

	server.use((req, res, next) => {
		if (!req.session.id) {
			req.session.id = uuidv4();
		}
		next();
	});

	server.post("/api/chat", async (req, res) => {
		try {
			const { message, personality } = req.body;
			const sessionId = req.session.id;

			const user = getOrCreateUser(sessionId);

			const result = await getPersonalizedResponse(user.id, message, {
				personality: personality,
			});

			res.json({
				response: result.response,
				cached: result.cached,
				personality: result.personality,
				sentiment: result.sentiment,
				topics: result.topics,
			});
		} catch (error) {
			console.error("Error in /api/chat:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.get("/api/profile", async (req, res) => {
		try {
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);
			const profile = getUserProfile(user.id);

			res.json({
				profile: {
					userId: profile.id,
					personality: profile.personality || "kanye",
					tone_preference: profile.tone_preference || "balanced",
					verbosity: profile.verbosity || "medium",
					favorite_topics: profile.favorite_topics,
					response_style: profile.response_style || "creative",
				},
			});
		} catch (error) {
			console.error("Error in /api/profile:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.post("/api/profile", async (req, res) => {
		try {
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);

			updateUserProfile(user.id, req.body);

			const profile = getUserProfile(user.id);
			res.json({ success: true, profile });
		} catch (error) {
			console.error("Error in /api/profile:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.get("/api/personalities", async (req, res) => {
		try {
			const personalities = getAllPersonalities();
			res.json({ personalities });
		} catch (error) {
			console.error("Error in /api/personalities:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.get("/api/history", async (req, res) => {
		try {
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);
			const limit = parseInt(req.query.limit) || 20;

			const history = getConversationHistory(user.id, limit);

			res.json({ history });
		} catch (error) {
			console.error("Error in /api/history:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.post("/api/feedback", async (req, res) => {
		try {
			const { conversationId, rating, comment } = req.body;
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);

			saveFeedback(conversationId, user.id, rating, comment);

			res.json({ success: true });
		} catch (error) {
			console.error("Error in /api/feedback:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.get("/api/topics", async (req, res) => {
		try {
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);

			const topics = getUserTopics(user.id, 10);

			res.json({ topics });
		} catch (error) {
			console.error("Error in /api/topics:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	server.get("/api/analytics", async (req, res) => {
		try {
			const sessionId = req.session.id;
			const user = getOrCreateUser(sessionId);

			const analytics = getAnalytics(user.id, 100);

			res.json({ analytics });
		} catch (error) {
			console.error("Error in /api/analytics:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

	setInterval(() => {
		clearOldCache(7);
	}, 24 * 60 * 60 * 1000);

	server.all("*", (req, res) => {
		return handle(req, res);
	});

	const port = process.env.PORT || 3000;
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`);
	});
});

/**
 * We import the necessary modules: Express, Next.js, and our chatbot function.We set up Next.js, telling it where our source files are located.
 * We create an Express server and add middleware to parse JSON requests.
 * We create a POST route for /api/chat that calls our getKanyeResponse function and sends back the response.
 * We set up a catch-all route that hands off any unhandled requests to Next.js.
 * Finally, we start the server on port 3000 (or a port specified by an environment variable).
 */
