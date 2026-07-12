import { useState } from "react";
import "./App.css";

import ChatHeader from "./components/ChatHeader";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { speak } from "./services/ttsService";

function App() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en-IN");

  const [chat, setChat] = useState([
    {
      sender: "AI",
      text: "Hello! I am Bharat AI Citizen Assistant. How can I help you today?",
    },
  ]);

  async function handleSend() {
    if (message.trim() === "") return;

    const userMessage = message;

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

        <ChatWindow chat={chat} />

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