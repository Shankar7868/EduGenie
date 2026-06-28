import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import {
  SparklesIcon,
  HomeIcon,
  QnaIcon,
  SummaryIcon,
  KeyPointsIcon,
  TrashIcon,
  MenuIcon,
  CloseIcon,
  HistoryIcon,
  FlashcardIcon
} from "../components/Icons";
import "./ChatPage.css";

export default function ChatPage() {
  const { mode } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: None, 1: Upload, 2: Analyze, 3: Generate
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
    },
  ]);

  
  const messagesEndRef = useRef(null);

  // Handle routing / mode changes
  useEffect(() => {
    // When switching mode, reset active chat
    setMessages([
      {
        role: "assistant",
        content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
      },
    ]);
    setFile(null);
    setInput("");
  }, [mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Step-by-step loading messages
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async () => {
    if (!input.trim() && !file) return;

    const currentInput = input;
    const currentFile = file;

    const userMessage = {
      role: "user",
      content: currentInput || `Uploaded: ${currentFile?.name}`,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Clear inputs immediately
    setInput("");
    setFile(null);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("topic", currentInput);
      formData.append("mode", mode);

      if (currentFile) {
        formData.append("file", currentFile);
      }

      // Read from env configuration
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = response.status === 503 
          ? "Service Unavailable (503): The backend n8n workflow is currently offline or the webhook tunnel is disconnected. Please ensure your API is active."
          : `Server returned status code: ${response.status}`;
        throw new Error(errorMsg);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }

      // Extract actual content string
      let aiResponseText = "";
      if (typeof result === "string") {
        aiResponseText = result;
      } else if (result && result.output) {
        aiResponseText = result.output;
      } else {
        aiResponseText = JSON.stringify(result, null, 2);
      }

      const aiMessage = {
        role: "assistant",
        content: aiResponseText,
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Connection Error**: Failed to retrieve response from server. Check your network connection or try again later. \n\n*Error details: ${err.message}*`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };



  const getModeLabel = () => {
    switch (mode) {
      case "qna":
        return "Q&A Generation";
      case "summary":
        return "Summary Creator";
      case "keypoints":
        return "Key Points Extractor";
      case "flashcard":
        return "Flashcards Generator";
      default:
        return mode.toUpperCase();
    }
  };

  const getLoadingStepLabel = () => {
    switch (loadingStep) {
      case 1:
        return "Reading study notes & attachments...";
      case 2:
        return "Analyzing topics & structuring revision plan...";
      case 3:
        return "Synthesizing comprehensive results...";
      default:
        return "EduGenie is thinking...";
    }
  };

  return (
    <div className="chat-page-layout">
      {/* Sidebar Panel */}
      <aside className={`chat-sidebar glass-panel ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-small">
              <SparklesIcon size={16} />
            </div>
            <span className="logo-text-small">EduGenie</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(false)}>
            <CloseIcon size={18} />
          </button>
        </div>



        <div className="sidebar-footer">
          <button className="back-home-btn" onClick={() => navigate("/")}>
            <HomeIcon size={16} />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="chat-main-workspace">
        <header className="workspace-header glass-panel">
          <div className="workspace-header-left">
            {!sidebarOpen && (
              <button className="workspace-menu-btn animate-fade-in" onClick={() => setSidebarOpen(true)}>
                <MenuIcon size={20} />
              </button>
            )}
            <div className="workspace-title-info">
              <h2>{getModeLabel()}</h2>
              <div className="status-indicator">
                <span className={`status-dot ${loading ? "loading" : ""}`}></span>
                <span className="status-text">
                  {loading ? getLoadingStepLabel() : `Ready to study · ${messages.filter(m => m.role === "user").length} message${messages.filter(m => m.role === "user").length !== 1 ? "s" : ""} in session`}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="messages-feed">
          <div className="messages-feed-content">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}

            {loading && (
              <div className="skeleton-loader-container">
                <div className="skeleton-header">
                  <div className="spinner-small spinner-accent" />
                  <span className="skeleton-step-text">{getLoadingStepLabel()}</span>
                </div>
                <div className="skeleton-card glass-panel">
                  <div className="skeleton-line line-long"></div>
                  <div className="skeleton-line line-medium"></div>
                  <div className="skeleton-line line-short"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <footer className="workspace-input-section">
          <div className="workspace-input-container">
            <ChatInput
              input={input}
              setInput={setInput}
              file={file}
              setFile={setFile}
              onSubmit={handleSubmit}
              loading={loading}
              placeholder={`Enter topic or paste notes to generate your ${getModeLabel()}...`}
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
