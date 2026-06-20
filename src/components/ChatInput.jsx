import "./ChatInput.css";

export default function ChatInput({
  input,
  setInput,
  file,
  setFile,
  onSubmit,
  loading,
}) {
  return (
    <div className="chat-input-wrapper">

      {file && (
        <div className="selected-file">
          📄 {file.name}
        </div>
      )}

      <div className="chat-input-container">

        <label className="upload-button">
          +
          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />
        </label>

        <textarea
          value={input}
          placeholder="Enter topic or notes..."
          onChange={(e) =>
            setInput(e.target.value)
          }
          rows={1}
        />

        <button
          className="send-button"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "..." : "↑"}
        </button>

      </div>
    </div>
  );
}