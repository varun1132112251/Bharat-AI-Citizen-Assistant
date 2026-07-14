import { useState } from "react";
import "./App.css";

import ChatHeader from "./components/ChatHeader";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { speak } from "./services/ttsService";
import { getChecklist } from "./services/checklistService";
import ChecklistCard from "./components/ChecklistCard";
import RecommendationCards from "./components/RecommendationCards";
import { getRecommendations } from "./services/recommendationService";
import { getRecommendationSummary } from "./services/summaryService";
import RecommendationSummary from "./components/RecommendationSummary";
import QuickActions from "./components/QuickActions";
function App() {
  const [message, setMessage] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [language, setLanguage] = useState("en-IN");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
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
    const userMessage = customMessage || message;
    if (userMessage.trim() === "") return;
    

    setChat((prev) => [
      ...prev,
      {
        sender: "You",
        text: userMessage,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();
      const checklistData = await getChecklist(userMessage);
       setChecklist(checklistData);
      const recommendationData =
        await getRecommendations(userMessage);

      if (recommendationData.success) {
        setRecommendations(
          recommendationData.recommendations
        );
      } else {
        setRecommendations([]);
      } 
      const summaryData =
          await getRecommendationSummary(userMessage);

      if (summaryData.success) {
        setSummary(summaryData.summary);
      } else {
        setSummary("");
      }
      // 🔊 Speak the AI response
       speak(data.reply, language);


      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "Error connecting to backend.",
        },
      ]);
    }
  }

  return (
    <div className="container">
      <div className="chat-app">

        <ChatHeader 
        language={language}
        setLanguage={setLanguage}
        
        />
        <QuickActions
          onSelect={handleQuickAction}
        />

        <ChatWindow chat={chat} />
        {summary && (
           <RecommendationSummary summary={summary} />
        )}

        {recommendations.length > 0 && (
            <RecommendationCards
                recommendations={recommendations}
            />
        )}
        {checklist && <ChecklistCard data={checklist} />}
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          language={language}
        />

      </div>
    </div>
  );
}

export default App;