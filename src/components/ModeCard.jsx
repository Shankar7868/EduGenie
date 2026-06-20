import "./ModeCard.css";

export default function ModeCard({
  title,
  description,
  onClick,
}) {
  return (
    <div
      className="mode-card"
      onClick={onClick}
    >
      <div className="mode-card-content">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="mode-card-arrow">
        →
      </div>
    </div>
  );
}