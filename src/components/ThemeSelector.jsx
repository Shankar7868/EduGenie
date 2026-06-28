import React from "react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeSelector() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="theme-selector" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="dark">Dark Theme</option>
        <option value="light">Light Theme</option>
        <option value="ocean">Ocean Theme</option>
      </select>
    </div>
  );
}
