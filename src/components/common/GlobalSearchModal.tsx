"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Briefcase, Building2, UserCircle2, ArrowRight } from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-[#cca776] shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Chamber File (e.g. CF-2024), Case No, Bank, Party Name..."
            autoFocus
            className="w-full bg-transparent px-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Suggestions / Links */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2 text-xs">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Navigation
          </div>

          <button
            onClick={() => handleSelect("/cases")}
            className="w-full flex items-center justify-between rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-[#cca776]" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Case Registry</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Browse all active and disposed litigation files</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => handleSelect("/institutions")}
            className="w-full flex items-center justify-between rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-blue-500" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Banks &amp; Financial Institutions</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">View 100+ corporate clients, branches and focal persons</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => handleSelect("/reports")}
            className="w-full flex items-center justify-between rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-4 w-4 text-emerald-500" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Client Reports &amp; Letterhead</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Generate monthly latest position reports &amp; associate workloads</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950">
          <span>Press <kbd className="rounded bg-slate-200 dark:bg-slate-800 px-1 py-0.5 text-slate-700 dark:text-slate-300">Esc</kbd> to close</span>
          <span>Tip: Press <kbd className="rounded bg-slate-200 dark:bg-slate-800 px-1 py-0.5 text-slate-700 dark:text-slate-300">Ctrl + K</kbd> anytime</span>
        </div>
      </div>
    </div>
  );
}
