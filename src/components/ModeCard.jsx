import { QnaIcon, SummaryIcon, KeyPointsIcon } from "./Icons";
import "./ModeCard.css";

export default function ModeCard({ title, description, onClick }) {
  const getIcon = () => {
    switch (title) {
      case "Q&A Generation":
        return <QnaIcon size={36} className="mode-icon qna" />;
      case "Summary":
        return <SummaryIcon size={36} className="mode-icon summary" />;
      case "Key Points":
        return <KeyPointsIcon size={36} className="mode-icon keypoints" />;
      default:
        return null;
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