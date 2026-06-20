import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./ChatPage.css";

export default function ChatPage() {
const { mode } = useParams();

const [input, setInput] = useState("");
const [file, setFile] = useState(null);
const [loading, setLoading] = useState(false);

const fileInputRef = useRef(null);
const messagesEndRef = useRef(null);

const [messages, setMessages] = useState([
{
role: "assistant",
content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF or enter a topic to begin.`,
},
]);

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({
behavior: "smooth",
block: "end",
});
};

useEffect(() => {
scrollToBottom();
}, [messages]);

const handleSubmit = async () => {
if (!input.trim() && !file) return;

  const currentInput = input;
  const currentFile = file;

  const userMessage = {
    role: "user",
    content: currentInput || `Uploaded: ${currentFile?.name}`,
  };

  setMessages((prev) => [...prev, userMessage]);

  // Clear UI immediately
  setInput("");
  setFile(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("topic", currentInput);
    formData.append("mode", mode);

    if (currentFile) {
      formData.append("file", currentFile);
    }
    const response = await fetch(
      
      import.meta.env.VITE_WEBHOOK_URL,
      {
        method: "POST",
        body: formData,
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }

    const aiMessage = {
      role: "assistant",
      content: typeof result === "string" ? result : JSON.stringify(result, null, 2),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (err) {
    console.error(err);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "An error occurred while processing your request.",
      },
    ]);
  } finally {
    setLoading(false);
  }

};
  return (
    <div className="chat-container">
      <div className="chat-header">EduGenie - {mode.toUpperCase()}</div>

      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "user-message" : "ai-message"}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}

        {loading && <div className="ai-message">Generating...</div>}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <label className="upload-btn">
          +
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <textarea
          placeholder={`Enter topic or notes for ${mode}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <button onClick={handleSubmit} disabled={loading}>
          ↑
        </button>
      </div>

      {file && (
        <div className="file-name">
          📄 {file.name}
        </div>
      )}
    </div>
  );
}
