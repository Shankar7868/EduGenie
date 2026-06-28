import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { CopyIcon, CheckIcon, VolumeIcon, VolumeMuteIcon, SparklesIcon, FileIcon, ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import "./ChatMessage.css";

export default function ChatMessage({ role, content }) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Parse flashcards if the message is from assistant and contains Q&A
  useEffect(() => {
    if (role === "assistant" && content) {
      const lines = content.split('\n');
      const items = [];
      let currentQ = "";
      let currentA = "";
      let inA = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Check for Question/Front
        const qMatch = line.match(/^(?:\*\*)?(?:Question|Q|Front)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
        if (qMatch) {
          if (currentQ && currentA) {
            items.push({ question: currentQ, answer: currentA.trim() });
          }
          currentQ = qMatch[1].trim();
          currentA = "";
          inA = false;
          continue;
        }

        // Check for Answer/Back
        const aMatch = line.match(/^(?:\*\*)?(?:Answer|A|Back)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
        if (aMatch) {
          currentA = aMatch[1].trim();
          inA = true;
          continue;
        }

        // Check for Card X header (ignore)
        if (line.match(/^🃏?\s*(?:\*\*)?Card\s+\d+(?:\*\*)?/i)) {
          continue;
        }
        
        // Horizontal rule
        if (line.match(/^---+$/)) {
            continue;
        }

        // Append to Answer if in Answer section
        if (inA) {
          currentA += "\n" + line;
        } else if (currentQ && !inA) {
          // maybe multi-line question
          currentQ += " " + line;
        }
      }

      if (currentQ && currentA) {
        items.push({ question: currentQ, answer: currentA.trim() });
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

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (flashcards.length === 0) return;
    
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "ArrowLeft") {
        prevCard();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards.length, currentCardIndex]);

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
        {flashcards.length > 0 && !isUser ? (
          <div className="flashcards-carousel-container">
            <div className="flashcards-carousel-controls">
              <button 
                className="carousel-btn" 
                onClick={prevCard} 
                disabled={currentCardIndex === 0}
                title="Previous Card"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <span className="carousel-counter">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
              <button 
                className="carousel-btn" 
                onClick={nextCard} 
                disabled={currentCardIndex === flashcards.length - 1}
                title="Next Card"
              >
                <ArrowRightIcon size={20} />
              </button>
            </div>
            <div className="flashcards-carousel-view">
              <div
                className={`flashcard-large ${flippedCards[currentCardIndex] ? "flipped" : ""}`}
                onClick={() => toggleCard(currentCardIndex)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <div className="card-badge">Card {currentCardIndex + 1} (Question)</div>
                    <div className="card-content large-text">
                      <ReactMarkdown>{flashcards[currentCardIndex].question}</ReactMarkdown>
                    </div>
                    <div className="card-hint">Click to flip</div>
                  </div>
                  <div className="flashcard-back">
                    <div className="card-badge">Answer</div>
                    <div className="card-content-scroll large-text">
                      <ReactMarkdown>{flashcards[currentCardIndex].answer}</ReactMarkdown>
                    </div>
                    <div className="card-hint">Click to flip</div>
                  </div>
                </div>
              </div>
            </div>
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