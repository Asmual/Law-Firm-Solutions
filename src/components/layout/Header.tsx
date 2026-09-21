/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  UserCircle2,
  Calendar,
  LogOut,
  Menu,
  ChevronDown,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/types";

const emptySubscribe = () => () => {};

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenSearch, onOpenMobileMenu }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safe client-side check to prevent React hydration mismatch
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const now = new Date();
  const dateParts = isClient
    ? {
        day: now.getDate().toString().padStart(2, "0"),
        month: now.toLocaleString("en-GB", { month: "short" }),
        year: now.getFullYear().toString(),
      }
    : null;

  // Fetch current user
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 backdrop-blur text-slate-100">
      {/* Left: Mobile Menu Toggle, Global Search Bar & Bold Date */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenSearch}
          className="group flex h-9 w-52 sm:w-72 md:w-80 lg:w-96 items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-400 hover:border-[#cca776]/60 hover:text-slate-200 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#cca776] transition-colors shrink-0" />
            <span className="truncate">Search File No, Case, Bank, Party...</span>
          </div>
          <kbd className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
            Ctrl K
          </kbd>
        </button>

        {/* Prominent & Modern Bold Date Display (e.g. 21 Sep 2026) */}
        <div className="hidden lg:flex items-center gap-2 text-xs border-l border-slate-800/80 pl-3.5 py-1 select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#cca776]/10 text-[#cca776] ring-1 ring-[#cca776]/30">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          {dateParts ? (
            <div className="flex items-baseline gap-1.5 font-sans">
              <span className="text-sm font-extrabold text-white tracking-tight">
                {dateParts.day}
              </span>
              <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                {dateParts.month}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {dateParts.year}
              </span>
            </div>
          ) : (
            <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* Right: Quick Actions & Profile Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Case Button */}
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#cca776] px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-[#b8935f] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Case</span>
        </Link>

        {/* Notifications */}
        <button
          title="Upcoming Court Hearings"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cca776] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cca776]"></span>
          </span>
        </button>

        {/* User Avatar & Role Trigger (Name hidden by default, opens dropdown on click) */}
        {currentUser ? (
          <div className="relative pl-2 border-l border-slate-800" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900/80 transition-all cursor-pointer group"
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

              {/* Only Current User Role Badge is shown (Full name is hidden by default) */}
              <div className="flex items-center gap-1">
                <span className="rounded-md bg-[#cca776]/15 px-2 py-0.5 text-[10px] font-bold text-[#cca776] border border-[#cca776]/30 uppercase tracking-wider">
                  {currentUser.role}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-[#cca776]" : ""
                  }`}
                />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl text-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Header in Dropdown with User Full Name & Email */}
                <div className="px-3 py-2.5 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#cca776] font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="capitalize">{currentUser.role} Counsel</span>
                  </div>
                </div>

                {/* Dropdown Navigation Actions */}
                <div className="py-1 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#cca776]/15 hover:text-[#cca776] transition-colors cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-[#cca776]" />
                    <span>View Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
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
            className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs font-semibold text-[#cca776] hover:text-[#b8935f]"
          >
            <UserCircle2 className="h-5 w-5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
