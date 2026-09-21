"use client";

import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

/**
 * Normalizes any date string (YYYY-MM-DD or DD.MM.YYYY) into standard YYYY-MM-DD for native date picker.
 */
function toIsoDate(str: string): string {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // If DD.MM.YYYY
  const parts = str.split(".");
  if (parts.length === 3 && parts[2].length === 4) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return "";
}

/**
 * Converts standard YYYY-MM-DD to DD.MM.YYYY display format if user prefers,
 * or keeps value in sync.
 */
export function LegalDatePicker({
  value,
  onChange,
  placeholder = "DD.MM.YYYY",
  className,
  disabled = false,
  required = false,
  name,
  id,
}: LegalDatePickerProps) {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCalendar = () => {
    if (disabled) return;
    try {
      if (hiddenDateInputRef.current && typeof hiddenDateInputRef.current.showPicker === "function") {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current?.focus();
      }
    } catch {
      hiddenDateInputRef.current?.focus();
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // YYYY-MM-DD
    if (!iso) {
      onChange("");
      return;
    }
    // Return formatted as DD.MM.YYYY for manual input friendliness, or keep consistent
    const [year, month, day] = iso.split("-");
    if (year && month && day) {
      onChange(`${day}.${month}.${year}`);
    } else {
      onChange(iso);
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      {/* Visual Text Input allowing manual typing */}
      <input
        type="text"
        id={id}
        name={name}
        value={value || ""}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-2.5 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
      />

      {/* Clickable Calendar Icon Trigger */}
      <button
        type="button"
        onClick={handleOpenCalendar}
        disabled={disabled}
        title="Click to open calendar view"
        aria-label="Open calendar"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-800 text-[#cca776] hover:text-[#b8935f] transition-colors cursor-pointer disabled:opacity-40"
      >
        <Calendar className="h-3.5 w-3.5" />
      </button>

      {/* Hidden Native Date Input for showPicker() Calendar View */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={toIsoDate(value)}
        onChange={handleNativeDateChange}
        className="absolute bottom-0 right-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
