"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearchModal } from "../common/GlobalSearchModal";
import { Toaster } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
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
