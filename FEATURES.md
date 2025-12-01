# Personalized AI Chatbot - Features Guide

## Overview

This Next.js chatbot application has been enhanced with robust personalized AI model use cases, transforming it from a simple Kanye West chatbot into a sophisticated, multi-personality AI assistant with advanced personalization capabilities.

---

## Key Features

### 1. Multiple AI Personalities

Choose from 8 distinct AI personalities, each with unique traits and communication styles:

- **Kanye West**: Bold, passionate, and creative rapper/producer
- **Life Coach**: Energetic motivational coach focused on personal growth
- **Creative Partner**: Imaginative collaborator for brainstorming
- **Wise Philosopher**: Thoughtful thinker exploring deep questions
- **Stand-up Comedian**: Witty and humorous conversationalist
- **Business Strategist**: Analytical problem-solver and strategist
- **Master Storyteller**: Engaging narrator who shares wisdom through stories
- **Curious Scientist**: Rational researcher who loves exploring how things work

**How to Use:**
- Click on the personality name in the header to switch personalities instantly
- Your selected personality is saved to your profile automatically

### 2. User Profile System

Each user gets a persistent profile that stores:
- Preferred AI personality
- Conversation style preferences
- Tone preferences (casual, balanced, professional, enthusiastic)
- Response length (brief, medium, detailed)
- Response style (creative, direct, storytelling, quick)
- Conversation history

**How to Access:**
- Click the settings icon (⚙️) in the top right corner
- Customize your preferences in the Settings page

### 3. Context-Aware Responses

The AI remembers your conversation history:
- Maintains context across messages within a session
- References previous messages for coherent conversations
- Adapts responses based on conversation flow
- Stores up to the last 6 messages for context

**Benefits:**
- More natural, flowing conversations
- No need to repeat information
- Better understanding of complex topics

### 4. Sentiment Analysis & Mood Detection

Real-time analysis of your messages:
- Detects sentiment (positive, negative, neutral)
- Calculates sentiment scores
- Adapts AI responses based on detected mood
- Displays sentiment information in chat

**Use Cases:**
- AI can be more supportive when detecting negative sentiment
- Matches your energy level in conversations
- Provides appropriate responses based on emotional context

### 5. Topic Tracking & Interest Learning

The system learns your interests over time:
- Automatically extracts topics from conversations
- Tracks frequency of topic mentions
- Stores your top interests
- Personalizes responses based on your interests

**How to View:**
- Visit Settings page to see your tracked topics
- Topics appear with frequency counts
- AI references your interests in relevant conversations

### 6. Response Caching System

Intelligent caching for faster responses:
- Caches common questions and responses
- Reduces API calls and costs
- Provides instant responses for cached queries
- Automatically clears old cache entries (7+ days)

**Benefits:**
- Faster response times
- Lower API costs
- Indicated with ⚡ icon in chat

### 7. Customizable Conversation Style

Fine-tune how the AI communicates with you:

**Tone Preferences:**
- Casual & Relaxed
- Balanced
- Professional
- Enthusiastic & Energetic

**Response Length:**
- Brief & Concise
- Medium Length
- Detailed & Comprehensive

**Response Style:**
- Creative & Imaginative
- Direct & Straightforward
- Storytelling with Examples
- Quick & Fast Responses

### 8. Session Persistence

Your data persists across sessions:
- SQLite database stores all user data
- Session management with cookies
- Automatic user creation on first visit
- 30-day session lifetime

### 9. Analytics Tracking

Track your usage and engagement:
- Message counts
- Personality usage
- Cache hit rates
- Sentiment trends
- Topic patterns

**Access:**
- Analytics stored per user
- Can be extended to build analytics dashboard

### 10. Real-Time Personality Switching

Switch AI personalities mid-conversation:
- Instant personality changes
- No page reload required
- Different AI responds to same context
- Compare different perspectives on same topic

---

## API Endpoints

### Chat Endpoint
```
POST /api/chat
Body: { message: string, personality?: string }
Response: { response, cached, personality, sentiment, topics }
```

### Profile Endpoints
```
GET /api/profile
Response: { profile: { userId, personality, tone_preference, verbosity, ... } }

POST /api/profile
Body: { personality?, tone_preference?, verbosity?, response_style? }
Response: { success: true, profile }
```

