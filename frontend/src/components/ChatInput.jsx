import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { startListening } from "../services/speechService";
function ChatInput({
  message,
  setMessage,
  handleSend,
  language,
  loading,
}) {
  return (
    <div className="chat-input-container">

      <button
  className="mic-btn"
  onClick={() =>
    startListening(language, (text) => {
      setMessage(text);
    })
  }
>
  <FaMicrophone />
</button>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            handleSend();
          }
        }}
      />

      <button
        className="send-btn"
        onClick={() => handleSend()}
        disabled={loading}
      >
        <FaPaperPlane />
      </button>

    </div>
  );
}

export default ChatInput;