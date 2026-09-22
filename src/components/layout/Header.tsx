/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  UserCircle2,
  Calendar,
  LogOut,
  Menu,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenSearch, onOpenMobileMenu }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const dateParts = {
    day: now.getDate().toString().padStart(2, "0"),
    month: now.toLocaleString("en-GB", { month: "short" }),
    year: now.getFullYear().toString(),
  };

  // Fetch current user & listen for profile updates
  useEffect(() => {
    const fetchUser = () => {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    };

    fetchUser();
    window.addEventListener("user-profile-updated", fetchUser);
    return () => {
      window.removeEventListener("user-profile-updated", fetchUser);
    };
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setDropdownOpen(false);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ab8c67] bg-[#cbb292]/95 px-4 sm:px-6 backdrop-blur text-black dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 transition-colors duration-200">
      {/* Left: Mobile Menu Toggle, Global Search Bar & Bold Date */}
      <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#ab8c67] bg-[#dfceb7] text-black hover:bg-[#cca776] hover:border-[#8b6e40] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer shrink-0"
          title="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Search Icon Trigger */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#ab8c67] bg-[#dfceb7] text-black hover:text-[#cca776] hover:border-[#8b6e40] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Desktop / Tablet Expanded Search Bar */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex group h-9 w-60 md:w-72 lg:w-96 items-center justify-between rounded-lg border border-[#ab8c67] bg-[#dfceb7] px-3 text-xs text-black hover:border-[#8b6e40] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer shrink-0"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-black/70 group-hover:text-black dark:text-slate-400 transition-colors shrink-0" />
            <span className="truncate font-medium">Search File No, Case, Bank, Party...</span>
          </div>
          <kbd className="hidden rounded bg-[#cbb292] border border-[#ab8c67] px-1.5 py-0.5 text-[10px] font-bold text-black dark:bg-slate-800 dark:text-slate-400 md:inline-block">
            Ctrl K
          </kbd>
        </button>

        {/* Prominent & Modern Bold Date Display (e.g. 21 Sep 2026) */}
        <div
          className="hidden xl:flex items-center gap-2 text-xs border-l border-[#ab8c67] dark:border-slate-800/80 pl-3.5 py-1 select-none shrink-0"
          suppressHydrationWarning
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#724916] text-[#cca776] ring-1 ring-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5 font-sans" suppressHydrationWarning>
            <span className="text-sm font-extrabold text-black dark:text-white tracking-tight" suppressHydrationWarning>
              {dateParts.day}
            </span>
            <span className="text-xs font-bold text-[#724916] dark:text-[#cca776] uppercase tracking-wider" suppressHydrationWarning>
              {dateParts.month}
            </span>
            <span className="text-xs font-semibold text-[#4a3e33] dark:text-slate-400" suppressHydrationWarning>
              {dateParts.year}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions, Theme Toggle & Profile Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Add Case Button */}
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#cca776] p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-[#b8935f] transition-colors shrink-0"
          title="Add New Case File"
        >
          <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline whitespace-nowrap">Add Case</span>
        </Link>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          title="Upcoming Court Hearings"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#ab8c67] bg-[#dfceb7] text-black hover:bg-[#cca776] hover:border-[#8b6e40] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cca776] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cca776]"></span>
          </span>
        </button>

        {/* User Avatar & Role Trigger (Name hidden by default, opens dropdown on click) */}
        {currentUser ? (
          <div className="relative pl-1 sm:pl-2 border-l border-[#ab8c67] dark:border-slate-800 shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-lg transition-colors cursor-pointer group focus:outline-none"
              title="Click to view profile options"
              aria-expanded={dropdownOpen}
            >
              {/* Circular Avatar */}
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#cca776]/60 group-hover:ring-[#cca776] shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776] ring-2 ring-[#cca776]/40 font-bold text-xs shrink-0 group-hover:bg-[#cca776]/25 transition-colors">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Current User Role Badge: Hidden on mobile, visible on sm and up, without any arrow */}
              <span className="hidden sm:inline-block rounded-md bg-[#cca776]/15 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#cca776] border border-[#cca776]/30 uppercase tracking-wider whitespace-nowrap">
                {currentUser.role}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-2 shadow-2xl backdrop-blur-xl text-black dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Header in Dropdown with User Full Name & Email */}
                <div className="px-3 py-2.5 border-b border-[#ab8c67] dark:border-slate-800">
                  <p className="text-xs font-bold text-black dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#4a3e33] dark:text-slate-400 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#724916] dark:text-[#cca776] font-bold">
                    <ShieldCheck className="h-3 w-3 text-[#cca776]" />
                    <span className="capitalize">{currentUser.role} Counsel</span>
                  </div>
                </div>

                {/* Dropdown Navigation Actions */}
                <div className="py-1 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-black hover:bg-[#cca776]/30 hover:text-black dark:text-slate-200 dark:hover:bg-[#cca776]/15 transition-colors cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
                    <span>View Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-800 hover:bg-rose-200/50 dark:text-rose-400 dark:hover:bg-rose-950/40 hover:text-rose-950 dark:hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 pl-2 border-l border-[#ab8c67] dark:border-slate-800 text-xs font-bold text-black hover:text-[#724916] dark:text-[#cca776] dark:hover:text-[#b8935f]"
          >
            <UserCircle2 className="h-5 w-5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
