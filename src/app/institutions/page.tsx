"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FilePlus2,
  CheckCircle2,
  Users,
  Grid,
  List,
  Eye,
  Edit,
} from "lucide-react";
import { AddInstitutionModal } from "@/components/institutions/AddInstitutionModal";
import { InstitutionDetailModal } from "@/components/institutions/InstitutionDetailModal";
import { Institution, InstitutionCategory } from "@/types";

const CATEGORY_TABS: (InstitutionCategory | "All")[] = [
  "All",
  "Private Commercial Bank",
  "Shariah Islamic Bank",
  "State-Owned Bank",
  "Non-Banking Financial Institution (NBFI)",
  "Corporate Client",
];

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<InstitutionCategory | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [institutionToEdit, setInstitutionToEdit] = useState<Institution | null>(null);
  const [viewInstitutionId, setViewInstitutionId] = useState<string | null>(null);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "All") params.append("category", selectedCategory);

      const res = await fetch(`/api/institutions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInstitutions(data.data || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstitutions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInstitutions]);

  // Aggregate stats
  const totalInstitutions = institutions.length;
  const totalActiveCases = institutions.reduce(
    (acc, item) => acc + (item.activeCases || 0),
    0
  );
  const totalDisposedCases = institutions.reduce(
    (acc, item) => acc + (item.disposedCases || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#724916]/10 text-[#724916] ring-1 ring-[#ab8c67]/40 dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bank & Institutional Clients Directory
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage corporate entities, recovery division focal persons, and monitor litigation case volume across 100+ institutions.
          </p>
        </div>

        <button
          onClick={() => {
            setInstitutionToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Register New Institution</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400">
            Total Institutions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172B] dark:text-white">
              {totalInstitutions}
            </span>
            <span className="text-xs text-[#4a3e33] dark:text-slate-400">Corporate Clients</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400">
            Active Litigation Files
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#724916] dark:text-[#cca776]">
              {totalActiveCases}
            </span>
            <span className="text-xs text-[#4a3e33] dark:text-slate-400">Running in Courts</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3e33] dark:text-slate-400">
            Disposed / Concluded
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172B] dark:text-slate-200">
              {totalDisposedCases}
            </span>
            <span className="text-xs text-[#4a3e33] dark:text-slate-400">Decreed in Favor</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#dfceb7] p-3 rounded-xl border border-[#ab8c67] dark:border-slate-800 dark:bg-slate-900">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bank by name, code (e.g. NRB), branch, or focal person..."
            className="w-full rounded-lg border border-[#ab8c67] bg-[#f3ebd9] pl-8 pr-3 py-2 text-xs text-[#0F172B] placeholder-[#6e5a44] focus:border-[#724916] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border-l border-[#ab8c67]/60 pl-3 dark:border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-[#724916] text-[#cca776] dark:bg-[#cca776] dark:text-slate-950 font-bold"
                : "text-[#724916] hover:bg-[#cbb292] dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            aria-label="Table View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-[#724916] text-[#cca776] dark:bg-[#cca776] dark:text-slate-950 font-bold"
                : "text-[#724916] hover:bg-[#cbb292] dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#724916] text-[#cca776] dark:bg-[#cca776] dark:text-slate-950 shadow-sm"
                : "bg-[#cbb292] text-[#724916] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading institutions directory...
        </div>
      )}

      {/* Empty state */}
      {!loading && institutions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#ab8c67] bg-[#dfceb7] p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Building2 className="mx-auto h-8 w-8 text-[#724916] dark:text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-[#0F172B] dark:text-white">
            No institutions found
          </h3>
          <p className="mt-1 text-xs text-[#4a3e33] dark:text-slate-400">
            Try adjusting your search criteria or register a new bank.
          </p>
          <button
            onClick={() => {
              setInstitutionToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Institution</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && institutions.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <div
              key={inst.id || inst._id}
              className="flex flex-col justify-between rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-5 shadow-sm hover:border-[#724916] hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header: Short Code & Category */}
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-[#cbb292] px-2 py-0.5 text-[11px] font-bold tracking-wider text-[#724916] border border-[#ab8c67]/60 dark:bg-slate-800 dark:text-slate-200">
                    {inst.shortCode}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#724916] px-2.5 py-0.5 text-[10px] font-bold text-[#cca776] ring-1 ring-[#ab8c67]/40 dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30">
                    {inst.category}
                  </span>
                </div>

                {/* Institution Name */}
                <h3
                  onClick={() => setViewInstitutionId(inst.id || inst._id || "")}
                  className="mt-3 text-sm font-bold text-[#0F172B] dark:text-white cursor-pointer hover:text-[#724916] dark:hover:text-[#cca776] transition-colors"
                >
                  {inst.name}
                </h3>

                {/* Branch / Address */}
                <div className="mt-1.5 space-y-1 text-[11px] text-[#4a3e33] dark:text-slate-400">
                  {inst.branch && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 shrink-0 text-[#724916] dark:text-slate-400" />
                      <span className="truncate">{inst.branch}</span>
                    </div>
                  )}
                  {inst.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-[#724916] dark:text-slate-400" />
                      <span className="truncate">{inst.address}</span>
                    </div>
                  )}
                </div>

                {/* Focal Person Box */}
                {inst.focalPerson?.name && (
                  <div className="mt-4 rounded-lg bg-[#ece1d0] p-3 text-[11px] dark:bg-slate-800/50 border border-[#ab8c67]/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-[#0F172B] dark:text-slate-200">
                      <Users className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776] shrink-0" />
                      <span>{inst.focalPerson.name}</span>
                    </div>
                    <p className="text-[10px] text-[#4a3e33] dark:text-slate-400 ml-5 font-medium">
                      {inst.focalPerson.designation}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#724916] dark:text-slate-400">
                      {inst.focalPerson.phone && (
                        <a
                          href={`tel:${inst.focalPerson.phone}`}
                          className="flex items-center gap-1 text-[#724916] dark:text-slate-400 hover:text-[#8b6028] dark:hover:text-[#cca776] font-bold"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>{inst.focalPerson.phone}</span>
                        </a>
                      )}
                      {inst.focalPerson.email && (
                        <a
                          href={`mailto:${inst.focalPerson.email}`}
                          className="flex items-center gap-1 text-[#724916] dark:text-slate-400 hover:text-[#8b6028] dark:hover:text-[#cca776] font-medium"
                        >
                          <Mail className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[140px]">
                            {inst.focalPerson.email}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Case Stats & Actions */}
              <div className="mt-5 pt-3 border-t border-[#ab8c67]/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-[#724916] dark:text-[#cca776] font-bold">
                    <Briefcase className="h-3 w-3" />
                    <span>{inst.activeCases || 0} Active</span>
                  </span>
                  <span className="text-[#ab8c67] dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-[#0F172B] dark:text-slate-300 font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{inst.disposedCases || 0} Disposed</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewInstitutionId(inst.id || inst._id || "")}
                    className="inline-flex items-center gap-1 rounded-md border border-[#ab8c67] bg-[#cbb292] px-2 py-1 text-[11px] font-bold text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    title="View institution profile and linked cases"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setInstitutionToEdit(inst);
                      setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-[#ab8c67] bg-[#cbb292] px-2 py-1 text-[11px] font-bold text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    title="Edit institution profile"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <Link
                    href={`/cases/new?institutionId=${inst.id || inst._id}&institutionName=${encodeURIComponent(
                      inst.name
                    )}`}
                    className="inline-flex items-center gap-1 rounded-md bg-[#724916] px-2 py-1 text-[11px] font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 transition-colors"
                    title="Add new case file for this institution"
                  >
                    <FilePlus2 className="h-3 w-3" />
                    <span>+ Case</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && institutions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#ab8c67] bg-[#dfceb7] shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#cbb292] text-[#724916] uppercase tracking-wider font-bold border-b border-[#ab8c67] dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Institution Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Focal Person</th>
                  <th className="px-4 py-3">Active Cases</th>
                  <th className="px-4 py-3">Disposed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ab8c67]/40 dark:divide-slate-800 text-[#0F172B] dark:text-slate-300">
                {institutions.map((inst) => (
                  <tr
                    key={inst.id || inst._id}
                    className="transition-colors hover:bg-[#ece1d0] dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-bold text-[#0F172B] dark:text-white">
                      {inst.shortCode}
                    </td>
                    <td
                      onClick={() => setViewInstitutionId(inst.id || inst._id || "")}
                      className="px-4 py-3 font-bold text-[#0F172B] dark:text-white cursor-pointer hover:text-[#724916] dark:hover:text-[#cca776] transition-colors"
                    >
                      {inst.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#724916] px-2 py-0.5 text-[10px] font-bold text-[#cca776] ring-1 ring-[#ab8c67]/40 dark:bg-slate-800 dark:text-slate-300 dark:ring-0">
                        {inst.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4a3e33] dark:text-slate-400">
                      {inst.branch || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {inst.focalPerson?.name ? (
                        <div>
                          <p className="font-bold text-[#0F172B] dark:text-slate-200">
                            {inst.focalPerson.name}
                          </p>
                          <p className="text-[10px] text-[#4a3e33] dark:text-slate-400">
                            {inst.focalPerson.phone || inst.focalPerson.designation}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#724916] dark:text-[#cca776]">
                      {inst.activeCases || 0}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#0F172B] dark:text-slate-300">
                      {inst.disposedCases || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewInstitutionId(inst.id || inst._id || "")}
                          className="font-bold text-[#724916] hover:underline dark:text-slate-400 dark:hover:text-white cursor-pointer"
                          title="View Details"
                        >
                          View
                        </button>
                        <span className="text-[#ab8c67] dark:text-slate-700">•</span>
                        <button
                          onClick={() => {
                            setInstitutionToEdit(inst);
                            setIsAddModalOpen(true);
                          }}
                          className="font-bold text-[#724916] hover:underline dark:text-slate-400 dark:hover:text-white cursor-pointer"
                          title="Edit Institution"
                        >
                          Edit
                        </button>
                        <span className="text-[#ab8c67] dark:text-slate-700">•</span>
                        <Link
                          href={`/cases/new?institutionId=${inst.id || inst._id}&institutionName=${encodeURIComponent(
                            inst.name
                          )}`}
                          className="font-bold text-[#724916] dark:text-[#cca776] hover:underline"
                        >
                          + Case
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddInstitutionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setInstitutionToEdit(null);
        }}
        institutionToEdit={institutionToEdit}
        onSuccess={fetchInstitutions}
      />

      {/* Institution Detail & Mapped Cases Modal */}
      <InstitutionDetailModal
        institutionId={viewInstitutionId}
        isOpen={Boolean(viewInstitutionId)}
        onClose={() => setViewInstitutionId(null)}
        onEdit={(inst) => {
          setViewInstitutionId(null);
          setInstitutionToEdit(inst);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}
