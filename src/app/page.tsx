"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FilePlus2,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  Database,
  ChevronRight,
  Gavel,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Sample data seeded successfully!");
      } else {
        toast.error(data.error || "Failed to seed sample data");
      }
    } catch {
      toast.error("Could not connect to database. Make sure MongoDB is running.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Gavel className="h-3.5 w-3.5" />
              <span>Chamber Practice Management Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Law Firm Solutions & Litigation Tracker
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time bank litigation tracking, High Court & Artha Rin suit management, dynamic multi-party case files, and automated corporate letterhead reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-amber-400 transition-all hover:scale-[1.02]"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ Add New Case File</span>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              <span>Generate Reports</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Cases */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Cases
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              142
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +12 this month
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across High Court & Subordinate Courts
          </p>
        </div>

        {/* Card 2: Banks & Clients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bank / Corporate Clients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              100+
            </span>
            <span className="text-xs font-medium text-slate-500">
              Institutions & Branches
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            NRB Bank, BRAC Bank, EBL, etc.
          </p>
        </div>

        {/* Card 3: Hearings This Week */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hearings This Week
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              18
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
              5 fixed today
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            In High Court Division Annexes
          </p>
        </div>

        {/* Card 4: Disposed / Concluded */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disposed & Decreed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              47
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Decreed in favor
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Recorded in Completed Register
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Image 2 Core Form */}
        <Link
          href="/cases/new"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Dynamic Case Entry Form
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-row repeater (Case Nos, Parties, Status)
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Record comprehensive file data, multiple writ/suit numbers, party search lists, and associate assignments in one unified form.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Open Entry Form</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 2: Image 1 Client Report */}
        <Link
          href="/reports"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Client Monthly Statement
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bank letterhead: Running vs Disposed
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate formal case position reports with letterhead formatting for banks (e.g. NRB Bank, BRAC Bank) with PDF & Excel export.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Generate Client Statement</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 3: Image 3 Associate Report */}
        <Link
          href="/reports?type=associate"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Associate Workload Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Partner oversight & assignment tracking
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Review case distribution by associate advocate, monitor pending deadlines, and track internal progress remarks.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>View Associate Metrics</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Today's Cause List Preview */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Hearing Schedule & Cause List
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High Court Division & Special Artha Rin Adalats
            </p>
          </div>
          <Link
            href="/cause-list"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400"
          >
            <span>View Full Daily Cause List</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Chamber File</th>
                <th className="px-5 py-3">Case Number(s)</th>
                <th className="px-5 py-3">Bank / Institution</th>
                <th className="px-5 py-3">Court / Bench</th>
                <th className="px-5 py-3">Assigned Advocate</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                  CF-2024/001
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-900 dark:text-white">
                    Writ Petition No. 5821/2024
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Artha Rin Suit No. 142/2023
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium">
                  NRB Bank PLC
                </td>
                <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                  High Court Division (Annex 14)
                </td>
                <td className="px-5 py-3.5">
                  Advocate Anisur Rahman
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300">
                    Stay Extension Fixed
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/cases/CF-2024-001"
                    className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
                  >
                    View File
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                  CF-2023/118
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-900 dark:text-white">
                    C.R. Case No. 982/2023
                  </div>
                  <div className="text-[11px] text-slate-500">
                    NI Act Section 138
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium">
                  BRAC Bank PLC
                </td>
                <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                  Metropolitan Sessions Judge Court, Dhaka
                </td>
                <td className="px-5 py-3.5">
                  Advocate Farhana Kabir
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Disposed / Decreed
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/cases/CF-2023-118"
                    className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
                  >
                    View File
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Connection & Seed Helper Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Database Seed & Initialization
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Populate demo financial institutions (NRB Bank, BRAC Bank, EBL), advocates, and sample case files for testing.
            </p>
          </div>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {isSeeding ? "Seeding Data..." : "Seed Sample Data"}
        </button>
      </div>
    </div>
  );
}
