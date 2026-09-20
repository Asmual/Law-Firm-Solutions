"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  ArrowUpRight,
  Clock,
  Gavel,
} from "lucide-react";
import { User } from "@/types";

export default function AdvocateDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/#portal");
          return;
        }
        setCurrentUser(data.user);
      })
      .catch(() => {
        router.replace("/#portal");
      })
      .finally(() => setIsChecking(false));
  }, [router]);

  if (isChecking || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Loading Advocate Litigation Chamber...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#cca776]/15 px-3 py-1 text-xs font-semibold text-[#cca776] border border-[#cca776]/30">
              <Gavel className="h-3.5 w-3.5" />
              <span>Advocate Practice Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Advocate Litigation Workspace
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Welcome, <strong className="text-[#cca776]">{currentUser.name}</strong> ({currentUser.chamberDesignation || "Advocate"}). Monitor your assigned writ petitions, Artha Rin recovery hearings, and upcoming cause list positions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all hover:scale-[1.02]"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ New Case Entry</span>
            </Link>
            <Link
              href="/cause-list"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <Clock className="h-4 w-4 text-[#cca776]" />
              <span>Today&apos;s Cause List</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration with #cca776 */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Quick Metrics for Advocate */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned Active Files
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              28
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              High Court & Artha Rin
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Upcoming Hearings (This Week)
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#cca776]">
              6
            </span>
            <span className="text-xs font-semibold text-slate-500">
              2 Fixed Today
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Decreed & Concluded
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              14
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              In Bank&apos;s Favor
            </span>
          </div>
        </div>
      </div>

      {/* Advocate Cause List & Hearing Schedule */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Your Assigned Hearings & Cause List Position
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Files scheduled for today and upcoming court dates
            </p>
          </div>
          <Link
            href="/cause-list"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cca776] hover:text-[#b8935f]"
          >
            <span>View Full Schedule</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Chamber File</th>
                <th className="px-5 py-3">Case Number</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3">Court / Bench</th>
                <th className="px-5 py-3">Status Remarks</th>
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
                  <span className="inline-flex items-center rounded-full bg-[#cca776]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#cca776] ring-1 ring-[#cca776]/30">
                    Stay Extension Fixed
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/cases/CF-2024-001"
                    className="font-medium text-[#cca776] hover:underline"
                  >
                    Open File
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
