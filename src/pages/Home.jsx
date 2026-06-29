import { useNavigate } from "react-router-dom";
import ModeCard from "../components/ModeCard";
import { SparklesIcon } from "../components/Icons";
import ThemeSelector from "../components/ThemeSelector";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthProvider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const modes = [
    {
      title: "Q&A Generation",
      description: "Generate exam-oriented questions and answers from your study material.",
      route: "/chat/qna",
    },
    {
      title: "Summary",
      description: "Create concise and structured summaries for quick revision.",
      route: "/chat/summary",
    },
    {
      title: "Key Points",
      description: "Extract important concepts and highlights from documents.",
      route: "/chat/keypoints",
    },
    {
      title: "Flashcards",
      description: "Automatically convert study material into beautiful Anki-style cards.",
      route: "/chat/flashcard",
    },
    {
      title: "Interactive Quiz",
      description: "Test your knowledge with an interactive conversational quiz generated from your notes.",
      route: "/chat/quiz",
    },
  ];

  const features = [
    {
      title: "PDF Uploads (Coming Soon)",
      desc: "Drag and drop study materials, PDFs, or lecture notes directly. Currently disabled for maintenance."
    },
    {
      title: "Interactive Flashcards",
      desc: "Automatically convert Q&A text into beautiful study cards."
    },
    {
      title: "Export & Download",
      desc: "Download your flashcards and summaries instantly as mobile-friendly plain text files."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background w-full">
      {/* Decorative floating blur balls */}
      <div className="absolute top-[-100px] right-[-50px] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[120px] opacity-15 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] opacity-15 pointer-events-none z-0"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-[1]"></div>

      <header className="h-20 flex justify-between items-center px-6 md:px-10 border-b border-border/40 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.35)]">
            <SparklesIcon size={24} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground">EduGenie</span>
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 z-10 relative flex flex-col gap-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border/50 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground mb-8 shadow-sm backdrop-blur-sm">
            <SparklesIcon size={14} className="text-indigo-500" />
            <span>Introducing EduGenie v2.0 Workspace</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.15]">
            Your AI-Powered <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Exam Preparation</span> Assistant
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Accelerate your learning. Paste your textbook chapters or course notes, and instantly extract summaries, flashcards, and exam questions. (PDF uploads coming soon!)
          </p>
        </section>

        {/* Mode Cards */}
        <section className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 fill-mode-both">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Select a Study Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full place-items-stretch">
            {modes.map((mode) => (
              <ModeCard
                key={mode.title}
                title={mode.title}
                description={mode.description}
                onClick={() => navigate(mode.route)}
              />
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 fill-mode-both">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Powerful Study Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full place-items-stretch">
            {features.map((feat, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-secondary/50">
                <h4 className="text-lg font-bold mb-3 text-foreground">{feat.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-10 text-center border-t border-border/40 text-muted-foreground text-sm z-10 relative backdrop-blur-sm">
        <p>© 2026 EduGenie. Developed to make studying effortless and smart.</p>
      </footer>
    </div>
  );
}