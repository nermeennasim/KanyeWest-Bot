# Personalized AI Chatbot 🤖✨

An advanced AI chatbot application with robust personalization features, multiple AI personalities, and intelligent conversation management. Built with Next.js, Express.js, and OpenAI's GPT-4.

---

## Features

### Core Capabilities
- **8 AI Personalities**: Kanye West, Life Coach, Creative Partner, Philosopher, Comedian, Strategist, Storyteller, Scientist
- **Context-Aware Conversations**: Remembers conversation history for coherent, flowing dialogue
- **Sentiment Analysis**: Detects mood and adapts responses accordingly
- **Topic Tracking**: Learns your interests over time and personalizes responses
- **User Profiles**: Persistent preferences for tone, verbosity, and style
- **Response Caching**: Faster responses and reduced API costs
- **Session Persistence**: Your data saves across visits
- **Real-Time Personality Switching**: Change AI personalities mid-conversation
- **Advanced Settings**: Customize every aspect of your AI experience
- **Analytics Tracking**: Monitor usage patterns and engagement

See [FEATURES.md](FEATURES.md) for detailed documentation.

---

## Prerequisites
Ensure you have the following installed on your machine:
1. **Node.js** (v16 or later)
2. **npm** (v8 or later)
3. OpenAI API Key. You can generate one from the [OpenAI website](https://platform.openai.com/signup/).

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nermeennasim/KanyeWest-Bot.git
   cd KanyeWest-Bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create .env File**

   In the project root, create a `.env` file with the following content:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_random_secret_key_here
   PORT=3000
   ```

4. **Start the Application**

   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm run build
   npm start
   ```

5. **Access the Application**

   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Quick Start Guide

1. **Choose Your AI Personality**
   - Click on the personality name in the header
   - Select from 8 different AI personalities
   - Each has unique traits and communication styles

2. **Customize Your Experience**
   - Click the settings icon (⚙️) in the top right
   - Adjust tone, verbosity, and response style
   - Your preferences are automatically saved

3. **Start Chatting**
   - Type your message in the input field
   - AI responds with context awareness
   - Conversation history is maintained

4. **Explore Features**
   - Switch personalities mid-conversation
   - View your tracked topics in Settings
   - Notice cached responses (⚡ icon)
   - See sentiment analysis in real-time

---

## Project Structure

```
KanyeWest-Bot/
├── server.js              # Express server with API routes
├── chatbot.js            # AI logic, sentiment analysis, personalization
├── personalities.js      # AI personality definitions
├── db.js                 # Database utilities (SQLite)
├── package.json          # Dependencies and scripts
├── src/
│   ├── pages/
│   │   ├── index.js      # Main chat interface
│   │   ├── settings.js   # Settings page
│   │   └── _app.js       # Next.js app wrapper
│   └── styles/
│       └── globals.css   # Global styles
├── chatbot.db            # SQLite database (auto-created)
├── README.md             # This file
└── FEATURES.md           # Detailed feature documentation
```

---

## Technologies Used

- **Frontend**: Next.js 15, React 19
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4 API
- **Database**: SQLite (better-sqlite3)
- **NLP**: Natural (topic extraction), Sentiment (mood detection)
- **Session Management**: express-session, cookie-parser
- **Utilities**: axios, uuid, dotenv

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Recommended |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

---

## API Documentation

See [FEATURES.md](FEATURES.md) for complete API endpoint documentation.

### Key Endpoints:
- `POST /api/chat` - Send messages and get AI responses
- `GET/POST /api/profile` - Manage user profiles
- `GET /api/personalities` - List all AI personalities
- `GET /api/history` - Retrieve conversation history
- `GET /api/topics` - View tracked topics
- `POST /api/feedback` - Submit response feedback
- `GET /api/analytics` - Access analytics data

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

ISC

---

## Support

For issues, questions, or feature requests, please open an issue on GitHub.


