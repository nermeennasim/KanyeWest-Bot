const Database = require("better-sqlite3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const db = new Database(path.join(__dirname, "chatbot.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    personality TEXT DEFAULT 'kanye',
    tone_preference TEXT DEFAULT 'balanced',
    verbosity TEXT DEFAULT 'medium',
    favorite_topics TEXT,
    response_style TEXT DEFAULT 'creative',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    role TEXT,
    content TEXT,
    personality TEXT,
    sentiment_score REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    user_id TEXT,
    rating INTEGER,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS topic_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    topic TEXT,
    frequency INTEGER DEFAULT 1,
    last_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS response_cache (
    id TEXT PRIMARY KEY,
    message_hash TEXT UNIQUE,
    personality TEXT,
    response TEXT,
    hit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT,
    event_data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
  CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
  CREATE INDEX IF NOT EXISTS idx_topic_tracking_user ON topic_tracking(user_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
`);

function getOrCreateUser(sessionId) {
	const stmt = db.prepare("SELECT * FROM users WHERE session_id = ?");
	let user = stmt.get(sessionId);

	if (!user) {
		const userId = uuidv4();
		const insertUser = db.prepare(
			"INSERT INTO users (id, session_id) VALUES (?, ?)"
		);
		insertUser.run(userId, sessionId);

		const insertProfile = db.prepare(
			"INSERT INTO user_profiles (user_id) VALUES (?)"
		);
		insertProfile.run(userId);

		user = { id: userId, session_id: sessionId };
	} else {
		const updateStmt = db.prepare(
			"UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?"
		);
		updateStmt.run(user.id);
	}

	return user;
}

function getUserProfile(userId) {
	const stmt = db.prepare(`
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `);
	return stmt.get(userId);
}

function updateUserProfile(userId, profile) {
	const { personality, tone_preference, verbosity, favorite_topics, response_style } =
		profile;
	const stmt = db.prepare(`
    UPDATE user_profiles
    SET personality = COALESCE(?, personality),
        tone_preference = COALESCE(?, tone_preference),
        verbosity = COALESCE(?, verbosity),
        favorite_topics = COALESCE(?, favorite_topics),
        response_style = COALESCE(?, response_style)
    WHERE user_id = ?
  `);
	return stmt.run(
		personality,
		tone_preference,
		verbosity,
		favorite_topics,
		response_style,
		userId
	);
}

function saveConversation(userId, role, content, personality, sentimentScore = 0) {
	const id = uuidv4();
	const stmt = db.prepare(`
    INSERT INTO conversations (id, user_id, role, content, personality, sentiment_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
	stmt.run(id, userId, role, content, personality, sentimentScore);
	return id;
}

function getConversationHistory(userId, limit = 10) {
	const stmt = db.prepare(`
    SELECT * FROM conversations
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);
	return stmt.all(userId, limit).reverse();
}

function getContextualHistory(userId, limit = 6) {
	const history = getConversationHistory(userId, limit);
	return history.map((msg) => ({
		role: msg.role,
		content: msg.content,
	}));
}

function saveFeedback(conversationId, userId, rating, comment = null) {
	const id = uuidv4();
	const stmt = db.prepare(`
    INSERT INTO feedback (id, conversation_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `);
	return stmt.run(id, conversationId, userId, rating, comment);
}

function trackTopic(userId, topic) {
	const existing = db
		.prepare("SELECT * FROM topic_tracking WHERE user_id = ? AND topic = ?")
		.get(userId, topic);

	if (existing) {
		db.prepare(
			"UPDATE topic_tracking SET frequency = frequency + 1, last_mentioned = CURRENT_TIMESTAMP WHERE id = ?"
		).run(existing.id);
	} else {
		const id = uuidv4();
		db.prepare(
			"INSERT INTO topic_tracking (id, user_id, topic) VALUES (?, ?, ?)"
		).run(id, userId, topic);
	}
}

function getUserTopics(userId, limit = 5) {
	const stmt = db.prepare(`
    SELECT topic, frequency
    FROM topic_tracking
    WHERE user_id = ?
    ORDER BY frequency DESC, last_mentioned DESC
    LIMIT ?
  `);
	return stmt.all(userId, limit);
}

function getCachedResponse(messageHash, personality) {
	const stmt = db.prepare(`
    SELECT * FROM response_cache
    WHERE message_hash = ? AND personality = ?
  `);
	const cached = stmt.get(messageHash, personality);

	if (cached) {
		db.prepare(
			"UPDATE response_cache SET hit_count = hit_count + 1, last_used = CURRENT_TIMESTAMP WHERE id = ?"
		).run(cached.id);
		return cached.response;
	}

	return null;
}

function cacheResponse(messageHash, personality, response) {
	const id = uuidv4();
	try {
		const stmt = db.prepare(`
      INSERT INTO response_cache (id, message_hash, personality, response)
      VALUES (?, ?, ?, ?)
    `);
		stmt.run(id, messageHash, personality, response);
	} catch (error) {
		console.error("Cache error:", error);
	}
}

function logAnalytics(userId, eventType, eventData = {}) {
	const id = uuidv4();
	const stmt = db.prepare(`
    INSERT INTO analytics (id, user_id, event_type, event_data)
    VALUES (?, ?, ?, ?)
  `);
	stmt.run(id, userId, eventType, JSON.stringify(eventData));
}

function getAnalytics(userId, limit = 100) {
	const stmt = db.prepare(`
    SELECT * FROM analytics
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);
	return stmt.all(userId, limit);
}

function clearOldCache(daysOld = 7) {
	const stmt = db.prepare(`
    DELETE FROM response_cache
    WHERE last_used < datetime('now', '-' || ? || ' days')
    AND hit_count < 2
  `);
	return stmt.run(daysOld);
}

module.exports = {
	db,
	getOrCreateUser,
	getUserProfile,
	updateUserProfile,
	saveConversation,
	getConversationHistory,
	getContextualHistory,
	saveFeedback,
	trackTopic,
	getUserTopics,
	getCachedResponse,
	cacheResponse,
	logAnalytics,
	getAnalytics,
	clearOldCache,
};
