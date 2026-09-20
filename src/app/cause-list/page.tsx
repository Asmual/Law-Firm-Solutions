"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Case, Institution } from "@/types";

export default function CauseListPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [cases, setCases] = useState<Case[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>("all");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/institutions?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) setInstitutions(data.institutions);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let url = `/api/cases?limit=100`;
    if (selectedInstId && selectedInstId !== "all") {
      url += `&institutionId=${selectedInstId}`;
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
        toast.error("Failed to load cases for cause list");
      })
      .finally(() => setIsLoading(false));
  }, [selectedInstId, searchQuery]);

  // Extract hearings that match the selected date or upcoming hearings
  const scheduledHearings = cases.flatMap((c) => {
    const caseUpdates = c.statusUpdates || [];
    return caseUpdates
      .filter((update) => {
        if (!update.nextHearingDate && !update.updateDate) return false;
        // if user selects date filter, check nextHearingDate or updateDate
        if (selectedDate) {
          return (
            update.nextHearingDate === selectedDate ||
            update.updateDate === selectedDate
          );
        }
        return true;
      })
      .map((update) => ({
        caseFileNo: c.chamberFileNo,
        caseId: c._id || c.id,
        institutionName: c.institutionName,
        matter: c.matter,
        caseNumber: c.caseNumbers?.[0]?.caseNumber || "N/A",
        caseType: c.caseNumbers?.[0]?.caseType || "Litigation",
        courtDivision:
          update.courtName ||
          c.caseNumbers?.[0]?.courtDivision ||
          "High Court Division",
        parties:
          c.parties && c.parties.length > 0
            ? c.parties[0].partyNameDetails
            : "Parties Undisclosed",
        advocateName: c.assignedAdvocate?.advocateName || "Unassigned",
        remarks: update.statusRemarks || update.orderDetails || "",
        date: update.nextHearingDate || update.updateDate,
      }));
  });

  const filteredHearings = scheduledHearings.filter((h) => {
    if (courtFilter !== "all" && !h.courtDivision.toLowerCase().includes(courtFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#cca776]">
              Court Docket & Hearing Schedule
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#cca776]/10 text-[#cca776] border border-[#cca776]/30">
              Daily Roster
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-[#cca776]" />
            Daily Chamber Cause List
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            High Court Division, Appellate Division, and Artha Rin Adalat cause list & hearing tracker.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#cca776]" />
            <span>Print Cause List</span>
          </button>
        </div>
      </div>

      {/* Date Picker & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Date Picker */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Cause Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-[#cca776]"
            />
          </div>

          {/* Court Filter */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Court / Division
            </label>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
            >
              <option value="all">All Courts & Benches</option>
              <option value="Appellate">Appellate Division</option>
              <option value="High Court">High Court Division</option>
              <option value="Artha Rin">Artha Rin Adalat</option>
              <option value="Money Loan">Money Loan Courts</option>
            </select>
          </div>

          {/* Institution Filter */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Institution / Bank
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
            >
              <option value="all">All Institutions</option>
              {institutions.map((i) => (
                <option key={i._id || i.id} value={i._id || i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Case number, advocate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#cca776]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cause List Schedule Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hearing Roster for {selectedDate || "All Scheduled Dates"}
            </h2>
            <p className="text-[11px] text-slate-400">
              Sorted by Court Bench and Seniority
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30 font-semibold font-mono">
            {filteredHearings.length} Matters Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3 text-center w-12">Item</th>
                <th className="py-3 px-3 w-28">File No.</th>
                <th className="py-3 px-4">Court / Division</th>
                <th className="py-3 px-4">Case Number & Type</th>
                <th className="py-3 px-4">Bank / Institution</th>
                <th className="py-3 px-4">Parties Involved</th>
                <th className="py-3 px-4">Assigned Counsel</th>
                <th className="py-3 px-4">Docket Remarks / Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#cca776] border-r-transparent mb-2"></div>
                    <p>Loading Cause List Roster...</p>
                  </td>
                </tr>
              ) : filteredHearings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CalendarDays className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">
                      No court matters scheduled for {selectedDate}
                    </p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Change the date filter above or add a hearing date update inside a Case Profile.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHearings.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#cca776]">
                      {h.caseFileNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-sky-400">
                      {h.courtDivision}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">
                      <div className="font-bold">{h.caseNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{h.caseType}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {h.institutionName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="truncate max-w-[200px]" title={h.parties}>
                        {h.parties}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      {h.advocateName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="truncate max-w-[220px]" title={h.remarks}>
                        {h.remarks || "Regular Hearing / Appearance"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
