import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
       sender: "AI",
    text: "Hello! I am Bharat AI Citizen Assistant. How can I help you today?"
  }
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
      <h1>Bharat AI Citizen Assistant</h1>

      <div className="chat-box">
        {chat.map((item, index) => (
          <p key={index}>
            <strong>{item.sender}:</strong> {item.text}
          </p>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;