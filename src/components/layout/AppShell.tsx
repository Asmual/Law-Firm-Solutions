"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearchModal } from "../common/GlobalSearchModal";
import { Toaster, toast } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

// Inactivity timeout default: 30 minutes (1800000 ms)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastActivityRef = useRef(0);

  // Inactivity auto-logout handler
  const handleAutoLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.info("Session expired due to 30 minutes of inactivity.");
      router.replace("/");
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (pathname === "/") return;
    lastActivityRef.current = Date.now();

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
      }
    }, 60000); // Check every minute

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [pathname, handleAutoLogout]);

  // If on Landing / Website Home page, render full width without internal app shell
  if (pathname === "/") {
    return (
      <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-100">
        <main className="w-full">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  // Otherwise, render full Enterprise Chamber App Shell
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Toast Notification Provider */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
