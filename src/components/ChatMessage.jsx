import ReactMarkdown from "react-markdown";
import "./ChatMessage.css";

export default function ChatMessage({
  role,
  content,
}) {
  return (
    <div
      className={`message-container ${
        role === "user"
          ? "user-container"
          : "assistant-container"
      }`}
    >
      <div
        className={`message-bubble ${
          role === "user"
            ? "user-message"
            : "assistant-message"
        }`}
      >
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}