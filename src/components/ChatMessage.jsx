import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon, SparklesIcon, FileIcon, ArrowLeftIcon, ArrowRightIcon, ExportIcon } from "./Icons";
import "./ChatMessage.css";

export default function ChatMessage({ role, content }) {
  const [copied, setCopied] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // Parse flashcards or quiz if the message is from assistant
  useEffect(() => {
    if (role === "assistant" && content) {
      // First try to parse as JSON for Quiz Mode
      try {
        const cleanContent = content.trim().replace(/^```(?:json)?|```$/gi, '').trim();
        const parsed = JSON.parse(cleanContent);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].options) {
          setQuizData(parsed);
          return;
        }
      } catch (e) {
        // Not a JSON quiz, fall back to flashcard parsing
      }

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

  const handleExport = () => {
    if (flashcards.length > 0) {
      // Export as a readable Text File for mobile users
      const textContent = flashcards.map((card, index) => 
        `Card ${index + 1}:\nQ: ${card.question}\nA: ${card.answer}\n------------------------\n`
      ).join("\n");
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'flashcards.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Export as Text
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'study_notes.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleQuizOptionSelect = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: option
    }));
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    }
  };

  const prevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setQuizFinished(true);
  };

  const toggleCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="syntax-highlighter-block"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
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
            <button className="action-btn" onClick={handleExport} title="Download/Export">
              <ExportIcon size={16} />
            </button>
          )}
          <button className="action-btn" onClick={handleCopy} title="Copy response">
            {copied ? <CheckIcon size={16} className="copied-icon" /> : <CopyIcon size={16} />}
          </button>
        </div>
      </div>

      <div className={`message-bubble ${isUser ? "user-message" : "assistant-message"}`}>
        {quizData && quizData.length > 0 && !isUser ? (
          <div className="quiz-container">
            {quizFinished ? (
              <div className="quiz-results animate-fade-in">
                <div className="quiz-results-header">
                  <h3>Quiz Results</h3>
                  <div className="quiz-score-badge">
                    {quizData.filter((q, i) => userAnswers[i] === q.answer).length} / {quizData.length}
                  </div>
                </div>
                <div className="quiz-review-list">
                  {quizData.map((q, i) => {
                    const isCorrect = userAnswers[i] === q.answer;
                    return (
                      <div key={i} className={`quiz-review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="quiz-review-q"><strong>Q{i + 1}:</strong> {q.question}</div>
                        <div className="quiz-review-answers">
                          <span className={`answer-badge ${isCorrect ? 'correct' : 'incorrect'}`}>You: {userAnswers[i] || 'None'}</span>
                          {!isCorrect && <span className="answer-badge correct">Correct: {q.answer}</span>}
                        </div>
                        <div className="quiz-review-exp"><strong>Explanation:</strong> {q.explanation}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flashcards-carousel-container animate-fade-in">
                <div className="flashcards-carousel-controls">
                  <button className="carousel-btn" onClick={prevQuizQuestion} disabled={currentQuizIndex === 0}>
                    <ArrowLeftIcon size={20} />
                  </button>
                  <span className="carousel-counter">{currentQuizIndex + 1} / {quizData.length}</span>
                  <button className="carousel-btn" onClick={nextQuizQuestion} disabled={currentQuizIndex === quizData.length - 1}>
                    <ArrowRightIcon size={20} />
                  </button>
                </div>
                <div className="quiz-question-view">
                  <div className="quiz-card">
                    <div className="card-badge">Question {currentQuizIndex + 1}</div>
                    <div className="quiz-question-text">
                      <ReactMarkdown components={markdownComponents}>{quizData[currentQuizIndex].question}</ReactMarkdown>
                    </div>
                    <div className="quiz-options-list">
                      {quizData[currentQuizIndex].options.map((opt, idx) => (
                        <button 
                          key={idx} 
                          className={`quiz-option-btn ${userAnswers[currentQuizIndex] === opt ? 'selected' : ''}`}
                          onClick={() => handleQuizOptionSelect(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {currentQuizIndex === quizData.length - 1 && (
                    <div className="quiz-submit-container">
                      <button className="quiz-submit-btn" onClick={submitQuiz} disabled={Object.keys(userAnswers).length !== quizData.length}>
                        Submit Quiz
                      </button>
                      {Object.keys(userAnswers).length !== quizData.length && (
                        <div className="quiz-warning">Please answer all questions before submitting.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : flashcards.length > 0 && !isUser ? (
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
                      <ReactMarkdown components={markdownComponents}>{flashcards[currentCardIndex].question}</ReactMarkdown>
                    </div>
                    <div className="card-hint">Click to flip</div>
                  </div>
                  <div className="flashcard-back">
                    <div className="card-badge">Answer</div>
                    <div className="card-content-scroll large-text">
                      <ReactMarkdown components={markdownComponents}>{flashcards[currentCardIndex].answer}</ReactMarkdown>
                    </div>
                    <div className="card-hint">Click to flip</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}