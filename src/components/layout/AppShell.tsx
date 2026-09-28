"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearchModal } from "../common/GlobalSearchModal";
import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth gate check: Ensure unauthenticated users cannot see any interface
  useEffect(() => {
    if (pathname === "/") return;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/");
        }
      })
      .catch(() => {
        router.replace("/");
      });
  }, [pathname, router]);

  const { theme } = useTheme();

  // If on Landing / Website Home page, render full width without internal app shell
  if (pathname === "/") {
    return (
      <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-100">
        <main className="w-full">
          {children}
        </main>
        <Toaster position="top-right" richColors theme={theme} />
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#cbb292] dark:bg-slate-950 font-sans text-[#724916] dark:text-slate-100 chamber-app">
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
      <Toaster position="top-right" richColors theme={theme} />
    </div>
  );
}
