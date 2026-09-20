"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Users,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/#portal");
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
        router.replace("/#portal");
      })
      .finally(() => setIsChecking(false));
  }, [router]);

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

  if (isChecking || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Authenticating Chamber Administrator access...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#cca776]/15 px-3 py-1 text-xs font-semibold text-[#cca776] border border-[#cca776]/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Chamber Administrator & Managing Partner Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Executive Chamber Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Logged in as <strong className="text-[#cca776]">{currentUser.name}</strong> (Managing Partner • Admin). Full oversight of 100+ banking institutions, case assignments, associate workloads, and firm-wide recovery decrees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all hover:scale-[1.02]"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ Add New Case File</span>
            </Link>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-[#cca776]/50 transition-all"
            >
              <Users className="h-4 w-4 text-[#cca776]" />
              <span>Manage Roles & Team</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration with #cca776 */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Cases */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Active Cases
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
            Across High Court & Artha Rin Courts
          </p>
        </div>

        {/* Card 2: Banks & Clients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bank / Corporate Clients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
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
            <span className="inline-flex items-center text-xs font-semibold text-[#cca776]">
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

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/team"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#cca776]/70 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776] group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#cca776] transition-colors">
                Team & Role Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Elevate user roles & assign advocates
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Change roles from User/Associate to Advocate or Admin with immediate database elevation.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-[#cca776]">
            <span>Manage Chamber Team</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/institutions"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                100+ Banks & Corporate Clients
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Legal focal persons & branch directories
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse corporate client directories, branch details, and active case distributions per bank.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Open Institution Registry</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Official Letterhead Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Running vs Disposed Monthly Statements
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate formal status position statements for banks with letterhead formatting and PDF export.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Generate Statements</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Cause List Schedule */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#cca776]" />
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cca776] hover:text-[#b8935f]"
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
                  <span className="inline-flex items-center rounded-full bg-[#cca776]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#cca776] ring-1 ring-[#cca776]/30">
                    Stay Extension Fixed
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/cases/CF-2024-001"
                    className="font-medium text-[#cca776] hover:underline"
                  >
                    View File
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Seed Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Database Seed & Initialization (Admin Only)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Populate demo financial institutions (NRB Bank, BRAC Bank, EBL), advocates, and sample case files.
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
