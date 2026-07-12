function ChatBubble({ sender, text }) {
  const isUser = sender === "You";

  return (
    <div
      className={`chat-row ${isUser ? "user" : "ai"}`}
    >
      <div
        className={`chat-bubble ${
          isUser ? "user-bubble" : "ai-bubble"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default ChatBubble;