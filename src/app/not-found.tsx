import React from "react";
import Link from "next/link";
import { Scale, LayoutDashboard, Briefcase } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl text-center rounded-2xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Gold Glow Backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#cca776]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Chamber Scale Insignia */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30 shadow-lg shadow-[#cca776]/10 mb-6">
          <Scale className="h-8 w-8" />
        </div>

        {/* 404 Header & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cca776]/10 border border-[#cca776]/30 text-[#cca776] text-xs font-semibold tracking-wider uppercase mb-3">
          Error 404 • Dossier Not Found
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Litigation Record Unavailable
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The chamber dossier, file registry, or page you are attempting to inspect could not be located in {BRANDING.brandName}’s active repository. It may have been archived, re-indexed, or removed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-[#cca776]/20 hover:bg-[#b89360] transition-all cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Chamber Dashboard</span>
          </Link>

          <Link
            href="/cases"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Briefcase className="h-4 w-4 text-[#cca776]" />
            <span>Case Registry</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
          Formal Legal Registry • {BRANDING.brandName}
        </div>
      </div>
    </div>
  );
}
