import { useRef, useState, useEffect } from "react";
import { SendIcon, UploadIcon, CloseIcon, FileIcon } from "./Icons";
import "./ChatInput.css";

export default function ChatInput({
  input,
  setInput,
  file,
  setFile,
  onSubmit,
  loading,
  placeholder = "Enter topic or notes..."
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-grow height of textarea when text changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (loading) return;
    if (input.trim() || file) {
      onSubmit();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert("Please upload PDF documents only.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else if (droppedFile) {
      alert("Only PDF files are supported.");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div 
      className={`chat-input-wrapper glass-panel ${isDragOver ? "drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file && (
        <div className="file-preview-pill">
          <div className="file-preview-info">
            <FileIcon size={16} className="file-icon" />
            <span className="file-name" title={file.name}>{file.name}</span>
            <span className="file-size">({formatFileSize(file.size)})</span>
          </div>
          <button className="remove-file-btn" onClick={removeFile} title="Remove file">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="chat-input-container">
        <label className="icon-action-btn upload-trigger" title="Upload PDF notes">
          <UploadIcon size={20} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        <textarea
          ref={textareaRef}
          value={input}
          placeholder={file ? "Add some comments/topic or hit send..." : placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />

        <button
          className={`send-action-btn ${(input.trim() || file) && !loading ? "ready" : ""}`}
          onClick={handleSubmit}
          disabled={loading || (!input.trim() && !file)}
          title="Send message"
        >
          {loading ? (
            <div className="spinner-small" />
          ) : (
            <SendIcon size={18} />
          )}
        </button>
      </div>

      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-overlay-box">
            <UploadIcon size={32} className="float-anim" />
            <span>Drop PDF study notes here</span>
          </div>
        </div>
      )}
    </div>
  );
}