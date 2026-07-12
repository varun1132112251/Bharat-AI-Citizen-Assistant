import ChatBubble from "./ChatBubble";

function ChatWindow({ chat }) {
  return (
    <div className="chat-window">
      {chat.map((item, index) => (
        <ChatBubble
          key={index}
          sender={item.sender}
          text={item.text}
        />
      ))}
    </div>
  );
}

export default ChatWindow;