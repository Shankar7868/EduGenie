import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import ThemeSelector from "../components/ThemeSelector";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthProvider";
import { supabase } from "../lib/supabase";
import { SparklesIcon, HomeIcon, MenuIcon, CloseIcon } from "../components/Icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("edugenie_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!user) {
      localStorage.setItem("edugenie_history", JSON.stringify(searchHistory));
    }
  }, [searchHistory, user]);

  useEffect(() => {
    if (user) {
      const loadHistory = async () => {
        const { data } = await supabase
          .from('search_history')
          .select('query')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setSearchHistory(data.map(item => item.query));
      };
      loadHistory();
    }
  }, [user]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Enter a concept or paste lecture notes to begin! (PDF upload coming soon)`,
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Welcome to EduGenie ${mode.toUpperCase()} mode. Enter a concept or paste lecture notes to begin! (PDF upload coming soon)`,
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

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
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

    const userContent = currentInput || `Uploaded: ${currentFile?.name}`;
    const userMessage = {
      role: "user",
      content: userContent,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (user) {
      try {
        await supabase.from('search_history').insert([{ user_id: user.id, query: userContent }]);
        const { data } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data && data.length > 20) {
          const idsToDelete = data.slice(20).map(item => item.id);
          await supabase.from('search_history').delete().in('id', idsToDelete);
          setSearchHistory(data.slice(0, 20).map(item => item.query));
        } else if (data) {
          setSearchHistory(data.map(item => item.query));
        }
      } catch (err) {
        console.error("DB history error:", err);
      }
    } else {
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== userContent);
        return [userContent, ...filtered].slice(0, 20);
      });
    }

    setInput("");
    setFile(null);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("topic", currentInput);
      formData.append("mode", mode);

      if (currentFile) formData.append("file", currentFile);

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

      setMessages([...newMessages, aiMessage]);

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
      case "qna": return "Q&A Generation";
      case "summary": return "Summary Creator";
      case "keypoints": return "Key Points Extractor";
      case "flashcard": return "Flashcards Generator";
      case "quiz": return "Interactive Quiz";
      default: return mode.toUpperCase();
    }
  };

  const getLoadingStepLabel = () => {
    switch (loadingStep) {
      case 1: return "Reading study notes...";
      case 2: return "Analyzing topics & structuring revision plan...";
      case 3: return "Synthesizing comprehensive results...";
      default: return "EduGenie is thinking...";
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:relative flex flex-col w-[280px] h-full bg-secondary/50 backdrop-blur-xl border-r border-border/50 z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-6 h-20 border-b border-border/50">
          <div 
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" 
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <SparklesIcon size={16} />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">EduGenie</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">History</span>
            {searchHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 italic">No past searches yet.</p>
            ) : (
              searchHistory.map((query, idx) => (
                <Button 
                  key={idx}
                  variant="ghost" 
                  className="justify-start font-normal text-sm px-3 h-auto py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 w-full text-left"
                  onClick={() => {
                    setInput(query.startsWith('Uploaded: ') ? '' : query);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  title={query}
                >
                  <div className="truncate w-full">{query}</div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="secondary" 
            className="w-full justify-start gap-3 bg-background/50 hover:bg-background border border-border/50 shadow-sm"
            onClick={() => navigate("/")}
          >
            <HomeIcon size={16} className="text-indigo-500" />
            Go to Dashboard
          </Button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        
        {/* Workspace Header */}
        <header className="flex items-center justify-between h-20 px-6 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={20} />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground tracking-tight">{getModeLabel()}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                )} />
                <span className="text-xs font-medium text-muted-foreground">
                  {loading 
                    ? getLoadingStepLabel() 
                    : `Ready · ${messages.filter(m => m.role === "user").length} message(s)`
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden md:inline-block truncate max-w-[150px]">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
              </div>
            ) : (
              <AuthModal />
            )}
          </div>
        </header>

        {/* Chat Feed */}
        <ScrollArea className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}

            {loading && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <span className="text-sm font-medium text-indigo-500 animate-pulse">{getLoadingStepLabel()}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 max-w-2xl w-full flex flex-col gap-4">
                  <div className="h-4 bg-muted/50 rounded-md w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted/50 rounded-md w-1/2 animate-pulse" />
                  <div className="h-4 bg-muted/50 rounded-md w-5/6 animate-pulse" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0 z-20">
          <div className="max-w-4xl mx-auto w-full">
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
        </div>
      </main>
    </div>
  );
}
