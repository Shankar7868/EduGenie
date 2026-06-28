import { QnaIcon, SummaryIcon, KeyPointsIcon, FlashcardIcon } from "./Icons";
import "./ModeCard.css";

export default function ModeCard({ title, description, onClick }) {
  const getIcon = () => {
    if (title.toLowerCase().includes("q&a")) {
      return <QnaIcon size={36} className="mode-icon qna" />;
    } else if (title.toLowerCase().includes("summary")) {
      return <SummaryIcon size={36} className="mode-icon summary" />;
    } else if (title.toLowerCase().includes("flashcard")) {
      return <FlashcardIcon size={36} className="mode-icon flashcard" />;
    } else {
      return <KeyPointsIcon size={36} className="mode-icon keypoints" />;
    }
  };

  return (
    <div className="mode-card glass-panel" onClick={onClick}>
      <div className="mode-card-header">
        <div className="mode-icon-wrapper">{getIcon()}</div>
        <div className="mode-card-arrow">→</div>
      </div>
      <div className="mode-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="mode-card-footer">
        <span>Start preparing</span>
      </div>
    </div>
  );
}