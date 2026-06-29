import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ModeCard from "../components/ModeCard";
import { SparklesIcon } from "../components/Icons";
import ThemeSelector from "../components/ThemeSelector";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthProvider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const modes = [
    {
      title: "Q&A Generation",
      description: "Generate exam-oriented questions and answers from your study material.",
      route: "/chat/qna",
    },
    {
      title: "Summary",
      description: "Create concise and structured summaries for quick revision.",
      route: "/chat/summary",
    },
    {
      title: "Key Points",
      description: "Extract important concepts and highlights from documents.",
      route: "/chat/keypoints",
    },
    {
      title: "Flashcards",
      description: "Automatically convert study material into beautiful Anki-style cards.",
      route: "/chat/flashcard",
    },
    {
      title: "Interactive Quiz",
      description: "Test your knowledge with an interactive conversational quiz generated from your notes.",
      route: "/chat/quiz",
    },
  ];

  const features = [
    {
      title: "PDF Uploads (Coming Soon)",
      desc: "Drag and drop study materials, PDFs, or lecture notes directly. Currently disabled for maintenance."
    },
    {
      title: "Interactive Flashcards",
      desc: "Automatically convert Q&A text into beautiful study cards."
    },
    {
      title: "Export & Download",
      desc: "Download your flashcards and summaries instantly as mobile-friendly plain text files."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background w-full">
      {/* Decorative 3D floating blur orbs with motion */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
          x: [0, 50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-100px] right-[-50px] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] left-[-100px] w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[120px] pointer-events-none z-0"
      />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-[1]"></div>

      <header className="h-20 flex justify-between items-center px-6 md:px-10 border-b border-border/40 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.35)] ring-1 ring-white/10"
          >
            <img src="/logo.jpg" alt="EduGenie Logo" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground">EduGenie</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSelector />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden md:inline-block truncate max-w-[150px]">{user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          ) : (
            <AuthModal />
          )}
        </div>
      </header>

      <main className="flex-1 w-full mx-auto py-16 md:py-24 z-10 relative flex flex-col gap-24">
        
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center max-w-4xl mx-auto px-6 md:px-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-secondary/50 border border-border/50 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground mb-8 shadow-sm backdrop-blur-sm">
            <SparklesIcon size={14} className="text-indigo-500" />
            <span>EduGenie v2.0 Workspace</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
            Your AI-Powered <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500">Exam Preparation</span> Assistant
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Experience the next generation of learning. Instantly extract summaries, interactive flashcards, and exam questions from your course materials.
          </motion.p>
        </motion.section>

        {/* 3D Draggable Carousel Section */}
        <section className="flex flex-col w-full">
          <div className="px-6 md:px-12 xl:px-24 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Select a Study Mode</h2>
            <p className="text-muted-foreground mt-2">Drag to explore interactive preparation tools.</p>
          </div>
          
          <div className="w-full overflow-x-auto pb-12 pt-4 px-6 md:px-12 xl:px-24 snap-x snap-mandatory hide-scrollbar">
            <div className="flex gap-6 w-max pr-6 md:pr-12">
              {modes.map((mode) => (
                <div key={mode.title} className="snap-center shrink-0">
                  <ModeCard
                    title={mode.title}
                    description={mode.description}
                    onClick={() => navigate(mode.route)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center w-full max-w-7xl mx-auto px-6 md:px-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {features.map((feat, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-secondary/30 backdrop-blur-md border border-border/50 transition-all duration-300 hover:border-indigo-500/50 hover:bg-secondary/50">
                <h4 className="text-xl font-bold mb-3 text-foreground">{feat.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="p-10 text-center border-t border-border/40 text-muted-foreground text-sm z-10 relative backdrop-blur-sm">
        <p>© 2026 EduGenie. Developed to make studying effortless and smart.</p>
      </footer>
    </div>
  );
}