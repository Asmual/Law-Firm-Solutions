"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  UserCircle2,
  Calendar,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentDateStr] = useState(() => {
    if (typeof window === "undefined") return "";
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur text-slate-100">
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="group flex h-9 w-64 md:w-96 items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-400 hover:border-[#cca776]/60 hover:text-slate-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#cca776] transition-colors" />
            <span className="truncate">Search Chamber File, Case No, Bank, Party...</span>
          </div>
          <kbd className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
            Ctrl K
          </kbd>
        </button>

        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-[#cca776]" />
          <span>{currentDateStr || "Court Calendar"}</span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Case Button */}
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#cca776] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-[#b8935f] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Case Entry</span>
        </Link>

        {/* Notifications */}
        <button
          title="Upcoming Court Hearings"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cca776] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cca776]"></span>
          </span>
        </button>

        {/* User Badge / Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200 ring-1 ring-slate-700 font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-100 leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#cca776] font-medium mt-0.5 uppercase tracking-wider">
                {currentUser.role} • {currentUser.chamberDesignation || "Practitioner"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="ml-1 p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs font-semibold text-[#cca776] hover:text-[#b8935f]"
          >
            <UserCircle2 className="h-5 w-5" />
            <span className="hidden md:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
