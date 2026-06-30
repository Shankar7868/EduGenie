import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { QnaIcon, SummaryIcon, KeyPointsIcon, FlashcardIcon, CompareIcon } from "./Icons";

export default function ModeCard({ title, description, onClick, highlight }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getIcon = () => {
    if (title.toLowerCase().includes("q&a")) return <QnaIcon size={32} className="text-blue-500" />;
    if (title.toLowerCase().includes("summary")) return <SummaryIcon size={32} className="text-purple-500" />;
    if (title.toLowerCase().includes("flashcard")) return <FlashcardIcon size={32} className="text-emerald-500" />;
    if (title.toLowerCase().includes("compare")) return <CompareIcon size={32} className="text-rose-500" />;
    return <KeyPointsIcon size={32} className="text-amber-500" />;
  };

  const getGradient = () => {
    if (title.toLowerCase().includes("q&a")) return "from-blue-500/10 to-transparent shadow-blue-500/5";
    if (title.toLowerCase().includes("summary")) return "from-purple-500/10 to-transparent shadow-purple-500/5";
    if (title.toLowerCase().includes("flashcard")) return "from-emerald-500/10 to-transparent shadow-emerald-500/5";
    if (title.toLowerCase().includes("compare")) return "from-rose-500/10 to-transparent shadow-rose-500/5";
    return "from-amber-500/10 to-transparent shadow-amber-500/5";
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex flex-col justify-between w-full max-w-[320px] h-[280px] p-6 cursor-pointer rounded-2xl border ${highlight ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]' : 'border-border/50 hover:shadow-indigo-500/20'} bg-background/50 backdrop-blur-xl bg-gradient-to-br transition-shadow hover:shadow-2xl ${getGradient()}`}
    >
      {highlight && (
        <div style={{ transform: "translateZ(60px)" }} className="absolute -top-3 -right-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-500 rounded-full blur animate-pulse opacity-50"></div>
            <span className="relative bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg border border-white/20">
              New
            </span>
          </div>
        </div>
      )}
      <div 
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="flex flex-row items-center justify-between pointer-events-none"
      >
        <div className="p-3 rounded-xl bg-secondary/80 ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
          {getIcon()}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:translate-x-1" />
      </div>
      
      <div style={{ transform: "translateZ(30px)" }} className="mt-4 flex-1 pointer-events-none">
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div style={{ transform: "translateZ(40px)" }} className="mt-4 pointer-events-none">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-indigo-500 transition-colors">
          Start Preparing
        </span>
      </div>
    </motion.div>
  );
}