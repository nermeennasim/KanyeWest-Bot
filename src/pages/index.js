import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home() {
	const router = useRouter();
	const [userInput, setUserInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [typing, setTyping] = useState(false);
	const [currentPersonality, setCurrentPersonality] = useState(null);
	const [personalities, setPersonalities] = useState([]);
	const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);
	const chatWindowRef = useRef(null);

	useEffect(() => {
		loadInitialData();
	}, []);

	useEffect(() => {
		if (chatWindowRef.current) {
			chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
		}
	}, [messages]);

	const loadInitialData = async () => {
		try {
			const [profileRes, personalitiesRes] = await Promise.all([
				axios.get("/api/profile"),
				axios.get("/api/personalities"),
			]);

			setPersonalities(personalitiesRes.data.personalities);
			const userPersonality = profileRes.data.profile.personality || "kanye";
			const personality = personalitiesRes.data.personalities.find(
				(p) => p.id === userPersonality
			);
			setCurrentPersonality(personality);
		} catch (error) {
			console.error("Error loading data:", error);
		}
	};

	const handleChange = (event) => {
		setUserInput(event.target.value);
	};

	const handlePersonalityChange = (personality) => {
		setCurrentPersonality(personality);
		setShowPersonalityPicker(false);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!userInput.trim()) return;

		const newMessage = {
			user: true,
			text: userInput,
			timestamp: new Date().toISOString(),
		};
		setMessages([...messages, newMessage, { user: false, text: "loading" }]);
		setTyping(true);

		try {
			const response = await axios.post("/api/chat", {
				message: userInput,
				personality: currentPersonality?.id || "kanye",
			});

			const botResponse = {
				user: false,
				text: response.data.response || "No response from bot",
				timestamp: new Date().toISOString(),
				cached: response.data.cached,
				sentiment: response.data.sentiment,
				topics: response.data.topics,
				personality: currentPersonality,
			};
			setMessages([...messages, newMessage, botResponse]);
		} catch (error) {
			console.error(error);
			const botResponse = {
				user: false,
				text: "Oops! Something went wrong.",
				timestamp: new Date().toISOString(),
			};
			setMessages([...messages, newMessage, botResponse]);
		} finally {
			setTyping(false);
			setUserInput("");
		}
	};

	return (
		<>
			<Head>
				<title>
					{currentPersonality?.name || "AI"} Chatbot - Personalized AI
				</title>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
				/>
			</Head>
			<div className="chat-container">
				<div className="header">
					<div className="header-left">
						<button
							className="personality-picker-btn"
							onClick={() => setShowPersonalityPicker(!showPersonalityPicker)}>
							<span className="personality-icon">
								{currentPersonality?.icon || "🤖"}
							</span>
							<span className="personality-name">
								{currentPersonality?.name || "AI"}
							</span>
							<i className="fa fa-chevron-down"></i>
						</button>
					</div>
					<div className="header-right">
						<button
							className="settings-btn"
							onClick={() => router.push("/settings")}>
							<i className="fa fa-cog"></i>
						</button>
					</div>
				</div>

				{showPersonalityPicker && (
					<div className="personality-picker">
						<h3>Choose AI Personality</h3>
						<div className="personality-options">
							{personalities.map((p) => (
								<div
									key={p.id}
									className={`personality-option ${
										currentPersonality?.id === p.id ? "active" : ""
									}`}
									onClick={() => handlePersonalityChange(p)}>
									<span className="option-icon">{p.icon}</span>
									<div className="option-info">
										<strong>{p.name}</strong>
										<p>{p.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="chat-window" ref={chatWindowRef}>
					{messages.length === 0 && (
						<div className="welcome-message">
							<h2>
								Welcome to {currentPersonality?.name || "AI"} Chat{" "}
								{currentPersonality?.icon}
							</h2>
							<p>{currentPersonality?.description}</p>
							<p className="tip">
								💡 Tip: Click on the personality name above to switch AI
								personalities, or visit Settings to customize your experience!
							</p>
						</div>
					)}
					{messages.map((message, index) => (
						<div key={index} className="message-container">
							{message.user ? (
								<>
									<div className="user-message message">
										<div className="message-text">{message.text}</div>
									</div>
									<img
										className="profile-image user-image"
										src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png"
										alt="User Profile"
									/>
								</>
							) : (
								<>
									<div className="bot-avatar">
										<span className="avatar-icon">
											{message.personality?.icon || currentPersonality?.icon || "🤖"}
										</span>
									</div>
									{message.text === "loading" ? (
										<img
											className="typing-bubble"
											src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExODg3ZjFlNzQ1Mzc1ZTFlNTMyZTVjODIzMDYyODUwNDQ0ZDY3ZmU5YyZjdD1z/3tLfKrc4pLWiTkAAph/giphy.gif"
										/>
									) : (
										<div className="bot-message-wrapper">
											<div className="bot-message message">
												<div className="message-text">{message.text}</div>
												{message.cached && (
													<div className="message-meta">⚡ Cached response</div>
												)}
												{message.sentiment && (
													<div className="message-meta">
														Sentiment: {message.sentiment.sentiment}
													</div>
												)}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					))}
				</div>

				<form className="form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Type your message here..."
						value={userInput}
						onChange={handleChange}
						disabled={typing}
					/>
					<button type="submit" disabled={typing || !userInput.trim()}>
						<i className="fa fa-paper-plane" aria-hidden="true"></i>
					</button>
				</form>
			</div>

			<style jsx global>{`
				* {
					box-sizing: border-box;
					margin: 0;
					padding: 0;
				}

				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
						Oxygen, Ubuntu, Cantarell, sans-serif;
					background-color: #f5f5f5;
				}

				.chat-container {
					max-width: 600px;
					margin: 0 auto;
					height: 100vh;
					display: flex;
					flex-direction: column;
					background-color: white;
					box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
				}

				.header {
					background-color: #007aff;
					color: white;
					padding: 15px 20px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
				}

				.header-left {
					flex: 1;
				}

				.personality-picker-btn {
					background: rgba(255, 255, 255, 0.2);
					border: none;
					color: white;
					padding: 10px 15px;
					border-radius: 8px;
					cursor: pointer;
					display: flex;
					align-items: center;
					gap: 10px;
					font-size: 16px;
					transition: background 0.3s ease;
				}

				.personality-picker-btn:hover {
					background: rgba(255, 255, 255, 0.3);
				}

				.personality-icon {
					font-size: 24px;
				}

				.personality-name {
					font-weight: 600;
				}

				.settings-btn {
					background: rgba(255, 255, 255, 0.2);
					border: none;
					color: white;
					padding: 10px 15px;
					border-radius: 8px;
					cursor: pointer;
					font-size: 18px;
					transition: background 0.3s ease;
				}

				.settings-btn:hover {
					background: rgba(255, 255, 255, 0.3);
				}

				.personality-picker {
					background: white;
					border-bottom: 1px solid #e0e0e0;
					padding: 20px;
					max-height: 400px;
					overflow-y: auto;
				}

				.personality-picker h3 {
					margin-bottom: 15px;
					color: #333;
				}

				.personality-options {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.personality-option {
					display: flex;
					align-items: center;
					gap: 15px;
					padding: 12px;
					border: 2px solid #e0e0e0;
					border-radius: 8px;
					cursor: pointer;
					transition: all 0.3s ease;
				}

				.personality-option:hover {
					border-color: #007aff;
					background-color: #f0f8ff;
				}

				.personality-option.active {
					border-color: #007aff;
					background-color: #f0f8ff;
				}

				.option-icon {
					font-size: 32px;
				}

				.option-info {
					flex: 1;
				}

				.option-info strong {
					display: block;
					margin-bottom: 4px;
					color: #333;
				}

				.option-info p {
					font-size: 12px;
					color: #666;
					margin: 0;
				}

				.chat-window {
					flex: 1;
					overflow-y: auto;
					padding: 20px;
					background-color: #f5f5f5;
				}

				.welcome-message {
					text-align: center;
					padding: 40px 20px;
					color: #666;
				}

				.welcome-message h2 {
					color: #333;
					margin-bottom: 10px;
				}

				.welcome-message p {
					margin: 10px 0;
				}

				.welcome-message .tip {
					background: #fff3cd;
					padding: 15px;
					border-radius: 8px;
					margin-top: 20px;
					color: #856404;
				}

				.message-container {
					display: flex;
					align-items: flex-end;
					margin-bottom: 15px;
					gap: 10px;
				}

				.message {
					max-width: 70%;
					padding: 12px 16px;
					border-radius: 18px;
					word-wrap: break-word;
				}

				.user-message {
					background-color: #007aff;
					color: white;
					border-bottom-right-radius: 4px;
				}

				.bot-message {
					background-color: white;
					color: #333;
					border-bottom-left-radius: 4px;
					box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
				}

				.bot-message-wrapper {
					display: flex;
					flex-direction: column;
					gap: 5px;
					max-width: 70%;
				}

				.message-text {
					line-height: 1.4;
				}

				.message-meta {
					font-size: 11px;
					color: #999;
					margin-top: 5px;
				}

				.bot-avatar {
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}

				.avatar-icon {
					font-size: 24px;
				}

				.profile-image {
					width: 40px;
					height: 40px;
					border-radius: 50%;
					object-fit: cover;
					flex-shrink: 0;
				}

				.typing-bubble {
					width: 60px;
					height: 40px;
				}

				.form {
					display: flex;
					padding: 15px;
					background-color: white;
					border-top: 1px solid #e0e0e0;
					gap: 10px;
				}

				.form input {
					flex: 1;
					padding: 12px 16px;
					border: 2px solid #e0e0e0;
					border-radius: 24px;
					font-size: 14px;
					outline: none;
					transition: border-color 0.3s ease;
				}

				.form input:focus {
					border-color: #007aff;
				}

				.form input:disabled {
					background-color: #f5f5f5;
				}

				.form button {
					background-color: #007aff;
					color: white;
					border: none;
					border-radius: 50%;
					width: 44px;
					height: 44px;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: background-color 0.3s ease;
				}

				.form button:hover:not(:disabled) {
					background-color: #0051d5;
				}

				.form button:disabled {
					background-color: #ccc;
					cursor: not-allowed;
				}
			`}</style>
		</>
	);
}
