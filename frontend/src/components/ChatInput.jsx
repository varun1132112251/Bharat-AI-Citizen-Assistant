import { FaMicrophone, FaPaperPlane, FaStop } from "react-icons/fa";
import {
  startListening,
  stopListening,
} from "../services/speechService";
function ChatInput({
  message,
  setMessage,
  handleSend,
  language,
  loading,
  isRecording,
  setIsRecording,
  setVoiceStatus,
}) {
  return (
    <div className="chat-input-container">

      <button
  className="mic-btn"
  onClick={async () => {
    if (!isRecording) {
      setIsRecording(true);

      await startListening(language, (text) => {
        setMessage(text);

        setTimeout(() => {
          handleSend(text);
        }, 100);
      },
      (status) => {
        setVoiceStatus(status);
      }
    );

    } else {
      setIsRecording(false);
      await stopListening();
    }
  }}
>
  {isRecording ? <FaStop /> : <FaMicrophone />}
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