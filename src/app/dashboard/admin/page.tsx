"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  Database,
  ChevronRight,
  Users,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { User, Case, Institution } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/");
          return;
        }

        if (data.user.role !== "admin" && data.user.role !== "partner") {
          toast.error("Access restricted: Admin/Managing Partner privileges required.");
          router.replace(
            data.user.role === "advocate"
              ? "/dashboard/advocate"
              : "/dashboard/associate"
          );
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
        if (data.cases) setCases(data.cases);
      })
      .catch(() => {});

    fetch("/api/institutions?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) setInstitutions(data.institutions);
      })
      .catch(() => {});
  }, []);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Sample data seeded successfully!");
        // Refresh cases
        const casesRes = await fetch("/api/cases?limit=50");
        const casesData = await casesRes.json();
        if (casesData.cases) setCases(casesData.cases);
      } else {
        toast.error(data.error || "Failed to seed sample data");
      }
    } catch {
      toast.error("Could not connect to database. Make sure MongoDB is running.");
    } finally {
      setIsSeeding(false);
    }
  };

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

  const activeCasesCount = cases.filter((c) => c.status !== "disposed" && c.status !== "decreed").length;
  const disposedCasesCount = cases.filter((c) => c.status === "disposed" || c.status === "decreed").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 w-full">
      {/* 1. Top Executive Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-6 sm:p-7 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#724916] px-3 py-1 text-xs font-bold text-[#cca776] border border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30 whitespace-nowrap">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin &amp; Managing Partner Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172B] dark:text-white whitespace-nowrap truncate">
              Executive Chamber Overview
            </h1>
            <p className="text-xs text-[#4a3e33] dark:text-slate-300 leading-relaxed max-w-2xl">
              Logged in as <strong className="text-[#724916] dark:text-[#cca776] font-bold">{currentUser.name}</strong> (Managing Partner • Admin). Full oversight of 100+ banking institutions, case assignments, associate workloads, and firm-wide recovery decrees.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 rounded-xl bg-[#724916] px-4 py-2.5 text-xs font-bold text-[#cca776] shadow-md hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] transition-all whitespace-nowrap cursor-pointer"
            >
              <Briefcase className="h-4 w-4" />
              <span>Monitor All Cases</span>
            </Link>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cbb292] px-4 py-2.5 text-xs font-bold text-[#0F172B] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700 transition-all whitespace-nowrap cursor-pointer"
            >
              <Users className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Manage Roles &amp; Team</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Metric Cards - Unified Clean Palette (#0F172B Numbers, #724916 / #cca776 Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Active Cases */}
        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3 group hover:border-[#724916] transition-all">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400 whitespace-nowrap block truncate">
              Active Litigation Files
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172B] dark:text-white">
                {activeCasesCount}
              </span>
              <span className="text-xs font-semibold text-[#4a3e33] dark:text-slate-400 whitespace-nowrap truncate">
                High Court &amp; Artha Rin
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] overflow-hidden">
            <Briefcase className="h-5 w-5 shrink-0" />
          </div>
        </div>

        {/* Card 2: Banks & Clients */}
        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3 group hover:border-[#724916] transition-all">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400 whitespace-nowrap block truncate">
              Corporate &amp; Bank Clients
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172B] dark:text-white">
                {institutions.length > 0 ? `${institutions.length}+` : "15+"}
              </span>
              <span className="text-xs font-semibold text-[#4a3e33] dark:text-slate-400 whitespace-nowrap truncate">
                Institutions &amp; Branches
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] overflow-hidden">
            <Building2 className="h-5 w-5 shrink-0" />
          </div>
        </div>

        {/* Card 3: Total Cases */}
        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3 group hover:border-[#724916] transition-all">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400 whitespace-nowrap block truncate">
              Total Case Registry
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172B] dark:text-white">
                {cases.length}
              </span>
              <span className="text-xs font-semibold text-[#4a3e33] dark:text-slate-400 whitespace-nowrap truncate">
                Recorded Files
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] overflow-hidden">
            <CalendarDays className="h-5 w-5 shrink-0" />
          </div>
        </div>

        {/* Card 4: Disposed / Concluded */}
        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3 group hover:border-[#724916] transition-all">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400 whitespace-nowrap block truncate">
              Disposed &amp; Decreed
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172B] dark:text-white">
                {disposedCasesCount}
              </span>
              <span className="text-xs font-semibold text-[#4a3e33] dark:text-slate-400 whitespace-nowrap truncate">
                Decreed in favor
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] overflow-hidden">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. Admin Modules Grid - Clean & Unified (Max 3 colors: #0F172B, #4a3e33, #724916 / #cca776) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Link
          href="/team"
          className="group rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 shadow-sm hover:border-[#724916] transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 truncate">
                <h2 className="text-xs font-bold text-[#0F172B] dark:text-white group-hover:text-[#724916] dark:group-hover:text-[#cca776] transition-colors whitespace-nowrap">
                  Team &amp; Role Control
                </h2>
                <p className="text-[11px] text-[#4a3e33] dark:text-slate-400 whitespace-nowrap">
                  Elevate roles &amp; assign advocates
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-[#4a3e33] dark:text-slate-400 leading-relaxed">
              Manage chamber practitioners, bar enrollment credentials, and role privileges.
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-[#724916] dark:text-[#cca776] whitespace-nowrap">
            <span>Manage Chamber Team</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/institutions"
          className="group rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 shadow-sm hover:border-[#724916] transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 truncate">
                <h2 className="text-xs font-bold text-[#0F172B] dark:text-white group-hover:text-[#724916] dark:group-hover:text-[#cca776] transition-colors whitespace-nowrap">
                  100+ Banks &amp; Clients
                </h2>
                <p className="text-[11px] text-[#4a3e33] dark:text-slate-400 whitespace-nowrap">
                  Focal persons &amp; branch directories
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-[#4a3e33] dark:text-slate-400 leading-relaxed">
              Browse corporate bank directories, SAMD divisions, branch contacts, and case volumes.
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-[#724916] dark:text-[#cca776] whitespace-nowrap">
            <span>Open Institution Registry</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports"
          className="group rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 shadow-sm hover:border-[#724916] transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0 truncate">
                <h2 className="text-xs font-bold text-[#0F172B] dark:text-white group-hover:text-[#724916] dark:group-hover:text-[#cca776] transition-colors whitespace-nowrap">
                  Official Letterhead Reports
                </h2>
                <p className="text-[11px] text-[#4a3e33] dark:text-slate-400 whitespace-nowrap">
                  Monthly statements for banks
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-[#4a3e33] dark:text-slate-400 leading-relaxed">
              Generate formal litigation statements formatted with official chamber letterhead for banks.
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-[#724916] dark:text-[#cca776] whitespace-nowrap">
            <span>Generate Statements</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 4. Upcoming Hearing Schedule & Cause List */}
      <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-[#ab8c67] dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#724916]/15 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172B] dark:text-white whitespace-nowrap">
                Upcoming Hearing Schedule &amp; Cause List
              </h2>
              <p className="text-[11px] text-[#4a3e33] dark:text-slate-400">
                High Court Division &amp; Special Artha Rin Adalats
              </p>
            </div>
          </div>
          <Link
            href="/cause-list"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#724916] dark:text-[#cca776] hover:underline shrink-0 whitespace-nowrap"
          >
            <span>View Full Daily Cause List</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stacked Cases */}
        <div className="divide-y divide-[#ab8c67]/40 dark:divide-slate-800">
          {cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#4a3e33] dark:text-slate-400">
              No active case files found.
            </div>
          ) : (
            cases.slice(0, 5).map((c) => {
              const primaryCaseNo = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].caseNumber
                : "No Case No";
              const primaryCourt = c.caseNumbers && c.caseNumbers.length > 0
                ? c.caseNumbers[0].courtDivision
                : "High Court Division";
              const latestUpdate = c.statusUpdates && c.statusUpdates.length > 0
                ? c.statusUpdates[c.statusUpdates.length - 1]
                : null;
              const nextHearing = latestUpdate?.nextHearingDate || latestUpdate?.updateDate;
              const isDisposed = c.status === "disposed" || c.status === "decreed";
              const advocateName = c.assignedAdvocate?.advocateName || "Unassigned";

              return (
                <div
                  key={c._id || c.id}
                  className="p-4 sm:p-5 hover:bg-[#724916] group transition-colors flex flex-col gap-2"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#cbb292] text-[#0F172B] border border-[#ab8c67] group-hover:bg-[#8b6028] group-hover:text-[#cca776] dark:bg-slate-800 dark:text-white dark:border-slate-700 shrink-0 whitespace-nowrap">
                        {c.chamberFileNo}
                      </span>
                      <span className="text-xs font-bold text-[#0F172B] group-hover:text-[#cca776] dark:text-white shrink-0 whitespace-nowrap">
                        {c.institutionName}
                      </span>
                      <span className="text-xs text-[#4a3e33] group-hover:text-[#cca776]/80 dark:text-slate-400 shrink-0 whitespace-nowrap">
                        • {primaryCourt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
                      {nextHearing && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#cbb292] dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-[#0F172B] group-hover:bg-[#8b6028] group-hover:text-[#cca776] dark:text-slate-300 border border-[#ab8c67] dark:border-slate-700 whitespace-nowrap">
                          <Calendar className="h-3 w-3 text-[#724916] group-hover:text-[#cca776] dark:text-[#cca776]" />
                          <span>{nextHearing}</span>
                        </span>
                      )}
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap bg-[#724916] text-[#cca776] border border-[#ab8c67] dark:border-[#cca776]/30"
                      >
                        {isDisposed ? "Decreed / Disposed" : "Active Litigation"}
                      </span>
                      <Link
                        href={`/cases/new?id=${c._id || c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#cbb292] group-hover:bg-[#dfceb7] group-hover:text-[#0F172B] px-3 py-1 text-xs font-bold text-[#0F172B] hover:bg-[#cca776] transition-all border border-[#ab8c67] whitespace-nowrap cursor-pointer"
                      >
                        <span>View File</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#4a3e33] group-hover:text-[#cca776]/80 dark:text-slate-400 min-w-0 truncate">
                    <span className="font-bold text-[#0F172B] group-hover:text-white dark:text-slate-200 shrink-0 whitespace-nowrap">
                      {primaryCaseNo}
                    </span>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0 whitespace-nowrap">
                      Advocate: <strong className="text-[#0F172B] group-hover:text-[#cca776] dark:text-slate-300">{advocateName}</strong>
                    </span>
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

      {/* 5. Database Seed Box (Compact and clean at the bottom) */}
      <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#724916]/15 text-[#724916] dark:bg-slate-800 dark:text-slate-300 shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F172B] dark:text-white whitespace-nowrap">
              Database Seed &amp; Initialization
            </h4>
            <p className="text-[11px] text-[#4a3e33] dark:text-slate-400">
              Populate demo financial institutions (15 banks), advocates, and sample case files.
            </p>
          </div>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#ab8c67] bg-[#724916] px-3.5 py-1.5 text-xs font-bold text-[#cca776] hover:bg-[#8b6028] transition-colors disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shrink-0 whitespace-nowrap cursor-pointer"
        >
          {isSeeding ? "Seeding Data..." : "Seed Sample Data"}
        </button>
      </div>
    </div>
  );
}
