function ChatHeader({ language, setLanguage }) {
  return (
    <header className="chat-header">
      <div className="header-left">
        <h2>🇮🇳 Bharat AI Citizen Assistant</h2>

        <p className="subtitle">
          Government Schemes • Certificates • Public Services
        </p>
      </div>

      <div className="header-right">
        <span className="ai-badge">
          AI Powered
        </span>

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
      </div>
    </header>
  );
}

export default ChatHeader;