### Personalities List
```
GET /api/personalities
Response: { personalities: Array<Personality> }
```

### Conversation History
```
GET /api/history?limit=20
Response: { history: Array<Message> }
```

### Topic Tracking
```
GET /api/topics
Response: { topics: Array<{ topic, frequency }> }
```

### Analytics
```
GET /api/analytics
Response: { analytics: Array<AnalyticsEvent> }
```

### Feedback
```
POST /api/feedback
Body: { conversationId, rating, comment? }
Response: { success: true }
```

---

## Database Schema

The application uses SQLite with the following tables:

1. **users**: User accounts and sessions
2. **user_profiles**: User preferences and settings
3. **conversations**: Message history with metadata
4. **feedback**: User feedback on responses
5. **topic_tracking**: User interest tracking
6. **response_cache**: Cached AI responses
7. **analytics**: Usage analytics events

---

## Advanced Use Cases

### Use Case 1: Personal Development Coach
1. Select "Life Coach" personality
2. Set tone to "Enthusiastic"
3. Set verbosity to "Detailed"
4. Have ongoing motivational conversations
5. AI learns your goals and references them

### Use Case 2: Creative Brainstorming
1. Select "Creative Partner" personality
2. Set style to "Creative & Imaginative"
3. Set verbosity to "Medium"
4. Brainstorm ideas across multiple sessions
5. AI remembers your previous ideas

### Use Case 3: Learning & Education
1. Select "Curious Scientist" personality
2. Set tone to "Professional"
3. Set style to "Detailed & Comprehensive"
4. Ask complex questions
5. AI provides thorough, educational responses

### Use Case 4: Entertainment & Humor
1. Select "Stand-up Comedian" personality
2. Set tone to "Casual & Relaxed"
3. Set style to "Storytelling with Examples"
4. Have fun, entertaining conversations

### Use Case 5: Business Strategy
1. Select "Business Strategist" personality
2. Set tone to "Professional"
3. Set style to "Direct & Straightforward"
4. Discuss business challenges
5. Get actionable insights

---

## Technical Architecture

### Frontend (Next.js + React)
- `src/pages/index.js`: Main chat interface
- `src/pages/settings.js`: Settings and customization page
- `src/pages/_app.js`: Next.js app wrapper
- `src/styles/globals.css`: Global styles

### Backend (Express.js)
- `server.js`: Express server with API routes
- `chatbot.js`: AI logic, sentiment analysis, personalization
- `personalities.js`: Personality definitions and prompts
- `db.js`: Database utilities and operations

### Data Layer (SQLite)
- `chatbot.db`: SQLite database (auto-created)
- Stores users, profiles, conversations, topics, analytics

---

## Performance Optimizations

1. **Response Caching**: Reduces duplicate API calls
2. **Session Management**: Efficient user tracking
3. **Database Indexing**: Fast query performance
4. **Automatic Cache Cleanup**: Removes old entries
5. **Contextual History Limiting**: Only last 6 messages

---

## Privacy & Data

- All data stored locally in SQLite database
- Session-based authentication
- No external tracking
- User data tied to browser session
- 30-day session expiration

---

## Future Enhancement Ideas

1. Voice input/output
2. Export conversation history
3. Share conversations
4. Multi-language support
5. Custom personality creation
6. Advanced analytics dashboard
7. Conversation templates
8. Integration with external APIs
9. Mobile app version
10. Team/collaborative features

---

## Troubleshooting

### Cache Issues
- Old cache auto-cleans after 7 days
- Restart server to clear all cache

### Session Issues
- Clear browser cookies
- Session expires after 30 days of inactivity

### Database Issues
- Delete `chatbot.db` to reset all data
- Database auto-recreates on next run

### API Errors
- Check OpenAI API key in `.env`
- Verify internet connection
- Check API rate limits

---

## Credits

Enhanced with advanced personalization features including:
- Multi-personality AI system
- Context-aware conversations
- Sentiment analysis (using `sentiment` package)
- Topic extraction (using `natural` NLP)
- Response caching
- User profile management
- Analytics tracking

Built with Next.js, Express, OpenAI GPT-4, and SQLite.
