import { useState } from "react";
import "./App.css";

import ChatHeader from "./components/ChatHeader";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { speak } from "./services/ttsService";
import ChecklistCard from "./components/ChecklistCard";
import RecommendationCards from "./components/RecommendationCards";
import RecommendationSummary from "./components/RecommendationSummary";
import QuickActions from "./components/QuickActions";
function App() {
  const [message, setMessage] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [language, setLanguage] = useState("en-IN");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [chat, setChat] = useState([
    {
      sender: "AI",
      text: "Hello! I am Bharat AI Citizen Assistant. How can I help you today?",
    },
  ]);
  function handleQuickAction(query) {
    setMessage(query);

    setTimeout(() => {
      handleSend(query);
    }, 100);
  }

  async function handleSend(customMessage = null) {
    const userMessage =
      typeof customMessage === "string"
        ? customMessage
        : message;
    if (userMessage.trim() === "") return;
    setShowQuickActions(false);
    setLoading(true);
    

    setChat((prev) => [
      ...prev,
      {
        sender: "You",
        text: userMessage,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          language: language,
        }),
      });
      const data = await response.json();
      setSummary(data.summary || "");

      setRecommendations(
          data.recommendations || []
      );

      setChecklist(data.checklist || null);
      // 🔊 Speak the AI response
       await speak(data.reply, language);


      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: data.reply,
        },
      ]);
      setLoading(false);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "Error connecting to backend.",
        },
      ]);
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="chat-app">

        <ChatHeader 
        language={language}
        setLanguage={setLanguage}
        
        />
        {showQuickActions ? (
          <QuickActions onSelect={handleQuickAction} />
        ) : (
          <div className="quick-toggle">
            <button
              className="show-actions-btn"
              onClick={() => setShowQuickActions(true)}
            >
              ⚡ Show Quick Actions
            </button>
          </div>
        )}

        <div className="main-content">

          <ChatWindow
            chat={chat}
            loading={loading}
          />

        {summary && (
          <RecommendationSummary summary={summary} />
        )}

        {recommendations.length > 0 && (
          <RecommendationCards
            recommendations={recommendations}
          />
        )}

        {checklist && (
          <ChecklistCard data={checklist} />
        )}

      </div>

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        language={language}
        loading={loading}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        setVoiceStatus={setVoiceStatus}
      />
      </div>
    </div>
  );
}

export default App;