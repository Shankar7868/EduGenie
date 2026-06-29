import { useRef, useEffect } from "react";
import { SendIcon, UploadIcon } from "./Icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ChatInput({
  input,
  setInput,
  file, // Kept for compatibility but not used
  setFile,
  onSubmit,
  loading,
  placeholder = "Enter topic or notes..."
}) {
  const textareaRef = useRef(null);

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
    if (input.trim()) {
      onSubmit();
    }
  };

  const handleFileClick = (e) => {
    e.preventDefault();
    alert("PDF upload feature is currently undergoing maintenance and will be coming back soon!");
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl bg-secondary/50 backdrop-blur-md border transition-all duration-300 shadow-sm overflow-hidden",
        "border-border focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50"
      )}
    >
      <div className="flex items-end gap-2 p-3">
        <button 
          type="button"
          className="p-2 rounded-xl text-muted-foreground/50 hover:bg-secondary transition-colors shrink-0 mb-1 cursor-not-allowed" 
          title="PDF upload coming soon!"
          onClick={handleFileClick}
        >
          <UploadIcon size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          placeholder={placeholder}
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
            (input.trim()) && !loading ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 hover:scale-105" : "bg-secondary text-muted-foreground"
          )}
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          title="Send message"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
        </Button>
      </div>
    </div>
  );
}