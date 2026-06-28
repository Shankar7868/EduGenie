import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { CopyIcon, CheckIcon, VolumeIcon, VolumeMuteIcon, SparklesIcon, FileIcon } from "./Icons";
import "./ChatMessage.css";

export default function ChatMessage({ role, content }) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "flashcards"
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});

  // Parse flashcards if the message is from assistant and contains Q&A
  useEffect(() => {
    if (role === "assistant" && content) {
      // Regex to parse Question and Answer pairs
      const qnaRegex = /(?:^|\n)(?:Question|Q)\s*\d*[:.-]?\s*([^\n]+)(?:\n+)(?:Answer|A)\s*[:.-]?\s*([\s\S]*?)(?=(?:\n+(?:Question|Q)\s*\d*[:.-]?\s*)|$)/gi;
      const items = [];
      let match;
      
      // Temporary check with a copy of regex
      const tempRegex = new RegExp(qnaRegex);
      while ((match = tempRegex.exec(content)) !== null) {
        const question = match[1].replace(/^\*\*|\*\*$/g, "").trim();
        const answer = match[2].replace(/^\*\*|\*\*$/g, "").trim();
        if (question && answer) {
          items.push({ question, answer });
        }
      }
      setFlashcards(items);
    }
  }, [role, content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleTextToSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Clean markdown tags for cleaner speech
    const cleanText = content
      .replace(/[*#`_\-]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.cancel(); // Stop any current speech
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isUser = role === "user";

  return (
    <div className={`message-container ${isUser ? "user-container" : "assistant-container"}`}>
      <div className="message-header">
        <div className="message-avatar">
          {isUser ? (
            <div className="avatar-circle user-avatar">U</div>
          ) : (
            <div className="avatar-circle assistant-avatar">
              <SparklesIcon size={16} />
            </div>
          )}
          <span className="avatar-name">{isUser ? "You" : "EduGenie"}</span>
        </div>

        <div className="message-actions">
          {flashcards.length > 0 && !isUser && (
            <div className="view-tabs">
              <button
                className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                Chat View
              </button>
              <button
                className={`tab-btn study-btn ${activeTab === "flashcards" ? "active" : ""}`}
                onClick={() => setActiveTab("flashcards")}
              >
                Flashcards ({flashcards.length})
              </button>
            </div>
          )}

          {!isUser && (
            <button
              className={`action-btn ${isPlaying ? "playing" : ""}`}
              onClick={handleTextToSpeech}
              title={isPlaying ? "Stop listening" : "Listen to response"}
            >
              {isPlaying ? <VolumeMuteIcon size={16} /> : <VolumeIcon size={16} />}
            </button>
          )}

          <button className="action-btn" onClick={handleCopy} title="Copy response">
            {copied ? <CheckIcon size={16} className="copied-icon" /> : <CopyIcon size={16} />}
          </button>
        </div>
      </div>

      <div className={`message-bubble ${isUser ? "user-message" : "assistant-message"}`}>
        {activeTab === "flashcards" && flashcards.length > 0 ? (
          <div className="flashcards-grid">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                className={`flashcard ${flippedCards[idx] ? "flipped" : ""}`}
                onClick={() => toggleCard(idx)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <div className="card-badge">Question {idx + 1}</div>
                    <div className="card-content">{card.question}</div>
                    <div className="card-hint">Click to reveal answer</div>
                  </div>
                  <div className="flashcard-back">
                    <div className="card-badge">Answer</div>
                    <div className="card-content-scroll">
                      <ReactMarkdown>{card.answer}</ReactMarkdown>
                    </div>
                    <div className="card-hint">Click to see question</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}