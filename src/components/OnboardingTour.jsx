import { useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";

export default function OnboardingTour() {
  const [run, setRun] = useState(false);

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
    },
    {
      target: "#tour-compare",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-rose-500">New: Compare Mode</h3>
          <p className="text-sm">Our new signature feature! Analyze 2 or 3 topics side-by-side in a beautifully formatted table.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-flashcard",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Flashcards</h3>
          <p className="text-sm">Automatically convert your study material into beautiful Anki-style cards for active recall.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-keypoints",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Key Points</h3>
          <p className="text-sm">Extract important concepts and highlights from long documents instantly.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-qna",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Q&A Generation</h3>
          <p className="text-sm">Generate exam-oriented questions and answers from your study material.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-summary",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Summary</h3>
          <p className="text-sm">Create concise and structured summaries for quick revision.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-quiz",
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">Interactive Quiz</h3>
          <p className="text-sm">Test your knowledge with an interactive conversational quiz generated from your notes.</p>
        </div>
      ),
      placement: "bottom",
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
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
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
