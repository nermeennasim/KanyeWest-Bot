const axios = require("axios");
const crypto = require("crypto");
const Sentiment = require("sentiment");
const natural = require("natural");
require("dotenv").config();

const {
	getUserProfile,
	saveConversation,
	getContextualHistory,
	trackTopic,
	getUserTopics,
	getCachedResponse,
	cacheResponse,
	logAnalytics,
} = require("./db");
const { getPersonality, buildSystemPrompt } = require("./personalities");

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

function analyzeSentiment(text) {
	const result = sentiment.analyze(text);
	return {
		score: result.score,
		comparative: result.comparative,
		sentiment: result.comparative > 0.5 ? "positive" : result.comparative < -0.5 ? "negative" : "neutral",
	};
}

function extractTopics(text) {
	const tfidf = new TfIdf();
	tfidf.addDocument(text.toLowerCase());

	const topics = [];
	tfidf.listTerms(0).forEach((item) => {
		if (item.tfidf > 0.5 && item.term.length > 3) {
			topics.push(item.term);
		}
	});

	return topics.slice(0, 3);
}

function generateMessageHash(message, personality) {
	return crypto
		.createHash("md5")
		.update(message.toLowerCase().trim() + personality)
		.digest("hex");
}

async function getPersonalizedResponse(userId, userMessage, options = {}) {
	const apiKey = process.env.OPENAI_API_KEY;

	try {
		const userProfile = getUserProfile(userId);
		const personalityId = options.personality || userProfile?.personality || "kanye";
		const personality = getPersonality(personalityId);

		const sentimentAnalysis = analyzeSentiment(userMessage);

		const messageHash = generateMessageHash(userMessage, personalityId);
		const cached = getCachedResponse(messageHash, personalityId);

		if (cached && !options.noCache) {
			logAnalytics(userId, "cache_hit", { personality: personalityId });
			return {
				response: cached,
				cached: true,
				personality: personalityId,
				sentiment: sentimentAnalysis,
			};
		}

		const topics = extractTopics(userMessage);
		topics.forEach((topic) => trackTopic(userId, topic));

		const userTopics = getUserTopics(userId, 5);

		const conversationHistory = getContextualHistory(userId, 6);

		const systemPrompt = buildSystemPrompt(personality, userProfile, userTopics);

		const messages = [
			{ role: "system", content: systemPrompt },
			...conversationHistory,
			{ role: "user", content: userMessage },
		];

		let modelToUse = "gpt-4";
		if (options.model) {
			modelToUse = options.model;
		} else if (userProfile?.response_style === "quick") {
			modelToUse = "gpt-3.5-turbo";
		}

		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: modelToUse,
				messages: messages,
				temperature: options.temperature || 0.8,
				max_tokens: options.maxTokens || 500,
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
			}
		);

		const botResponse =
			response.data.choices[0]?.message?.content || "No response from bot";

		saveConversation(
			userId,
			"user",
			userMessage,
			personalityId,
			sentimentAnalysis.comparative
		);
		saveConversation(userId, "assistant", botResponse, personalityId, 0);

		cacheResponse(messageHash, personalityId, botResponse);

		logAnalytics(userId, "message_sent", {
			personality: personalityId,
			sentiment: sentimentAnalysis.sentiment,
			topics: topics,
		});

		return {
			response: botResponse,
			cached: false,
			personality: personalityId,
			sentiment: sentimentAnalysis,
			topics: topics,
		};
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}

async function getKanyeResponse(userMessage) {
	try {
		const result = await getPersonalizedResponse("default", userMessage, {
			personality: "kanye",
		});
		return result.response;
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}

module.exports = {
	getKanyeResponse,
	getPersonalizedResponse,
	analyzeSentiment,
	extractTopics,
};
