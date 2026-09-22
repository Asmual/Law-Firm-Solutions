"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
        isDark
          ? "border-slate-800 bg-slate-900 text-[#cca776] hover:bg-slate-800 hover:text-white hover:border-[#cca776]/50 shadow-sm"
          : "border-[#ab8c67] bg-[#dfceb7] text-black hover:bg-[#cca776] hover:text-black hover:border-[#8b6e40] shadow-sm"
      } ${showLabel ? "px-2.5 py-1.5 text-xs font-semibold" : "h-9 w-9"} ${className}`}
      title={isDark ? "Switch to Light Mode (#cca776 & Black)" : "Switch to Dark Mode (Obsidian & Gold)"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#cca776] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-black transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="capitalize">{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </button>
  );
}
