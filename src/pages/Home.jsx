import { useNavigate } from "react-router-dom";
import ModeCard from "../components/ModeCard";
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
  ];

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">EduGenie</h1>

        <p className="hero-subtitle">
          Your AI-Powered Exam Preparation Assistant
        </p>

        <p className="hero-description">
          Upload PDFs, provide topics or notes, and generate
          summaries, key points, or question-answer sets instantly.
        </p>
      </div>

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
    </div>
  );
}