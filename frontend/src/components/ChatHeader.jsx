function ChatHeader({ language, setLanguage }) {
  return (
    <header className="chat-header">
      <div>
        <h2>🇮🇳 Bharat AI Citizen Assistant</h2>
        <p className="subtitle">
          Your multilingual government services assistant
        </p>
      </div>

      <select
        className="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en-IN">English</option>
        <option value="hi-IN">हिन्दी</option>
        <option value="te-IN">తెలుగు</option>
        <option value="ta-IN">தமிழ்</option>
        <option value="kn-IN">ಕನ್ನಡ</option>
      </select>
    </header>
  );
}

export default ChatHeader;