import { useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  useEffect(() => {
    // Only run the tour if the user hasn't completed it before
    const hasCompletedTour = localStorage.getItem("edugenie_tour_completed");
    if (!hasCompletedTour) {
      // Small delay to ensure all elements are mounted and visible
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleRestart = () => {
      setTourKey(prev => prev + 1);
      setRun(true);
    };
    window.addEventListener("restart-tour", handleRestart);
    return () => window.removeEventListener("restart-tour", handleRestart);
  }, []);

  const steps = [
    {
      target: "body",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-indigo-600">Welcome to EduGenie 2.0! 🎉</h3>
          <p className="text-sm">Let's take a quick tour to explore the powerful new study tools available to you.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      showSkipButton: true,
    },
    {
      target: "#tour-mode-compare-mode",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-rose-500">New: Compare Mode</h3>
          <p className="text-sm">Select this mode to analyze 2 or 3 topics side-by-side in a beautifully formatted table! It's great for understanding differences.</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-mode-flashcards",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-emerald-500">Flashcards</h3>
          <p className="text-sm">Automatically generate interactive Anki-style 3D flashcards from your text to memorize concepts effectively.</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-mode-key-points",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-amber-500">Key Points</h3>
          <p className="text-sm">Extract the most important highlights and core definitions from long documents in seconds.</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-mode-q-a-generation",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-blue-500">Q&A Generation</h3>
          <p className="text-sm">Turn your notes into exam-oriented questions and answers. Perfect for test preparation!</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-mode-summary",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-purple-500">Summary</h3>
          <p className="text-sm">Create concise and perfectly structured markdown summaries for quick, high-yield revision.</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-mode-interactive-quiz",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-orange-500">Interactive Quiz</h3>
          <p className="text-sm">Test your knowledge with a conversational quiz generated directly from your notes!</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-theme-toggle",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Toggle Theme</h3>
          <p className="text-sm">Switch between Light and Dark mode anytime for a comfortable reading experience.</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    },
    {
      target: "#tour-auth-btn",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Save Your Progress</h3>
          <p className="text-sm">Sign in to save your chat history and pick up exactly where you left off. Happy studying!</p>
        </div>
      ),
      placement: "bottom",
      showSkipButton: true,
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem("edugenie_tour_completed", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      key={tourKey}
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      locale={{ skip: 'End Tour' }}
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#6366f1", // indigo-500
          backgroundColor: "var(--background)",
          textColor: "var(--foreground)",
          arrowColor: "var(--background)",
        },
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid var(--border)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          borderRadius: "8px",
          fontWeight: "bold",
        },
        buttonBack: {
          marginRight: "10px",
          color: "var(--muted-foreground)",
        },
        buttonSkip: {
          color: "var(--muted-foreground)",
        }
      }}
    />
  );
}
