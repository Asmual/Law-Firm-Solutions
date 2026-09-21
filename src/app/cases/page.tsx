"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Plus,
  FileSpreadsheet,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Case, Institution } from "@/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { TableSkeleton } from "@/components/common/Skeleton";

export default function CasesRegistryPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filters
  const [filterScope, setFilterScope] = useState<"all" | "my">("all");
  const [selectedInstId, setSelectedInstId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    caseId: string;
    fileNo: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    caseId: "",
    fileNo: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUserRole(data.user.role);
          setCurrentUserId(data.user.id || data.user._id || null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Fetch institutions for dropdown
    fetch("/api/institutions?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) {
          setInstitutions(data.institutions);
        }
      })
      .catch(() => {});

    let url = `/api/cases?limit=100`;
    if (filterScope === "my" && currentUserId) {
      url += `&memberId=${currentUserId}`;
    }
    if (selectedInstId && selectedInstId !== "all") {
      url += `&institutionId=${selectedInstId}`;
    }
    if (selectedStatus && selectedStatus !== "all") {
      url += `&status=${selectedStatus}`;
    }
    if (searchQuery.trim()) {
      url += `&query=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          setCases(data.cases);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load case registry");
      })
      .finally(() => setIsLoading(false));
  }, [filterScope, currentUserId, selectedInstId, selectedStatus, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let url = `/api/cases?limit=100`;
    if (filterScope === "my" && currentUserId) {
      url += `&memberId=${currentUserId}`;
    }
    if (selectedInstId && selectedInstId !== "all") {
      url += `&institutionId=${selectedInstId}`;
    }
    if (selectedStatus && selectedStatus !== "all") {
      url += `&status=${selectedStatus}`;
    }
    if (searchQuery.trim()) {
      url += `&query=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          setCases(data.cases);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load case registry");
      })
      .finally(() => setIsLoading(false));
  };

  const handleConfirmDelete = async () => {
    const { caseId } = deleteModalState;
    if (!caseId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete case file");
      }
      toast.success("Case file deleted successfully");
      setCases((prev) => prev.filter((c) => (c._id || c.id) !== caseId));
      setDeleteModalState({ isOpen: false, caseId: "", fileNo: "", isDeleting: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting case";
      toast.error(msg);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            Running
          </span>
        );
      case "stay_granted":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#cca776]/20 text-[#cca776] border border-[#cca776]/40">
            Stay Granted
          </span>
        );
      case "adjourned":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60">
            Adjourned
          </span>
        );
      case "disposed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Disposed
          </span>
        );
      case "decreed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-800/60">
            Decreed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#cca776]">
              Case Database & Archive
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#cca776]/10 text-[#cca776] border border-[#cca776]/30">
              {cases.length} Records Found
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-[#cca776]" />
            Litigation Case Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master repository for all bank, corporate, and High Court briefs managed across our chambers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#cca776]" />
            <span>Generate Reports</span>
          </Link>
          <Link
            href="/cases/new"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Case File</span>
          </Link>
        </div>
      </div>

      {/* Scope Selector: All Cases vs My Assigned Cases */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterScope("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterScope === "all"
              ? "bg-[#cca776] text-slate-950 font-bold shadow-sm"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          All Chamber Cases
        </button>
        <button
          type="button"
          onClick={() => setFilterScope("my")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterScope === "my"
              ? "bg-[#cca776] text-slate-950 font-bold shadow-sm"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          My Assigned Cases Only
        </button>
      </div>

      {/* Filter and Search Bar matching Blueprint specifications */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by File No, Case No, Party Name, Matter, or Advocate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#cca776] focus:ring-1 focus:ring-[#cca776]"
            />
          </div>

          {/* Filter by Institution */}
          <div className="sm:col-span-4">
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
            >
              <option value="all">All Financial Institutions & Clients</option>
              {institutions.map((i) => (
                <option key={i._id || i.id} value={i._id || i.id}>
                  {i.name} ({i.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="stay_granted">Stay Granted</option>
              <option value="adjourned">Adjourned</option>
              <option value="disposed">Disposed</option>
              <option value="decreed">Decreed</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-[#cca776] border border-[#cca776]/30 transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Case Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Case Table Header */}
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3 w-28 whitespace-nowrap">File No.</th>
                <th className="py-3 px-3 min-w-[140px]">Client / Institution</th>
                <th className="py-3 px-3 min-w-[150px]">Case No. &amp; Court</th>
                <th className="py-3 px-3 min-w-[150px]">Parties</th>
                <th className="py-3 px-3 min-w-[120px]">Matter</th>
                <th className="py-3 px-3 min-w-[110px]">Advocate</th>
                <th className="py-3 px-3 text-center w-28 whitespace-nowrap">Status</th>
                <th className="py-3 px-3 text-right w-20 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <TableSkeleton rows={7} cols={8} />
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No litigation files match current filters</p>
                    {currentUserRole !== "admin" ? (
                      <p className="text-[11px] mt-1">
                        Click <Link href="/cases/new" className="text-[#cca776] underline">Add New Case File</Link> to enroll the first case.
                      </p>
                    ) : (
                      <p className="text-[11px] mt-1 text-slate-400">
                        Awaiting brief submissions from Chamber Advocates &amp; Associates.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const caseId = c._id || c.id || "";
                  return (
                    <tr key={caseId} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Chamber File No */}
                      <td className="py-3 px-3 font-mono font-bold text-[#cca776] whitespace-nowrap">
                        <Link href={`/cases/${caseId}`} className="hover:underline" title="View Case Dossier">
                          {c.chamberFileNo}
                        </Link>
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-[160px]" title={c.institutionName}>
                          {c.institutionName}
                        </div>
                        {c.branch && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            Branch: {c.branch}
                          </div>
                        )}
                      </td>

                      {/* Case Numbers & Courts (Concise tags & stacked text) */}
                      <td className="py-3 px-3">
                        {c.caseNumbers && c.caseNumbers.length > 0 ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span
                                className="font-mono text-[11px] font-semibold text-slate-200 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/80 truncate max-w-[140px]"
                                title={c.caseNumbers[0].caseNumber}
                              >
                                {c.caseNumbers[0].caseNumber}
                              </span>
                              {c.caseNumbers.length > 1 && (
                                <span className="text-[10px] font-bold text-[#cca776] bg-[#cca776]/10 px-1 py-0.2 rounded border border-[#cca776]/20">
                                  +{c.caseNumbers.length - 1}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                              {c.caseNumbers[0].courtDivision} • {c.caseNumbers[0].caseType}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Unspecified</span>
                        )}
                      </td>

                      {/* Primary Parties (Concise & truncated) */}
                      <td className="py-3 px-3">
                        {c.parties && c.parties.length > 0 ? (
                          <div className="max-w-[160px]" title={c.parties[0].partyNameDetails}>
                            <span className="text-slate-200 font-medium truncate block text-xs">
                              {c.parties[0].partyNameDetails}
                            </span>
                            {c.parties.length > 1 && (
                              <span className="text-[10px] text-slate-400 truncate block">
                                &amp; {c.parties.length - 1} others
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">None</span>
                        )}
                      </td>

                      {/* Matter */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="truncate max-w-[130px] text-xs" title={c.matter}>
                          {c.matter || "—"}
                        </div>
                      </td>

                      {/* Advocate */}
                      <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                        <div className="truncate max-w-[120px]" title={c.assignedAdvocate?.advocateName}>
                          {c.assignedAdvocate?.advocateName || "Unassigned"}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/cases/${caseId}`}
                            title="View Case Dossier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/cases/new?id=${caseId}`}
                            title="Edit Case File"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#cca776] hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {currentUserRole === "admin" && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModalState({
                                  isOpen: true,
                                  caseId,
                                  fileNo: c.chamberFileNo,
                                  isDeleting: false,
                                })
                              }
                              title="Delete Case File"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Case Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, caseId: "", fileNo: "", isDeleting: false })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Case File Record"
        message={`Are you sure you want to delete Case File "${deleteModalState.fileNo}"? This action permanently removes the brief, hearing updates, and parties record from the chamber database.`}
        confirmText="Delete File"
        cancelText="Keep File"
        variant="danger"
        isLoading={deleteModalState.isDeleting}
      />
    </div>
  );
}
