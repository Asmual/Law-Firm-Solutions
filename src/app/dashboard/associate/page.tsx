"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  Clock,
  Gavel,
  BookOpen,
} from "lucide-react";
import { User } from "@/types";

export default function AssociateDashboardPage() {
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
        Loading Associate Workspace...
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
              <span>Associate Practice Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Associate Chamber Diary
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Logged in as <strong className="text-[#cca776]">{currentUser.name}</strong> ({currentUser.chamberDesignation || "Associate"}). Record daily hearing outcomes, monitor High Court cause lists, and track bank file updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all hover:scale-[1.02]"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ Record New Case File</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration with #cca776 */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/cases/new"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#cca776]/60 transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Add / Edit Case File
              </h2>
              <p className="text-xs text-slate-500">Full multi-row case entry</p>
            </div>
          </div>
        </Link>

        <Link
          href="/cause-list"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500/60 transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Cause List Tracker
              </h2>
              <p className="text-xs text-slate-500">Today&apos;s High Court hearings</p>
            </div>
          </div>
        </Link>

        <Link
          href="/institutions"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500/60 transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bank Clients Directory
              </h2>
              <p className="text-xs text-slate-500">Focal persons & branches</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Hearing Updates Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Files Pending Hearing Order / Status Entry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update court order remarks after daily call over
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Chamber File</th>
                <th className="px-5 py-3">Case Number</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3">Current Court</th>
                <th className="px-5 py-3 text-right">Update Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                  CF-2024/001
                </td>
                <td className="px-5 py-3.5">
                  Writ Petition No. 5821/2024
                </td>
                <td className="px-5 py-3.5 font-medium">
                  NRB Bank PLC
                </td>
                <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                  High Court Division (Annex 14)
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/cases/CF-2024-001"
                    className="font-medium text-[#cca776] hover:underline"
                  >
                    + Add Remark
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
