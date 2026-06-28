import { ArrowRight } from "lucide-react";
import { QnaIcon, SummaryIcon, KeyPointsIcon, FlashcardIcon } from "./Icons";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function ModeCard({ title, description, onClick }) {
  const getIcon = () => {
    if (title.toLowerCase().includes("q&a")) {
      return <QnaIcon size={32} className="text-blue-500" />;
    } else if (title.toLowerCase().includes("summary")) {
      return <SummaryIcon size={32} className="text-purple-500" />;
    } else if (title.toLowerCase().includes("flashcard")) {
      return <FlashcardIcon size={32} className="text-emerald-500" />;
    } else {
      return <KeyPointsIcon size={32} className="text-amber-500" />;
    }
  };

  const getGradient = () => {
    if (title.toLowerCase().includes("q&a")) return "group-hover:from-blue-500/10 group-hover:to-transparent";
    if (title.toLowerCase().includes("summary")) return "group-hover:from-purple-500/10 group-hover:to-transparent";
    if (title.toLowerCase().includes("flashcard")) return "group-hover:from-emerald-500/10 group-hover:to-transparent";
    return "group-hover:from-amber-500/10 group-hover:to-transparent";
  };

  return (
    <Card 
      onClick={onClick}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 border-border/50 bg-background/50 backdrop-blur-xl bg-gradient-to-br ${getGradient()}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="p-2.5 rounded-xl bg-secondary/50 ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
          {getIcon()}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:translate-x-1" />
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
      <CardFooter>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-indigo-500 transition-colors">
          Start Preparing
        </span>
      </CardFooter>
    </Card>
  );
}