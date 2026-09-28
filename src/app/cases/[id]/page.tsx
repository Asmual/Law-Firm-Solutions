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
  Plus,
  Trash2,
  UploadCloud,
  Paperclip,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Case, CaseDocument, CaseStatus } from "@/types";
import { CaseDossierSkeleton } from "@/components/common/Skeleton";
import { LegalDatePicker } from "@/components/common/LegalDatePicker";

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

  // Hearing update modal state
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [isSubmittingHearing, setIsSubmittingHearing] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    updateDate: new Date().toISOString().split("T")[0],
    statusRemarks: "",
    orderDetails: "",
    courtName: "",
    nextHearingDate: "",
    caseStatus: "running" as CaseStatus,
  });

  // Document upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadTitle, setDocUploadTitle] = useState("");
  const [docUploadCategory, setDocUploadCategory] = useState("Court Order / Injunction");
  const dossierFileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchCase = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
      } else {
        toast.error(data.error || "Case record not found");
        router.replace("/cases");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading case dossier");
    } finally {
      setLoading(false);
    }
  }, [caseId, router]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleAddHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingForm.statusRemarks.trim()) {
      toast.error("Please provide status remarks or court order");
      return;
    }

    setIsSubmittingHearing(true);
    try {
      const newUpdate = {
        updateDate: hearingForm.updateDate || new Date().toISOString().split("T")[0],
        statusRemarks: hearingForm.statusRemarks.trim(),
        orderDetails: hearingForm.orderDetails.trim(),
        courtName: hearingForm.courtName.trim(),
        nextHearingDate: hearingForm.nextHearingDate || "",
      };

      const updatedStatusUpdates = [...(caseData?.statusUpdates || []), newUpdate];

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusUpdates: updatedStatusUpdates,
          status: hearingForm.caseStatus || caseData?.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add hearing update");

      toast.success("Court proceeding update recorded successfully.");
      setIsHearingModalOpen(false);
      setHearingForm({
        updateDate: new Date().toISOString().split("T")[0],
        statusRemarks: "",
        orderDetails: "",
        courtName: "",
        nextHearingDate: "",
        caseStatus: (caseData?.status as CaseStatus) || "running",
      });
      fetchCase();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error adding hearing");
    } finally {
      setIsSubmittingHearing(false);
    }
  };

  const handleUploadDossierDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const titleToUse = docUploadTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
    setIsUploadingDoc(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const fileExtension = file.name.split(".").pop() || "pdf";
      const newDoc: CaseDocument = {
        title: `${titleToUse} (${docUploadCategory})`,
        fileUrl: data.url,
        fileType: fileExtension.toLowerCase(),
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocs = [...(caseData?.documents || []), newDoc];

      const updateRes = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: updatedDocs,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to link document to case");

      toast.success(`"${file.name}" uploaded and archived in dossier.`);
      setDocUploadTitle("");
      fetchCase();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploadingDoc(false);
      if (dossierFileInputRef.current) dossierFileInputRef.current.value = "";
    }
  };

  const handleDeleteDossierDoc = async (index: number) => {
    try {
      const updatedDocs = (caseData?.documents || []).filter((_, i) => i !== index);
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: updatedDocs,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete document");

      toast.success("Document removed from case dossier.");
      fetchCase();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove document");
    }
  };

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
          className="inline-flex items-center gap-2 text-xs font-bold text-[#724916] hover:underline dark:text-slate-400 dark:hover:text-[#cca776] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Litigation Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Print / Export Action */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#ab8c67] bg-[#cbb292] text-xs font-bold text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4 text-[#724916] dark:text-slate-400" />
            <span>Print Dossier</span>
          </button>

          {/* Edit Case File Action */}
          <Link
            href={`/cases/new?id=${caseId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#724916] text-xs font-bold text-[#cca776] shadow-md shadow-[#724916]/20 hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b89360] transition-all cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Case File</span>
          </Link>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="relative rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#724916]/5 dark:bg-[#cca776]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#724916] text-[#cca776] border border-[#ab8c67] tracking-wider dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30">
                {caseData.chamberFileNo}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ${
                  caseData.status === "running"
                    ? "bg-[#724916] text-[#cca776] border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30"
                    : caseData.status === "disposed" || caseData.status === "decreed"
                    ? "bg-[#ece1d0] text-[#0F172B] border-[#ab8c67] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    : "bg-[#cbb292] text-[#724916] border-[#ab8c67] dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                }`}
              >
                {caseData.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172B] dark:text-white">
              {caseData.institutionName}
              {caseData.branch && (
                <span className="text-[#4a3e33] font-normal text-base block sm:inline sm:ml-2 dark:text-slate-400">
                  • Branch: {caseData.branch}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#4a3e33] dark:text-slate-300 max-w-2xl leading-relaxed">
              {caseData.matter || "No subject matter recorded for this litigation file."}
            </p>
          </div>

          {/* Hearing & Bench Snapshot */}
          <div className="p-4 rounded-xl bg-[#ece1d0] border border-[#ab8c67]/60 dark:bg-slate-950/80 dark:border-slate-800 sm:min-w-[260px] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#724916] dark:text-[#cca776]">
              <Calendar className="h-4 w-4" />
              <span>Next Fixed Hearing</span>
            </div>
            <div className="text-sm font-bold text-[#0F172B] dark:text-white">
              {latestHearing?.nextHearingDate
                ? new Date(latestHearing.nextHearingDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Not Scheduled"}
            </div>
            {latestHearing?.statusRemarks && (
              <div className="text-xs text-[#4a3e33] dark:text-slate-400 pt-1 border-t border-[#ab8c67]/40 dark:border-slate-800">
                <span className="text-[#4a3e33] dark:text-slate-500 font-semibold">Last Status: </span>
                <span className="text-[#0F172B] dark:text-slate-200 font-bold">{latestHearing.statusRemarks}</span>
              </div>
            )}
            {primaryCourt?.courtDivision && (
              <div className="text-[11px] text-[#4a3e33] dark:text-slate-400">
                <span className="text-[#4a3e33] dark:text-slate-500 font-semibold">Court: </span>
                <span className="text-[#0F172B] dark:text-slate-300">{primaryCourt.courtDivision}</span>
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
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white border-b border-[#ab8c67]/60 dark:border-slate-800 pb-3">
              <Scale className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Court Particulars &amp; Case Filings</span>
            </div>

            {caseData.caseNumbers && caseData.caseNumbers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caseData.caseNumbers.map((cn, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-[#ab8c67]/60 bg-[#ece1d0] dark:border-slate-800 dark:bg-slate-950/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#724916] dark:text-[#cca776]">
                        {cn.caseNumber}
                      </span>
                      {cn.year && (
                        <span className="text-[10px] font-bold text-[#724916] px-1.5 py-0.5 rounded bg-[#cbb292] border border-[#ab8c67]/40 dark:bg-slate-800 dark:text-slate-400">
                          {cn.year}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#0F172B] dark:text-white">
                      {cn.caseType || "General Litigation"}
                    </div>
                    <div className="text-[11px] text-[#4a3e33] dark:text-slate-400 truncate font-medium">
                      {cn.courtDivision}
                    </div>
                    {cn.remarks && (
                      <div className="text-[10px] text-[#4a3e33] dark:text-slate-500 pt-1 italic">
                        {cn.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#4a3e33] dark:text-slate-500 italic">No specific court numbers recorded.</p>
            )}
          </div>

          {/* Litigating Parties */}
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white border-b border-[#ab8c67]/60 dark:border-slate-800 pb-3">
              <Users className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Litigating Parties</span>
            </div>

            {caseData.parties && caseData.parties.length > 0 ? (
              <div className="space-y-3">
                {caseData.parties.map((p, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-[#ab8c67]/60 bg-[#ece1d0] dark:border-slate-800 dark:bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#0F172B] dark:text-slate-200 block">
                        Party #{p.partyNo}: {p.partyNameDetails}
                      </span>
                      {p.searchListEntry && (
                        <span className="text-[11px] text-[#4a3e33] dark:text-slate-400 block mt-0.5 font-medium">
                          Search List Entry: {p.searchListEntry}
                        </span>
                      )}
                    </div>
                    {p.caseReceivedDate && (
                      <span className="text-[10px] font-bold text-[#724916] px-2 py-0.5 rounded bg-[#cbb292] border border-[#ab8c67] self-start sm:self-center dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        Received: {p.caseReceivedDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#4a3e33] dark:text-slate-500 italic">No parties listed.</p>
            )}
          </div>

          {/* Hearing History / Proceedings Timeline */}
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/60 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white">
                <Clock className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                <span>Hearing History &amp; Proceedings Timeline ({caseData.statusUpdates?.length || 0})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsHearingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#724916] text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 transition-colors cursor-pointer print:hidden"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Record Hearing</span>
              </button>
            </div>

            {caseData.statusUpdates && caseData.statusUpdates.length > 0 ? (
              <div className="space-y-3">
                {caseData.statusUpdates.map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-[#ab8c67]/60 bg-[#ece1d0] dark:border-slate-800 dark:bg-slate-950/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172B] dark:text-white">
                        {h.updateDate ? new Date(h.updateDate).toLocaleDateString("en-GB") : "Unknown Date"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#724916] text-[#cca776] border border-[#ab8c67] uppercase dark:bg-[#cca776]/10 dark:text-[#cca776] dark:border-[#cca776]/30">
                        {h.statusRemarks}
                      </span>
                    </div>
                    {h.courtName && (
                      <div className="text-[11px] text-[#4a3e33] dark:text-slate-400">
                        Court / Bench: <strong className="text-[#0F172B] dark:text-slate-300 font-bold">{h.courtName}</strong>
                      </div>
                    )}
                    {h.orderDetails && (
                      <p className="text-xs text-[#0F172B] bg-[#f3ebd9] dark:bg-slate-900 dark:text-slate-300 p-2.5 rounded border border-[#ab8c67]/60 dark:border-slate-800/80 leading-relaxed font-medium">
                        {h.orderDetails}
                      </p>
                    )}
                    {h.nextHearingDate && (
                      <div className="text-[11px] font-bold text-[#724916] dark:text-[#cca776]">
                        Next Fixed: {new Date(h.nextHearingDate).toLocaleDateString("en-GB")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#4a3e33] dark:text-slate-500 italic">No prior proceedings recorded in this file.</p>
            )}
          </div>

          {/* Case Documents & Evidence Management */}
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/60 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white">
                <UploadCloud className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                <span>Legal Documents &amp; Evidence Files ({caseData.documents?.length || 0})</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] font-bold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                Max 15MB • Cloud Archival
              </span>
            </div>

            {/* Direct Upload Form in Dossier */}
            <div className="p-3.5 rounded-xl bg-[#ece1d0] border border-[#ab8c67]/60 dark:bg-slate-950 dark:border-slate-800/80 space-y-3 print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-[#0F172B] dark:text-slate-400 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Certified Order / Written Objection"
                    value={docUploadTitle}
                    onChange={(e) => setDocUploadTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#0F172B] placeholder-[#6e5a44] focus:outline-none focus:border-[#724916] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#0F172B] dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={docUploadCategory}
                    onChange={(e) => setDocUploadCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#0F172B] focus:outline-none focus:border-[#724916] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                  >
                    <option value="Court Order / Injunction">Court Order / Injunction</option>
                    <option value="Main Petition / Plaint">Main Petition / Plaint</option>
                    <option value="Wokalatnama / Power">Wokalatnama / Power</option>
                    <option value="Evidence / Exhibit">Evidence / Exhibit</option>
                    <option value="Legal Notice / Demand">Legal Notice / Demand</option>
                    <option value="Written Statement / Reply">Written Statement / Reply</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="file"
                    ref={dossierFileInputRef}
                    onChange={handleUploadDossierDoc}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.txt"
                  />
                  <button
                    type="button"
                    disabled={isUploadingDoc}
                    onClick={() => dossierFileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>{isUploadingDoc ? "Uploading..." : "Attach File"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document list */}
            {(!caseData.documents || caseData.documents.length === 0) ? (
              <p className="text-xs text-[#4a3e33] dark:text-slate-500 italic py-2">
                No legal documents or exhibits currently attached to this file. Use the upload box above to attach files.
              </p>
            ) : (
              <div className="divide-y divide-[#ab8c67]/40 dark:divide-slate-800/80">
                {caseData.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[#ece1d0] dark:hover:bg-slate-950/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cbb292] text-[#724916] dark:bg-slate-800 dark:text-[#cca776] shrink-0 border border-[#ab8c67]/40">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#0F172B] dark:text-slate-200 block truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-[#4a3e33] dark:text-slate-500">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-GB") : "Uploaded"} • Format: {doc.fileType?.toUpperCase() || "DOC"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#cbb292] text-[11px] font-bold text-[#724916] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] transition-colors dark:bg-slate-800 dark:text-[#cca776] dark:hover:bg-[#cca776] dark:hover:text-slate-950"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDossierDoc(idx)}
                        className="p-1 rounded text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 cursor-pointer print:hidden transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Representation & Notes */}
        <div className="space-y-6">
          {/* Assigned Legal Representation */}
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white border-b border-[#ab8c67]/60 dark:border-slate-800 pb-3">
              <UserCheck className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Chamber Counsel Assigned</span>
            </div>

            {/* Lead Advocate */}
            <div className="p-3 rounded-lg border border-[#ab8c67]/60 bg-[#ece1d0] dark:border-slate-800 dark:bg-slate-950/70 space-y-1">
              <span className="text-[10px] font-bold text-[#724916] uppercase tracking-wider block dark:text-slate-400">
                Assigned Advocate (Counsel)
              </span>
              <div className="text-xs font-bold text-[#0F172B] dark:text-white">
                {caseData.assignedAdvocate?.advocateName || "Unassigned"}
              </div>
              {caseData.assignedAdvocate?.dateAssigned && (
                <div className="text-[11px] text-[#4a3e33] dark:text-slate-400">
                  Assigned Date: {caseData.assignedAdvocate.dateAssigned}
                </div>
              )}
            </div>

            {/* Associate */}
            <div className="p-3 rounded-lg border border-[#ab8c67]/60 bg-[#ece1d0] dark:border-slate-800 dark:bg-slate-950/70 space-y-1">
              <span className="text-[10px] font-bold text-[#724916] uppercase tracking-wider block dark:text-slate-400">
                Assigned Associate
              </span>
              <div className="text-xs font-bold text-[#0F172B] dark:text-white">
                {caseData.assignedAssociate?.associateName || "None Assigned"}
              </div>
              {caseData.assignedAssociate?.dateAssigned && (
                <div className="text-[11px] text-[#4a3e33] dark:text-slate-400">
                  Assigned Date: {caseData.assignedAssociate.dateAssigned}
                </div>
              )}
            </div>
          </div>

          {/* Institution Contact Information */}
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white border-b border-[#ab8c67]/60 dark:border-slate-800 pb-3">
              <Building2 className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Institution Particulars</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Institution</span>
                <span className="font-bold text-[#0F172B] dark:text-white">{caseData.institutionName}</span>
              </div>
              {caseData.branch && (
                <div>
                  <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Branch Office</span>
                  <span className="text-[#0F172B] dark:text-slate-300 font-medium">{caseData.branch}</span>
                </div>
              )}
              {caseData.focalPerson?.name && (
                <div className="pt-2 border-t border-[#ab8c67]/40 dark:border-slate-800">
                  <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Focal Contact</span>
                  <span className="font-bold text-[#0F172B] dark:text-slate-200">{caseData.focalPerson.name}</span>
                  {caseData.focalPerson.designation && (
                    <span className="text-[#4a3e33] dark:text-slate-400 block text-[11px] font-medium">{caseData.focalPerson.designation}</span>
                  )}
                  {caseData.focalPerson.phone && (
                    <span className="text-[#724916] dark:text-slate-400 block text-[11px] font-bold">Tel: {caseData.focalPerson.phone}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Special Chamber Notes */}
          {caseData.specialNotes && (
            <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 space-y-3 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172B] dark:text-white border-b border-[#ab8c67]/60 dark:border-slate-800 pb-2">
                <FileText className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                <span>Chamber Brief &amp; Notes</span>
              </div>

              <div className="space-y-2 text-xs">
                {caseData.specialNotes.generalRemarks && (
                  <div>
                    <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">General Remarks</span>
                    <p className="text-[#0F172B] dark:text-slate-300 text-[11px] leading-relaxed mt-0.5 font-medium">
                      {caseData.specialNotes.generalRemarks}
                    </p>
                  </div>
                )}
                {caseData.specialNotes.wokalatnamaNote && (
                  <div>
                    <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Wokalatnama Note</span>
                    <p className="text-[#0F172B] dark:text-slate-300 text-[11px] leading-relaxed mt-0.5 font-medium">
                      {caseData.specialNotes.wokalatnamaNote}
                    </p>
                  </div>
                )}
                {caseData.specialNotes.mainPetitionNote && (
                  <div>
                    <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Main Petition Note</span>
                    <p className="text-[#0F172B] dark:text-slate-300 text-[11px] leading-relaxed mt-0.5 font-medium">
                      {caseData.specialNotes.mainPetitionNote}
                    </p>
                  </div>
                )}
                {caseData.specialNotes.extensionNote && (
                  <div>
                    <span className="text-[#4a3e33] dark:text-slate-500 block text-[10px] uppercase font-bold">Extension / Stay Extension Note</span>
                    <p className="text-[#0F172B] dark:text-slate-300 text-[11px] leading-relaxed mt-0.5 font-medium">
                      {caseData.specialNotes.extensionNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Edit Footer Button */}
          <Link
            href={`/cases/new?id=${caseId}`}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#cbb292] hover:bg-[#724916] hover:text-[#cca776] text-xs font-bold text-[#724916] border border-[#ab8c67] transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 print:hidden shadow-sm"
          >
            <Edit className="h-4 w-4" />
            <span>Modify Case Details &amp; Brief</span>
          </Link>
        </div>
      </div>

      {/* Quick Record Hearing Modal */}
      {isHearingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-[#ab8c67]/60 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#724916] dark:text-[#cca776]" />
                <h3 className="text-sm font-bold text-[#0F172B] dark:text-white">Record Court Proceeding / Hearing</h3>
              </div>
              <button
                onClick={() => setIsHearingModalOpen(false)}
                className="rounded-lg p-1 text-[#724916] hover:bg-[#cbb292]/50 hover:text-[#0F172B] dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddHearing} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                    Date of Proceeding *
                  </label>
                  <LegalDatePicker
                    value={hearingForm.updateDate}
                    onChange={(val) => setHearingForm({ ...hearingForm, updateDate: val })}
                    placeholder="DD.MM.YYYY"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                    Next Fixed Date
                  </label>
                  <LegalDatePicker
                    value={hearingForm.nextHearingDate}
                    onChange={(val) => setHearingForm({ ...hearingForm, nextHearingDate: val })}
                    placeholder="DD.MM.YYYY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                  Court / Bench / Chamber Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annex-14 / High Court Bench 09"
                  value={hearingForm.courtName}
                  onChange={(e) => setHearingForm({ ...hearingForm, courtName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#0F172B] placeholder-[#6e5a44] focus:outline-none focus:border-[#724916] dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                  Status Description / Order Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rule and Stay granted for 06 Months"
                  value={hearingForm.statusRemarks}
                  onChange={(e) => setHearingForm({ ...hearingForm, statusRemarks: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#0F172B] placeholder-[#6e5a44] focus:outline-none focus:border-[#724916] dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                  Detailed Order / Chamber Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes, operative part of court order, or advocate instructions..."
                  value={hearingForm.orderDetails}
                  onChange={(e) => setHearingForm({ ...hearingForm, orderDetails: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#0F172B] placeholder-[#6e5a44] focus:outline-none focus:border-[#724916] dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[#0F172B] dark:text-slate-300 font-bold mb-1">
                  Update Case Status
                </label>
                <select
                  value={hearingForm.caseStatus}
                  onChange={(e) => setHearingForm({ ...hearingForm, caseStatus: e.target.value as CaseStatus })}
                  className="w-full px-3 py-2 bg-[#f3ebd9] border border-[#ab8c67] rounded-lg text-[#724916] font-bold focus:outline-none focus:border-[#724916] dark:bg-slate-950 dark:border-slate-700 dark:text-[#cca776]"
                >
                  <option value="running">Running (Active Litigation)</option>
                  <option value="stay_granted">Stay Granted / Injunction</option>
                  <option value="adjourned">Adjourned</option>
                  <option value="disposed">Disposed</option>
                  <option value="decreed">Decreed / Executed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ab8c67]/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHearingModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#ab8c67] bg-[#cbb292] text-[#724916] font-bold hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHearing}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#724916] text-[#cca776] font-bold hover:bg-[#8b6028] disabled:opacity-50 dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b89360] transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isSubmittingHearing ? "Saving..." : "Save Proceeding"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
