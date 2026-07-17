import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";


function ChatWindow({ chat, loading, voiceStatus }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);
  return (
    <div className="chat-window">
      {chat.map((item, index) => (
        <ChatBubble
          key={index}
          sender={item.sender}
          text={item.text}
        />
      ))}

      {loading && (
        <div className="chat-row ai">
        <div className="chat-bubble ai-bubble typing-bubble">

          {voiceStatus && (
            <div
              style={{
                fontSize: "14px",
                marginBottom: "8px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              {voiceStatus}
            </div>
          )}

          <span></span>
          <span></span>
          <span></span>

        </div>
        </div>
      )}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatWindow;