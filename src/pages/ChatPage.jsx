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
  HistoryIcon
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
  const [sessionId, setSessionId] = useState(null);
  
  // Load sessions history from localStorage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("edugenie_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
    },
  ]);

  
  const messagesEndRef = useRef(null);

  // Sync sessions history to localStorage
  useEffect(() => {
    localStorage.setItem("edugenie_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Handle routing / mode changes
  useEffect(() => {
    // When switching mode, reset active chat unless it's a restored session
    setSessionId(null);
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

      // Send full conversation history so the AI can maintain context
      const conversationHistory = messages
        .filter((m) => m.role !== "system") // exclude any system prompts
        .map((m) => ({ role: m.role, content: m.content }));
      formData.append("history", JSON.stringify(conversationHistory));

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
        throw new Error(`Server returned status code: ${response.status}`);
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

      // Create/Update Session History
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = `session_${Date.now()}`;
        setSessionId(activeSessionId);

        // Add new session
        const sessionTitle = currentFile 
          ? `File: ${currentFile.name.substring(0, 20)}...`
          : currentInput.substring(0, 25) + (currentInput.length > 25 ? "..." : "");

        const newSession = {
          id: activeSessionId,
          title: sessionTitle,
          mode: mode,
          messages: updatedMessages,
          timestamp: Date.now()
        };
        setSessions((prev) => [newSession, ...prev]);
      } else {
        // Update existing session
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: updatedMessages, timestamp: Date.now() }
              : s
          )
        );
      }

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

  // Restore session from history
  const handleLoadSession = (session) => {
    setSessionId(session.id);
    setMessages(session.messages);
    navigate(`/chat/${session.mode}`);
  };

  // Clear single session history
  const handleDeleteSession = (e, targetId) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== targetId));
    if (sessionId === targetId) {
      setSessionId(null);
      setMessages([
        {
          role: "assistant",
          content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
        },
      ]);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all studying history?")) {
      setSessions([]);
      setSessionId(null);
      setMessages([
        {
          role: "assistant",
          content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
        },
      ]);
    }
  };

  const startNewSession = () => {
    setSessionId(null);
    setMessages([
      {
        role: "assistant",
        content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Upload a PDF study guide, enter a concept, or paste lecture notes to begin!`,
      },
    ]);
  };

  const getModeLabel = () => {
    switch (mode) {
      case "qna":
        return "Q&A Generation";
      case "summary":
        return "Summary Creator";
      case "keypoints":
        return "Key Points Extractor";
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

        <button className="new-session-btn" onClick={startNewSession}>
          + New Study Session
        </button>

        <div className="sidebar-section">
          <span className="sidebar-section-title">Study Modes</span>
          <nav className="mode-nav">
            <button
              className={`mode-nav-item ${mode === "qna" ? "active" : ""}`}
              onClick={() => navigate("/chat/qna")}
            >
              <QnaIcon size={18} className="mode-item-icon qna" />
              <span>Q&A Generation</span>
            </button>
            <button
              className={`mode-nav-item ${mode === "summary" ? "active" : ""}`}
              onClick={() => navigate("/chat/summary")}
            >
              <SummaryIcon size={18} className="mode-item-icon summary" />
              <span>Summary</span>
            </button>
            <button
              className={`mode-nav-item ${mode === "keypoints" ? "active" : ""}`}
              onClick={() => navigate("/chat/keypoints")}
            >
              <KeyPointsIcon size={18} className="mode-item-icon keypoints" />
              <span>Key Points</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-history-section">
          <div className="sidebar-section-title-wrapper">
            <span className="sidebar-section-title">Recent History</span>
            {sessions.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAllHistory} title="Clear history">
                <TrashIcon size={14} />
              </button>
            )}
          </div>

          <div className="history-list">
            {sessions.length === 0 ? (
              <div className="history-empty">
                <HistoryIcon size={24} className="history-empty-icon" />
                <span>No previous sessions</span>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className={`history-item ${sessionId === s.id ? "active" : ""}`}
                  onClick={() => handleLoadSession(s)}
                >
                  <div className="history-item-content">
                    <span className="history-item-title">{s.title}</span>
                    <span className={`history-item-badge ${s.mode}`}>{s.mode.toUpperCase()}</span>
                  </div>
                  <button
                    className="delete-history-btn"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    title="Delete session"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
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
