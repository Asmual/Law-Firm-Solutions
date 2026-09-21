"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Printer,
  Calendar,
  Building2,
  Scale,
  Users,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Case } from "@/types";
import { CaseDossierSkeleton } from "@/components/common/Skeleton";

export default function CaseDossierViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const router = useRouter();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.case) {
          setCaseData(data.case);
        } else {
          toast.error(data.error || "Case record not found");
          router.replace("/cases");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Network error while loading case dossier");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [caseId, router]);

  if (loading) {
    return <CaseDossierSkeleton />;
  }

  if (!caseData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Scale className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-white">Case Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested litigation dossier does not exist in the chamber registry.
        </p>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#cca776] text-xs font-bold text-slate-950 hover:bg-[#b89360] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case Database</span>
        </Link>
      </div>
    );
  }

  const primaryCourt =
    caseData.caseNumbers && caseData.caseNumbers.length > 0
      ? caseData.caseNumbers[0]
      : null;

  // Find latest hearing update if available
  const latestHearing =
    caseData.statusUpdates && caseData.statusUpdates.length > 0
      ? caseData.statusUpdates[caseData.statusUpdates.length - 1]
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#cca776] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Litigation Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Print / Export Action */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-400" />
            <span>Print Dossier</span>
          </button>

          {/* Edit Case File Action */}
          <Link
            href={`/cases/new?id=${caseId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#cca776] text-xs font-bold text-slate-950 shadow-md shadow-[#cca776]/20 hover:bg-[#b89360] transition-all cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Case File</span>
          </Link>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#cca776]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30 tracking-wider">
                {caseData.chamberFileNo}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ${
                  caseData.status === "running"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : caseData.status === "disposed" || caseData.status === "decreed"
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {caseData.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {caseData.institutionName}
              {caseData.branch && (
                <span className="text-slate-400 font-normal text-base block sm:inline sm:ml-2">
                  • Branch: {caseData.branch}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {caseData.matter || "No subject matter recorded for this litigation file."}
            </p>
          </div>

          {/* Hearing & Bench Snapshot */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 sm:min-w-[260px] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#cca776]">
              <Calendar className="h-4 w-4" />
              <span>Next Fixed Hearing</span>
            </div>
            <div className="text-sm font-bold text-white">
              {latestHearing?.nextHearingDate
                ? new Date(latestHearing.nextHearingDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Not Scheduled"}
            </div>
            {latestHearing?.statusRemarks && (
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span className="text-slate-500">Last Status: </span>
                <span className="text-slate-200 font-medium">{latestHearing.statusRemarks}</span>
              </div>
            )}
            {primaryCourt?.courtDivision && (
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">Court: </span>
                {primaryCourt.courtDivision}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Courts, Parties & Timeline (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Court & Case Numbers */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Scale className="h-4 w-4 text-[#cca776]" />
              <span>Court Particulars &amp; Case Filings</span>
            </div>

            {caseData.caseNumbers && caseData.caseNumbers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caseData.caseNumbers.map((cn, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#cca776]">
                        {cn.caseNumber}
                      </span>
                      {cn.year && (
                        <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {cn.year}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {cn.caseType || "General Litigation"}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {cn.courtDivision}
                    </div>
                    {cn.remarks && (
                      <div className="text-[10px] text-slate-500 pt-1 italic">
                        {cn.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific court numbers recorded.</p>
            )}
          </div>

          {/* Litigating Parties */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Users className="h-4 w-4 text-[#cca776]" />
              <span>Litigating Parties</span>
            </div>

            {caseData.parties && caseData.parties.length > 0 ? (
              <div className="space-y-3">
                {caseData.parties.map((p, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Party #{p.partyNo}: {p.partyNameDetails}
                      </span>
                      {p.searchListEntry && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Search List Entry: {p.searchListEntry}
                        </span>
                      )}
                    </div>
                    {p.caseReceivedDate && (
                      <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 self-start sm:self-center">
                        Received: {p.caseReceivedDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No parties listed.</p>
            )}
          </div>

          {/* Hearing History / Proceedings Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Clock className="h-4 w-4 text-[#cca776]" />
              <span>Hearing History &amp; Proceedings Timeline</span>
            </div>

            {caseData.statusUpdates && caseData.statusUpdates.length > 0 ? (
              <div className="space-y-3">
                {caseData.statusUpdates.map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {h.updateDate ? new Date(h.updateDate).toLocaleDateString("en-GB") : "Unknown Date"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#cca776]/10 text-[#cca776] border border-[#cca776]/30 uppercase">
                        {h.statusRemarks}
                      </span>
                    </div>
                    {h.courtName && (
                      <div className="text-[11px] text-slate-400">
                        Court / Bench: <strong className="text-slate-300">{h.courtName}</strong>
                      </div>
                    )}
                    {h.orderDetails && (
                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800/80">
                        {h.orderDetails}
                      </p>
                    )}
                    {h.nextHearingDate && (
                      <div className="text-[11px] text-[#cca776]">
                        Next Fixed: {new Date(h.nextHearingDate).toLocaleDateString("en-GB")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No prior proceedings recorded in this file.</p>
            )}
          </div>
        </div>

        {/* Right Column: Representation & Notes */}
        <div className="space-y-6">
          {/* Assigned Legal Representation */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <UserCheck className="h-4 w-4 text-[#cca776]" />
              <span>Chamber Counsel Assigned</span>
            </div>

            {/* Lead Advocate */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Advocate (Counsel)
              </span>
              <div className="text-xs font-bold text-white">
                {caseData.assignedAdvocate?.advocateName || "Unassigned"}
              </div>
              {caseData.assignedAdvocate?.dateAssigned && (
                <div className="text-[11px] text-slate-400">
                  Assigned Date: {caseData.assignedAdvocate.dateAssigned}
                </div>
              )}
            </div>

            {/* Associate */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Associate
              </span>
              <div className="text-xs font-bold text-white">
                {caseData.assignedAssociate?.associateName || "None Assigned"}
              </div>
              {caseData.assignedAssociate?.dateAssigned && (
                <div className="text-[11px] text-slate-400">
                  Assigned Date: {caseData.assignedAssociate.dateAssigned}
                </div>
              )}
            </div>
          </div>

          {/* Institution Contact Information */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
              <Building2 className="h-4 w-4 text-[#cca776]" />
              <span>Institution Particulars</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Institution</span>
                <span className="font-semibold text-white">{caseData.institutionName}</span>
              </div>
              {caseData.branch && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Branch Office</span>
                  <span className="text-slate-300">{caseData.branch}</span>
                </div>
              )}
              {caseData.focalPerson?.name && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Focal Contact</span>
                  <span className="font-semibold text-slate-200">{caseData.focalPerson.name}</span>
                  {caseData.focalPerson.designation && (
                    <span className="text-slate-400 block text-[11px]">{caseData.focalPerson.designation}</span>
                  )}
                  {caseData.focalPerson.phone && (
                    <span className="text-slate-400 block text-[11px]">Tel: {caseData.focalPerson.phone}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Special Chamber Notes */}
          {caseData.specialNotes && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
                <FileText className="h-4 w-4 text-[#cca776]" />
                <span>Chamber Brief &amp; Notes</span>
              </div>

              <div className="space-y-2 text-xs">
                {caseData.specialNotes.generalRemarks && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">General Remarks</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                      {caseData.specialNotes.generalRemarks}
                    </p>
                  </div>
                )}
                {caseData.specialNotes.wokalatnamaNote && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Wokalatnama Note</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                      {caseData.specialNotes.wokalatnamaNote}
                    </p>
                  </div>
                )}
                {caseData.specialNotes.mainPetitionNote && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Main Petition Note</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                      {caseData.specialNotes.mainPetitionNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Edit Footer Button */}
          <Link
            href={`/cases/new?id=${caseId}`}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors print:hidden"
          >
            <Edit className="h-4 w-4 text-[#cca776]" />
            <span>Modify Case Details &amp; Brief</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
