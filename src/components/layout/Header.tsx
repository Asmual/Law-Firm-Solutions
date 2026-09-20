"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  UserCircle2,
  Calendar,
} from "lucide-react";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const [currentDateStr] = useState(() => {
    if (typeof window === "undefined") return "";
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/90">
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="group flex h-9 w-64 md:w-96 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 hover:border-amber-400/80 hover:bg-white hover:text-slate-900 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-amber-500/50 dark:hover:text-slate-200"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            <span className="truncate">Search Chamber File, Case No, Bank, Party...</span>
          </div>
          <kbd className="hidden rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block dark:bg-slate-800 dark:text-slate-400">
            Ctrl K
          </kbd>
        </button>

        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>{currentDateStr || "Court Calendar"}</span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Case Button */}
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Case Entry</span>
        </Link>

        {/* Notifications */}
        <button
          title="Upcoming Court Hearings"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
              Senior Partner
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              High Court Division
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
