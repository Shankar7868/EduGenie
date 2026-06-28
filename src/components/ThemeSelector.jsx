import React from "react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeSelector() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="flex items-center gap-2">
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        className="bg-secondary text-foreground border border-border px-3 py-1.5 rounded-lg text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
      >
        <option value="dark">Dark Theme</option>
        <option value="light">Light Theme</option>
        <option value="ocean">Ocean Theme</option>
      </select>
    </div>
  );
}
