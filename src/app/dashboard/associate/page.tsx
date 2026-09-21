"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  Clock,
  Gavel,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { User, Case } from "@/types";

export default function AssociateDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/");
          return;
        }
        setCurrentUser(data.user);
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setIsChecking(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/cases?limit=25")
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) setCases(data.cases);
      })
      .catch(() => {});
  }, []);

  if (isChecking || !currentUser) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 rounded-xl bg-slate-900/80 border border-slate-800" />
          <div className="h-24 rounded-xl bg-slate-900/80 border border-slate-800" />
          <div className="h-24 rounded-xl bg-slate-900/80 border border-slate-800" />
          <div className="h-24 rounded-xl bg-slate-900/80 border border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 w-full">
      {/* 1. Top Executive Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 p-6 sm:p-7 text-white shadow-xl">
        {/* Blurred Chamber Background Image Asset */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105 opacity-25 pointer-events-none"
          style={{ backgroundImage: "url('/images/chamber-overview-bg.jpg')" }}
        />
        {/* High-Contrast Obsidian Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#cca776]/15 px-3 py-1 text-xs font-semibold text-[#cca776] border border-[#cca776]/30 whitespace-nowrap">
              <Gavel className="h-3.5 w-3.5" />
              <span>Associate Practice Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap truncate">
              Associate Chamber Diary
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Logged in as <strong className="text-[#cca776]">{currentUser.name}</strong> ({currentUser.chamberDesignation || "Associate"}). Record daily hearing outcomes, monitor High Court cause lists, and track bank file updates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all whitespace-nowrap cursor-pointer"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ Record New Case File</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Quick Action Cards (Stacked in clean 3-col grid where every title/subtitle fits on 1 line) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Link
          href="/cases/new"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#cca776]/60 transition-all dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776] shrink-0">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 truncate">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                Add / Edit Case File
              </h2>
              <p className="text-[11px] text-slate-500 whitespace-nowrap">Full 7-section case entry</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#cca776] transition-all shrink-0" />
        </Link>

        <Link
          href="/cause-list"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-500/60 transition-all dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0 truncate">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                Daily Cause List Tracker
              </h2>
              <p className="text-[11px] text-slate-500 whitespace-nowrap">Today&apos;s High Court hearings</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-400 transition-all shrink-0" />
        </Link>

        <Link
          href="/institutions"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500/60 transition-all dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 truncate">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                Bank Clients Directory
              </h2>
              <p className="text-[11px] text-slate-500 whitespace-nowrap">Focal persons &amp; branches</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all shrink-0" />
        </Link>
      </div>

      {/* 3. Pending Case Records for Order Updates (Stacked list, NO scrollbars, single-line items) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Files Pending Hearing Order / Status Entry
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update court order remarks and next hearing dates after daily court call over
            </p>
          </div>
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#cca776] hover:text-[#b8935f] shrink-0 whitespace-nowrap"
          >
            <span>View Full Case Registry</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stacked Cases - Zero scrollbar, single line items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No pending case records.
            </div>
          ) : (
            cases.slice(0, 5).map((c) => {
              const primaryCaseNo = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].caseNumber
                : "Pending Number";
              const primaryCourt = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].courtDivision
                : "High Court Division";
              const latestUpdate = c.statusUpdates && c.statusUpdates.length > 0
                ? c.statusUpdates[c.statusUpdates.length - 1]
                : null;

              return (
                <div
                  key={c._id || c.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col gap-2"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
                        {c.chamberFileNo}
                      </span>
                      <span className="text-xs font-bold text-[#cca776] shrink-0 whitespace-nowrap">
                        {c.institutionName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                        • {primaryCourt}
                      </span>
                    </div>

                    <Link
                      href={`/cases/new?id=${c._id || c.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[#cca776] hover:bg-[#cca776] hover:text-slate-950 transition-all border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      <span>+ Update Order / Remarks</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0 whitespace-nowrap">
                      {primaryCaseNo}
                    </span>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0 whitespace-nowrap">{c.matter}</span>
                    {latestUpdate?.statusRemarks && (
                      <>
                        <span className="shrink-0">•</span>
                        <span className="truncate italic">
                          &quot;{latestUpdate.statusRemarks}&quot;
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
