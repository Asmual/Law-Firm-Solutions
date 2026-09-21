"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  ArrowUpRight,
  Clock,
  Gavel,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { User, Case } from "@/types";

export default function AdvocateDashboardPage() {
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
    fetch("/api/cases?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          setCases(data.cases);
        }
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

  // Filter cases assigned to current advocate (or show chamber cases if advocate name matches)
  const myCases = cases.filter((c) => {
    const advName = c.assignedAdvocate?.advocateName?.toLowerCase() || "";
    const currentName = currentUser.name.toLowerCase();
    return advName.includes(currentName) || currentName.includes(advName) || c.assignedAdvocate?.advocateId === currentUser.id;
  });

  const displayCases = myCases.length > 0 ? myCases : cases;
  const runningCasesCount = displayCases.filter((c) => c.status !== "disposed" && c.status !== "decreed").length;
  const disposedCasesCount = displayCases.filter((c) => c.status === "disposed" || c.status === "decreed").length;

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
              <span>Advocate Practice Suite</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap truncate">
              Advocate Litigation Workspace
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Welcome, <strong className="text-[#cca776]">{currentUser.name}</strong> ({currentUser.chamberDesignation || "Advocate"}). Monitor your assigned writ petitions, Artha Rin recovery hearings, and upcoming cause list positions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all whitespace-nowrap cursor-pointer"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ Record New Case</span>
            </Link>
            <Link
              href="/cause-list"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all whitespace-nowrap cursor-pointer"
            >
              <Clock className="h-4 w-4 text-[#cca776]" />
              <span>Cause List Schedule</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Row - Clean, single-line stats with ample width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap block truncate">
              Assigned Active Files
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {runningCasesCount}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap truncate">
                High Court &amp; Artha Rin
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 overflow-hidden">
            <FileText className="h-5 w-5 shrink-0" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap block truncate">
              Total Assigned Files
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#cca776]">
                {displayCases.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap truncate">
                In Chamber Register
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#cca776]/10 text-[#cca776] overflow-hidden">
            <Gavel className="h-5 w-5 shrink-0" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap block truncate">
              Concluded &amp; Decreed
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {disposedCasesCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap truncate">
                Disposed in Chamber
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 overflow-hidden">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. Assigned Litigation Files & Hearings Section (Stacked cleanly, NO scrollbars, Single-line items) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776] shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                Assigned Case Files & Hearing Positions
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authoritative chamber records assigned to your litigation portfolio
              </p>
            </div>
          </div>
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#cca776] hover:text-[#b8935f] shrink-0 whitespace-nowrap"
          >
            <span>View All Cases</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stacked Cases List - One below another, zero horizontal scrollbar, single-line text layout */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No assigned case files found.
            </div>
          ) : (
            displayCases.map((c) => {
              const latestUpdate = c.statusUpdates && c.statusUpdates.length > 0
                ? c.statusUpdates[c.statusUpdates.length - 1]
                : null;
              const primaryCaseNo = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].caseNumber
                : "No Case No";
              const primaryCourt = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].courtDivision
                : "High Court Division";

              const nextHearing = latestUpdate?.nextHearingDate || latestUpdate?.updateDate;
              const isDisposed = c.status === "disposed" || c.status === "decreed";

              return (
                <div
                  key={c._id || c.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col gap-2.5"
                >
                  {/* Line 1: Chamber File, Institution Name, Court Division, Status, and Action Link */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                      {/* File No Badge */}
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
                        {c.chamberFileNo}
                      </span>

                      {/* Institution / Bank */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#cca776] shrink-0 whitespace-nowrap">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{c.institutionName}</span>
                      </div>

                      {/* Court / Bench */}
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                        • {primaryCourt}
                      </span>
                    </div>

                    {/* Right side: Status Badge + Next Hearing Date + Link */}
                    <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
                      {nextHearing && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          <Calendar className="h-3 w-3 text-[#cca776]" />
                          <span>{nextHearing}</span>
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                          isDisposed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30"
                        }`}
                      >
                        {isDisposed ? "Decreed / Disposed" : "Active Litigation"}
                      </span>

                      <Link
                        href={`/cases/new?id=${c._id || c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[#cca776] hover:bg-[#cca776] hover:text-slate-950 transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer"
                      >
                        <span>Open File</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Line 2: Case Numbers, Matter, Parties & Order Summary (Single line with truncate) */}
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0 whitespace-nowrap">
                        {primaryCaseNo}
                      </span>
                      <span className="text-slate-400 shrink-0">•</span>
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                        {c.matter}
                      </span>
                      {latestUpdate?.statusRemarks && (
                        <>
                          <span className="text-slate-400 shrink-0">•</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate italic">
                            &quot;{latestUpdate.statusRemarks}&quot;
                          </span>
                        </>
                      )}
                    </div>
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
