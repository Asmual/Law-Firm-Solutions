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
} from "lucide-react";
import { toast } from "sonner";
import { Case, Institution } from "@/types";

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

  const handleDeleteCase = async (id: string, fileNo: string) => {
    if (!confirm(`Are you sure you want to delete Case File "${fileNo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete case file");
      }
      toast.success("Case file deleted successfully");
      setCases((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting case";
      toast.error(msg);
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
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-4 w-28">File No.</th>
                <th className="py-3 px-4">Client / Institution</th>
                <th className="py-3 px-4">Case Number(s) & Courts</th>
                <th className="py-3 px-4">Primary Parties</th>
                <th className="py-3 px-4">Matter / Subject</th>
                <th className="py-3 px-4">Assigned Advocate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#cca776] border-r-transparent mb-2"></div>
                    <p>Loading Case Registry...</p>
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
                      <td className="py-3.5 px-4 font-mono font-bold text-[#cca776] whitespace-nowrap">
                        <Link href={`/cases/new?id=${caseId}`} className="hover:underline">
                          {c.chamberFileNo}
                        </Link>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="truncate max-w-[200px]" title={c.institutionName}>
                          {c.institutionName}
                        </div>
                        {c.branch && (
                          <div className="text-[10px] text-slate-400">Branch: {c.branch}</div>
                        )}
                      </td>

                      {/* Case Numbers */}
                      <td className="py-3.5 px-4">
                        {c.caseNumbers && c.caseNumbers.length > 0 ? (
                          <div className="space-y-1">
                            {c.caseNumbers.slice(0, 2).map((cn, idx) => (
                              <div key={idx} className="font-mono text-slate-200">
                                <span className="font-semibold">{cn.caseNumber}</span>
                                <span className="text-[10px] text-slate-400 ml-1">
                                  ({cn.caseType} • {cn.courtDivision})
                                </span>
                              </div>
                            ))}
                            {c.caseNumbers.length > 2 && (
                              <span className="text-[10px] text-[#cca776]">
                                +{c.caseNumbers.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No numbers entered</span>
                        )}
                      </td>

                      {/* Parties */}
                      <td className="py-3.5 px-4">
                        {c.parties && c.parties.length > 0 ? (
                          <div className="truncate max-w-[220px]" title={c.parties[0].partyNameDetails}>
                            <span className="text-slate-200 font-medium">{c.parties[0].partyNameDetails}</span>
                            {c.parties.length > 1 && (
                              <span className="text-[10px] text-slate-400 block">
                                &amp; {c.parties.length - 1} other parties
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>

                      {/* Matter */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="truncate max-w-[150px]" title={c.matter}>
                          {c.matter}
                        </div>
                      </td>

                      {/* Advocate */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.assignedAdvocate?.advocateName || "Unassigned"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/cases/new?id=${caseId}`}
                            title="Edit Case File"
                            className="p-1.5 rounded text-slate-400 hover:text-[#cca776] hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {currentUserRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCase(caseId, c.chamberFileNo)}
                              title="Delete Case File"
                              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
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
    </div>
  );
}
