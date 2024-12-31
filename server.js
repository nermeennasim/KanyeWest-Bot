const express = require("express");
const next = require("next");
const { getKanyeResponse } = require("./chatbot");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "./src" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();

	server.use(express.json());

	server.post("/api/chat", async (req, res) => {
		try {
			const { message } = req.body;
			const response = await getKanyeResponse(message);
			res.json({ response });
		} catch (error) {
			console.error("Error in /api/chat:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});

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
