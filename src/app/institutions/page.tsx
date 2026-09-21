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
} from "lucide-react";
import { AddInstitutionModal } from "@/components/institutions/AddInstitutionModal";
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
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
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#cca776] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-[#b8935f] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>+ Register New Institution</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Institutions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalInstitutions}
            </span>
            <span className="text-xs text-slate-500">Corporate Clients</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Litigation Files
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalActiveCases}
            </span>
            <span className="text-xs text-slate-500">Running in Courts</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Disposed / Concluded
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalDisposedCases}
            </span>
            <span className="text-xs text-slate-500">Decreed in Favor</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bank by name, code (e.g. NRB), branch, or focal person..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-3 dark:border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid View"
            className={`p-1.5 rounded-md ${
              viewMode === "grid"
                ? "bg-[#cca776]/15 text-[#cca776]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            aria-label="Table View"
            className={`p-1.5 rounded-md ${
              viewMode === "table"
                ? "bg-[#cca776]/15 text-[#cca776]"
                : "text-slate-400 hover:text-slate-600"
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
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-[#cca776] text-slate-950 font-bold"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Building2 className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No institutions found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search criteria or register a new bank.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#cca776] px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#b8935f]"
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
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#cca776]/60 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header: Short Code & Category */}
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {inst.shortCode}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#cca776]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#cca776] ring-1 ring-[#cca776]/30">
                    {inst.category}
                  </span>
                </div>

                {/* Institution Name */}
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {inst.name}
                </h3>

                {/* Branch / Address */}
                <div className="mt-1.5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {inst.branch && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{inst.branch}</span>
                    </div>
                  )}
                  {inst.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{inst.address}</span>
                    </div>
                  )}
                </div>

                {/* Focal Person Box */}
                {inst.focalPerson?.name && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Users className="h-3 w-3 text-[#cca776]" />
                      <span>{inst.focalPerson.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-4.5">
                      {inst.focalPerson.designation}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
                      {inst.focalPerson.phone && (
                        <a
                          href={`tel:${inst.focalPerson.phone}`}
                          className="flex items-center gap-1 hover:text-[#cca776]"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>{inst.focalPerson.phone}</span>
                        </a>
                      )}
                      {inst.focalPerson.email && (
                        <a
                          href={`mailto:${inst.focalPerson.email}`}
                          className="flex items-center gap-1 hover:text-[#cca776]"
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
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    <Briefcase className="h-3 w-3" />
                    <span>{inst.activeCases || 0} Active</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{inst.disposedCases || 0} Disposed</span>
                  </span>
                </div>

                <Link
                  href={`/cases/new?institutionId=${inst.id || inst._id}&institutionName=${encodeURIComponent(
                    inst.name
                  )}`}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#cca776] hover:text-slate-950 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#cca776] dark:hover:text-slate-950"
                  title="Add new case file for this institution"
                >
                  <FilePlus2 className="h-3 w-3" />
                  <span>+ Case</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && institutions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {institutions.map((inst) => (
                  <tr
                    key={inst.id || inst._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {inst.shortCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {inst.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {inst.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {inst.branch || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {inst.focalPerson?.name ? (
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {inst.focalPerson.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {inst.focalPerson.phone || inst.focalPerson.designation}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                      {inst.activeCases || 0}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {inst.disposedCases || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/cases/new?institutionId=${inst.id || inst._id}&institutionName=${encodeURIComponent(
                          inst.name
                        )}`}
                        className="font-medium text-[#cca776] hover:underline"
                      >
                        + New Case
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddInstitutionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchInstitutions}
      />
    </div>
  );
}
