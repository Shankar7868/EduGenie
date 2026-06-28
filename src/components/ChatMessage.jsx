import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon, SparklesIcon, FileIcon, ArrowLeftIcon, ArrowRightIcon, ExportIcon } from "./Icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ChatMessage({ role, content }) {
  const [copied, setCopied] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // Q&A State
  const [qnaData, setQnaData] = useState(null);

  // Summary State
  const [summaryData, setSummaryData] = useState(null);

  // Keypoints State
  const [keypointsData, setKeypointsData] = useState(null);

  // Parse custom modes if the message is from assistant
  useEffect(() => {
    if (role === "assistant" && content) {
      // 1. First try to parse as JSON for Quiz Mode
      try {
        const cleanContent = content.trim().replace(/^```(?:json)?|```$/gi, '').trim();
        const parsed = JSON.parse(cleanContent);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
          setQuizData(parsed);
          return;
        }
      } catch (e) {
        // Not a JSON quiz
      }

      // 2. Check for Summary Mode
      if (content.includes("## 📌 Overview") || content.includes("## 🔑 Key Concepts")) {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = null;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("## ")) {
            currentSection = line.replace("## ", "").trim();
            sections[currentSection] = [];
          } else if (currentSection && line) {
            sections[currentSection].push(line);
          }
        }
        for (const key in sections) {
          sections[key] = sections[key].join('\n\n').replace(/•\s*/g, '\n- ');
        }
        if (Object.keys(sections).length > 0) {
          setSummaryData(sections);
          return;
        }
      }

      // 3. Check for Keypoints Mode
      if (content.includes("## 📚 Core Definition") || content.includes("## ⚡ Key Points")) {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = null;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("## ")) {
            currentSection = line.replace("## ", "").trim();
            sections[currentSection] = [];
          } else if (currentSection && line) {
            sections[currentSection].push(line);
          }
        }
        for (const key in sections) {
          sections[key] = sections[key].join('\n\n').replace(/•\s*/g, '\n- ');
        }
        if (Object.keys(sections).length > 0) {
          setKeypointsData(sections);
          return;
        }
      }

      // 4. Check for QnA Mode
      if (content.match(/\*\*Q1/i) || content.match(/\*\*Q1\s*\[/i)) {
        const items = [];
        const lines = content.split('\n');
        let currentQ = "";
        let currentA = "";
        let inA = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const qMatch = line.match(/^\*\*(Q\d+.*?)\*\*\s*(.*)/i) || line.match(/^(Q\d+.*?):\s*(.*)/i);
          const aMatch = line.match(/^\*\*(A\d+.*?)\*\*\s*(.*)/i) || line.match(/^(A\d+.*?):\s*(.*)/i);
          
          if (qMatch) {
            if (currentQ && currentA) {
              items.push({ question: currentQ, answer: currentA.trim() });
            }
            currentQ = qMatch[1] + ": " + qMatch[2];
            currentA = "";
            inA = false;
          } else if (aMatch) {
            currentA = aMatch[2];
            inA = true;
          } else if (inA) {
            currentA += "\n" + line;
          } else if (currentQ) {
            currentQ += " " + line;
          }
        }
        if (currentQ && currentA) {
          items.push({ question: currentQ, answer: currentA.trim() });
        }
        if (items.length > 0) {
          setQnaData(items);
          return;
        }
      }

      // 5. Check for Flashcard Mode
      const lines = content.split('\n');
      const items = [];
      let currentQ = "";
      let currentA = "";
      let inA = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const qMatch = line.match(/^(?:\*\*)?(?:Question|Q|Front)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
        if (qMatch) {
          if (currentQ && currentA) {
            items.push({ question: currentQ, answer: currentA.trim() });
          }
          currentQ = qMatch[1].trim();
          currentA = "";
          inA = false;
          continue;
        }

        const aMatch = line.match(/^(?:\*\*)?(?:Answer|A|Back)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
        if (aMatch) {
          currentA = aMatch[1].trim();
          inA = true;
          continue;
        }

        if (line.match(/^🃏?\s*(?:\*\*)?Card\s+\d+(?:\*\*)?/i)) continue;
        if (line.match(/^---+$/)) continue;

        if (inA) {
          currentA += "\n" + line;
        } else if (currentQ && !inA) {
          currentQ += " " + line;
        }
      }

      if (currentQ && currentA) {
        items.push({ question: currentQ, answer: currentA.trim() });
      }
      
      if (items.length > 0) {
        setFlashcards(items);
      }
    }
  }, [role, content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'study_notes.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuizOptionSelect = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: option
    }));
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    }
  };

  const prevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setQuizFinished(true);
  };

  const toggleCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-5 mb-2.5 text-foreground" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-2.5 text-foreground" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-5 mb-2.5 text-foreground" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-base font-bold mt-5 mb-2.5 text-foreground" {...props} />,
    p: ({node, ...props}) => <p className="mb-3.5 last:mb-0 leading-relaxed" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5" {...props} />,
    li: ({node, ...props}) => <li className="" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 bg-muted/50 py-2.5 px-4 my-3 rounded-r-lg text-muted-foreground italic" {...props} />,
    table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-border"><table className="w-full border-collapse text-sm text-left" {...props} /></div>,
    th: ({node, ...props}) => <th className="border-b border-border bg-muted px-4 py-3 font-semibold text-foreground" {...props} />,
    td: ({node, ...props}) => <td className="border-b border-border px-4 py-3 last:border-b-0" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="my-4 overflow-hidden rounded-xl border border-border bg-[#1e1e1e] shadow-sm">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-muted/80 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (flashcards.length === 0) return;
    
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "ArrowLeft") {
        prevCard();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards.length, currentCardIndex]);

  const isUser = role === "user";

  return (
    <div className={cn(
      "flex flex-col gap-2 w-full animate-in fade-in duration-300 slide-in-from-bottom-2",
      isUser ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "flex justify-between items-center px-1 w-full",
        isUser ? "max-w-[90%] md:max-w-[85%] lg:max-w-[75%]" : "max-w-full"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isUser && "ml-auto"
        )}>
          {isUser ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-600 text-white shadow-sm">U</div>
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-indigo-500 border border-border shadow-[0_0_10px_rgba(99,102,241,0.1)]">
              <SparklesIcon size={14} />
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">{isUser ? "You" : "EduGenie"}</span>
        </div>

        {!isUser && (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/5 hover:text-foreground" onClick={handleExport} title="Download/Export">
              <ExportIcon size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/5 hover:text-foreground" onClick={handleCopy} title="Copy response">
              {copied ? <CheckIcon size={16} className="text-indigo-400" /> : <CopyIcon size={16} />}
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "rounded-2xl p-4 sm:p-5 text-[0.95rem] leading-[1.6] break-words transition-all duration-300 shadow-sm",
        isUser 
          ? "bg-indigo-600 text-white rounded-tr-sm self-end max-w-[95%] md:max-w-[85%] lg:max-w-[75%]" 
          : "bg-secondary/50 text-foreground rounded-tl-sm self-start border border-border/50 backdrop-blur-sm w-full"
      )}>
        {quizData && quizData.length > 0 && !isUser ? (
          <div className="w-full">
            {quizFinished ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Quiz Results</h3>
                  <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold text-lg shadow-sm">
                    {quizData.filter((q, i) => userAnswers[i] === q.answer).length} / {quizData.length}
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  {quizData.map((q, i) => {
                    const isCorrect = userAnswers[i] === q.answer;
                    return (
                      <Card key={i} className={cn(
                        "p-5 flex flex-col gap-3 bg-muted/30 border-l-4 shadow-sm",
                        isCorrect ? "border-l-green-500" : "border-l-red-500"
                      )}>
                        <div className="text-base"><strong>Q{i + 1}:</strong> {q.question}</div>
                        <div className="flex gap-3 items-center flex-wrap">
                          <span className={cn(
                            "px-3 py-1 rounded text-sm font-semibold border",
                            isCorrect ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-red-500/10 text-red-500 border-red-500/30"
                          )}>You: {userAnswers[i] || 'None'}</span>
                          {!isCorrect && <span className="px-3 py-1 rounded text-sm font-semibold border bg-green-500/10 text-green-500 border-green-500/30">Correct: {q.answer}</span>}
                        </div>
                        <div className="text-[0.95rem] text-muted-foreground mt-2 bg-background/80 p-3 rounded-lg border border-border/50"><strong>Explanation:</strong> {q.explanation}</div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
                <div className="flex items-center gap-6 mb-4">
                  <Button variant="outline" size="icon" className="rounded-full w-10 h-10 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all" onClick={prevQuizQuestion} disabled={currentQuizIndex === 0}>
                    <ArrowLeftIcon size={18} />
                  </Button>
                  <span className="text-lg font-bold text-foreground min-w-[60px] text-center">{currentQuizIndex + 1} / {quizData.length}</span>
                  <Button variant="outline" size="icon" className="rounded-full w-10 h-10 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all" onClick={nextQuizQuestion} disabled={currentQuizIndex === quizData.length - 1}>
                    <ArrowRightIcon size={18} />
                  </Button>
                </div>
                <div className="w-full">
                  <Card className="bg-muted/20 border-border/50 shadow-sm p-6 flex flex-col gap-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Question {currentQuizIndex + 1}</div>
                    <div className="text-lg font-semibold text-foreground">
                      <ReactMarkdown components={markdownComponents}>{quizData[currentQuizIndex].question}</ReactMarkdown>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(quizData[currentQuizIndex].options || [quizData[currentQuizIndex].answer || "True", "False"]).map((opt, idx) => {
                        const isSelected = userAnswers[currentQuizIndex] === opt;
                        return (
                          <button 
                            key={idx} 
                            className={cn(
                              "px-4 py-3.5 rounded-xl text-left text-base cursor-pointer transition-all border",
                              isSelected 
                                ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 font-semibold ring-1 ring-indigo-500 ring-offset-background" 
                                : "bg-background border-border text-foreground hover:bg-muted hover:border-muted-foreground"
                            )}
                            onClick={() => handleQuizOptionSelect(opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                  {currentQuizIndex === quizData.length - 1 && (
                    <div className="flex flex-col items-center mt-6 gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 h-auto rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg" 
                        onClick={submitQuiz} 
                        disabled={Object.keys(userAnswers).length !== quizData.length}
                      >
                        Submit Quiz
                      </Button>
                      {Object.keys(userAnswers).length !== quizData.length && (
                        <div className="text-sm text-red-500 font-medium bg-red-500/10 px-3 py-1.5 rounded-full">Please answer all questions before submitting.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : qnaData && qnaData.length > 0 && !isUser ? (
          <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-indigo-500 border-b border-border/50 pb-2 flex items-center gap-2">
              Q&A Study Guide
            </h3>
            <div className="flex flex-col gap-4">
              {qnaData.map((item, idx) => (
                <Card key={idx} className="bg-card/50 border-border/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30">
                  <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border-b border-border/50">
                    <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shrink-0 shadow-sm">Q{idx + 1}</div>
                    <div className="font-semibold text-base text-foreground leading-snug [&>p]:m-0"><ReactMarkdown components={markdownComponents}>{item.question.replace(/^Q\d+.*?:\s*/i, '')}</ReactMarkdown></div>
                  </div>
                  <div className="p-4 text-muted-foreground leading-relaxed [&>p:last-child]:mb-0">
                    <ReactMarkdown components={markdownComponents}>{item.answer}</ReactMarkdown>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : summaryData && Object.keys(summaryData).length > 0 && !isUser ? (
          <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-indigo-500 border-b border-border/50 pb-2 flex items-center gap-2">
              Summary Notes
            </h3>
            <div className="flex flex-col gap-4">
              {Object.keys(summaryData).map((sectionKey, idx) => {
                const isOverview = sectionKey.includes('Overview');
                const isFacts = sectionKey.includes('Facts');
                return (
                  <Card key={idx} className={cn(
                    "overflow-hidden border transition-all duration-300 hover:shadow-md",
                    isOverview ? "bg-indigo-500/5 border-indigo-500/20" : isFacts ? "bg-pink-500/5 border-l-4 border-l-pink-500 border-y-border/50 border-r-border/50" : "bg-card/50 border-border/50 hover:border-indigo-500/30"
                  )}>
                    <div className={cn(
                      "font-bold px-4 py-3 bg-black/5 dark:bg-black/20 border-b border-border/50 text-foreground flex items-center gap-2",
                      isOverview && "text-indigo-500",
                      isFacts && "text-pink-500"
                    )}>{sectionKey.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '')}</div>
                    <div className="p-4 text-muted-foreground leading-relaxed [&>p:last-child]:mb-0">
                      <ReactMarkdown components={markdownComponents}>{summaryData[sectionKey]}</ReactMarkdown>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : keypointsData && Object.keys(keypointsData).length > 0 && !isUser ? (
          <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-indigo-500 border-b border-border/50 pb-2 flex items-center gap-2">
              Keypoints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(keypointsData).map((sectionKey, idx) => {
                const isHero = sectionKey.includes('Definition');
                const isWarning = sectionKey.includes('Misconceptions');
                return (
                  <Card key={idx} className={cn(
                    "p-5 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                    isHero ? "bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-indigo-500/30 text-center md:col-span-2" : isWarning ? "bg-amber-500/5 border-l-4 border-l-amber-500 border-y-border/50 border-r-border/50" : "bg-card/50 border-border/50 hover:border-indigo-500/30"
                  )}>
                    <div className={cn(
                      "font-bold mb-3 text-foreground flex items-center gap-2",
                      isHero ? "text-xl text-indigo-500 justify-center" : isWarning ? "text-amber-500" : "text-foreground"
                    )}>{sectionKey.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '')}</div>
                    <div className={cn(
                      "text-muted-foreground leading-relaxed [&>p:last-child]:mb-0",
                      isHero && "text-lg",
                      !isHero && "[&>ul]:pl-5 [&>ul>li]:mb-1.5"
                    )}>
                      <ReactMarkdown components={markdownComponents}>{keypointsData[sectionKey]}</ReactMarkdown>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : flashcards.length > 0 && !isUser ? (
          <div className="flex flex-col items-center w-full gap-5 py-2 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-11 h-11 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                onClick={prevCard} 
                disabled={currentCardIndex === 0}
                title="Previous Card"
              >
                <ArrowLeftIcon size={20} />
              </Button>
              <span className="text-xl font-bold text-foreground min-w-[70px] text-center bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                {currentCardIndex + 1} <span className="text-muted-foreground text-sm font-medium mx-1">/</span> {flashcards.length}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-11 h-11 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                onClick={nextCard} 
                disabled={currentCardIndex === flashcards.length - 1}
                title="Next Card"
              >
                <ArrowRightIcon size={20} />
              </Button>
            </div>
            <div className="w-full max-w-[800px] flex justify-center [perspective:1200px]">
              <div
                className="w-full min-h-[350px] cursor-pointer group"
                onClick={() => toggleCard(currentCardIndex)}
              >
                <div className={cn(
                  "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] rounded-2xl shadow-md border border-border/50",
                  flippedCards[currentCardIndex] ? "[transform:rotateY(180deg)]" : "group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-indigo-500/30"
                )}>
                  {/* Front */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 text-foreground">
                    <div className="text-sm font-bold uppercase tracking-wider text-indigo-500 mb-2">Card {currentCardIndex + 1} <span className="opacity-70 mx-1">•</span> Question</div>
                    <div className="text-xl md:text-2xl font-semibold text-center my-auto leading-relaxed line-clamp-6">
                      <ReactMarkdown components={markdownComponents}>{flashcards[currentCardIndex].question}</ReactMarkdown>
                    </div>
                    <div className="text-xs text-center text-muted-foreground uppercase tracking-widest font-semibold mt-4 flex items-center justify-center gap-2">
                      <span className="w-8 h-[1px] bg-border"></span> Click to flip <span className="w-8 h-[1px] bg-border"></span>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 flex flex-col justify-between rounded-2xl bg-card text-foreground [transform:rotateY(180deg)] border-2 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                    <div className="text-sm font-bold uppercase tracking-wider text-pink-500 mb-2">Answer</div>
                    <ScrollArea className="h-[220px] w-full my-2 pr-3">
                      <div className="text-lg md:text-xl font-medium text-center leading-relaxed flex items-center justify-center min-h-full">
                        <ReactMarkdown components={markdownComponents}>{flashcards[currentCardIndex].answer}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                    <div className="text-xs text-center text-muted-foreground uppercase tracking-widest font-semibold mt-4 flex items-center justify-center gap-2">
                      <span className="w-8 h-[1px] bg-border"></span> Click to flip <span className="w-8 h-[1px] bg-border"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}