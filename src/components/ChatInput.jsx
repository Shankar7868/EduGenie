import { useRef, useState, useEffect } from "react";
import { SendIcon, UploadIcon, CloseIcon, FileIcon } from "./Icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative rounded-2xl bg-secondary/50 backdrop-blur-md border transition-all duration-300 shadow-sm overflow-hidden",
        isDragOver ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-border",
        "focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file && (
        <div className="flex items-center gap-2 mx-4 mt-4 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 max-w-fit">
          <FileIcon size={16} className="text-indigo-500 shrink-0" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.name}</span>
          <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
          <button 
            className="ml-2 text-muted-foreground hover:text-destructive transition-colors shrink-0" 
            onClick={removeFile}
            title="Remove file"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <label className="cursor-pointer p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 mb-1" title="Upload PDF notes">
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
          className="flex-1 max-h-[180px] min-h-[44px] py-3 bg-transparent border-none focus:outline-none resize-none text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <Button
          size="icon"
          className={cn(
            "mb-1 shrink-0 rounded-xl transition-all duration-300",
            (input.trim() || file) && !loading ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 hover:scale-105" : "bg-secondary text-muted-foreground"
          )}
          onClick={handleSubmit}
          disabled={loading || (!input.trim() && !file)}
          title="Send message"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
        </Button>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-indigo-500 rounded-2xl">
          <div className="flex flex-col items-center text-indigo-500 animate-bounce">
            <UploadIcon size={32} className="mb-2" />
            <span className="font-semibold tracking-tight">Drop PDF study notes here</span>
          </div>
        </div>
      )}
    </div>
  );
}