import { useNavigate } from "react-router-dom";
import ModeCard from "../components/ModeCard";
import { SparklesIcon } from "../components/Icons";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

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
  ];

  const features = [
    {
      title: "PDF Uploads",
      desc: "Drag and drop study materials, PDFs, or lecture notes directly."
    },
    {
      title: "Interactive Flashcards",
      desc: "Automatically convert Q&A text into beautiful study cards."
    },
    {
      title: "Voice Assistant (TTS)",
      desc: "Listen to summaries and study points on the go with built-in voice playback."
    },
    {
      title: "Smart Local History",
      desc: "Keep track of your study sessions automatically across visits."
    }
  ];

  return (
    <div className="home-container">
      {/* Decorative floating blur balls */}
      <div className="blur-blob purple-blob"></div>
      <div className="blur-blob green-blob"></div>
      <div className="grid-overlay"></div>

      <header className="home-header animate-fade-in">
        <div className="logo-wrapper">
          <div className="logo-icon">
            <SparklesIcon size={24} />
          </div>
          <span className="logo-text">EduGenie</span>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section animate-fade-in">
          <div className="hero-badge">
            <SparklesIcon size={12} className="badge-icon" />
            <span>Introducing EduGenie v2.0 Workspace</span>
          </div>
          <h1 className="hero-title">
            Your AI-Powered <span className="gradient-text">Exam Preparation</span> Assistant
          </h1>
          <p className="hero-description">
            Accelerate your learning. Upload lecture PDFs, textbook chapters, or course notes, and instantly extract summaries, flashcards, and exam questions.
          </p>
        </section>

        <section className="cards-section animate-fade-scale">
          <h2 className="section-title">Select a Study Mode</h2>
          <div className="cards-container">
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

        <section className="features-section animate-fade-in">
          <h2 className="section-title">Powerful Study Features</h2>
          <div className="features-grid">
            {features.map((feat, idx) => (
              <div key={idx} className="feature-item glass-panel">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-footer animate-fade-in">
        <p>© 2026 EduGenie. Developed to make studying effortless and smart.</p>
      </footer>
    </div>
  );
}