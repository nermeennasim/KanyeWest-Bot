import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/router";

export default function Settings() {
	const router = useRouter();
	const [profile, setProfile] = useState(null);
	const [personalities, setPersonalities] = useState([]);
	const [topics, setTopics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [formData, setFormData] = useState({
		personality: "kanye",
		tone_preference: "balanced",
		verbosity: "medium",
		response_style: "creative",
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [profileRes, personalitiesRes, topicsRes] = await Promise.all([
				axios.get("/api/profile"),
				axios.get("/api/personalities"),
				axios.get("/api/topics"),
			]);

			setProfile(profileRes.data.profile);
			setPersonalities(personalitiesRes.data.personalities);
			setTopics(topicsRes.data.topics);

			setFormData({
				personality: profileRes.data.profile.personality || "kanye",
				tone_preference: profileRes.data.profile.tone_preference || "balanced",
				verbosity: profileRes.data.profile.verbosity || "medium",
				response_style: profileRes.data.profile.response_style || "creative",
			});

			setLoading(false);
		} catch (error) {
			console.error("Error loading data:", error);
			setLoading(false);
		}
	};

	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await axios.post("/api/profile", formData);
			alert("Settings saved successfully!");
		} catch (error) {
			console.error("Error saving settings:", error);
			alert("Failed to save settings. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="settings-container">
				<p>Loading settings...</p>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Settings - AI Chatbot</title>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
				/>
			</Head>
			<div className="settings-container">
				<div className="settings-header">
					<button className="back-btn" onClick={() => router.push("/")}>
						<i className="fa fa-arrow-left"></i> Back to Chat
					</button>
					<h1>Settings</h1>
				</div>

				<div className="settings-content">
					<section className="settings-section">
						<h2>AI Personality</h2>
						<p className="section-description">
							Choose which AI personality to chat with
						</p>
						<div className="personality-grid">
							{personalities.map((p) => (
								<div
									key={p.id}
									className={`personality-card ${
										formData.personality === p.id ? "selected" : ""
									}`}
									onClick={() => handleChange("personality", p.id)}>
									<div className="personality-icon">{p.icon}</div>
									<h3>{p.name}</h3>
									<p>{p.description}</p>
								</div>
							))}
						</div>
					</section>

					<section className="settings-section">
						<h2>Conversation Style</h2>

						<div className="setting-group">
							<label>Tone Preference</label>
							<select
								value={formData.tone_preference}
								onChange={(e) => handleChange("tone_preference", e.target.value)}>
								<option value="casual">Casual & Relaxed</option>
								<option value="balanced">Balanced</option>
								<option value="professional">Professional</option>
								<option value="enthusiastic">Enthusiastic & Energetic</option>
							</select>
						</div>

						<div className="setting-group">
							<label>Response Length</label>
							<select
								value={formData.verbosity}
								onChange={(e) => handleChange("verbosity", e.target.value)}>
								<option value="brief">Brief & Concise</option>
								<option value="medium">Medium Length</option>
								<option value="detailed">Detailed & Comprehensive</option>
							</select>
						</div>

						<div className="setting-group">
							<label>Response Style</label>
							<select
								value={formData.response_style}
								onChange={(e) => handleChange("response_style", e.target.value)}>
								<option value="creative">Creative & Imaginative</option>
								<option value="direct">Direct & Straightforward</option>
								<option value="storytelling">Storytelling with Examples</option>
								<option value="quick">Quick & Fast Responses</option>
							</select>
						</div>
					</section>

					<section className="settings-section">
						<h2>Your Topics of Interest</h2>
						<p className="section-description">
							Based on your conversations, you've shown interest in:
						</p>
						<div className="topics-container">
							{topics.length > 0 ? (
								topics.map((topic, index) => (
									<span key={index} className="topic-badge">
										{topic.topic} ({topic.frequency})
									</span>
								))
							) : (
								<p>No topics tracked yet. Start chatting to see your interests!</p>
							)}
						</div>
					</section>

					<div className="settings-actions">
						<button className="save-btn" onClick={handleSave} disabled={saving}>
							{saving ? "Saving..." : "Save Settings"}
						</button>
					</div>
				</div>

				<style jsx>{`
					.settings-container {
						max-width: 900px;
						margin: 0 auto;
						padding: 20px;
						min-height: 100vh;
						background-color: #f5f5f5;
					}

					.settings-header {
						display: flex;
						align-items: center;
						gap: 20px;
						margin-bottom: 30px;
					}

					.back-btn {
						padding: 10px 20px;
						background: #007aff;
						color: white;
						border: none;
						border-radius: 8px;
						cursor: pointer;
						font-size: 14px;
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.back-btn:hover {
						background: #0051d5;
					}

					h1 {
						font-size: 32px;
						margin: 0;
					}

					.settings-content {
						background: white;
						border-radius: 12px;
						padding: 30px;
						box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					}

					.settings-section {
						margin-bottom: 40px;
						padding-bottom: 40px;
						border-bottom: 1px solid #e0e0e0;
					}

					.settings-section:last-of-type {
						border-bottom: none;
					}

					.settings-section h2 {
						font-size: 24px;
						margin-bottom: 10px;
						color: #333;
					}

					.section-description {
						color: #666;
						margin-bottom: 20px;
					}

					.personality-grid {
						display: grid;
						grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
						gap: 15px;
					}

					.personality-card {
						border: 2px solid #e0e0e0;
						border-radius: 12px;
						padding: 20px;
						cursor: pointer;
						transition: all 0.3s ease;
						text-align: center;
					}

					.personality-card:hover {
						border-color: #007aff;
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
					}

					.personality-card.selected {
						border-color: #007aff;
						background-color: #f0f8ff;
					}

					.personality-icon {
						font-size: 48px;
						margin-bottom: 10px;
					}

					.personality-card h3 {
						font-size: 16px;
						margin: 10px 0;
						color: #333;
					}

					.personality-card p {
						font-size: 12px;
						color: #666;
						margin: 0;
					}

					.setting-group {
						margin-bottom: 20px;
					}

					.setting-group label {
						display: block;
						font-weight: 600;
						margin-bottom: 8px;
						color: #333;
					}

					.setting-group select {
						width: 100%;
						padding: 12px;
						border: 2px solid #e0e0e0;
						border-radius: 8px;
						font-size: 14px;
						background: white;
						cursor: pointer;
						transition: border-color 0.3s ease;
					}

					.setting-group select:focus {
						outline: none;
						border-color: #007aff;
					}

					.topics-container {
						display: flex;
						flex-wrap: wrap;
						gap: 10px;
					}

					.topic-badge {
						background: #007aff;
						color: white;
						padding: 8px 16px;
						border-radius: 20px;
						font-size: 14px;
					}

					.settings-actions {
						display: flex;
						justify-content: center;
						margin-top: 30px;
					}

					.save-btn {
						padding: 15px 40px;
						background: #007aff;
						color: white;
						border: none;
						border-radius: 8px;
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
						transition: background 0.3s ease;
					}

					.save-btn:hover:not(:disabled) {
						background: #0051d5;
					}

					.save-btn:disabled {
						background: #ccc;
						cursor: not-allowed;
					}
				`}</style>
			</div>
		</>
	);
}
