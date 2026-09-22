"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Building2,
  Users2,
  Scale,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Institution, Case } from "@/types";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"client_monthly" | "associate_workload" | "running_cases">("client_monthly");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("September 2026");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(2026);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    { short: "Jan", full: "January" },
    { short: "Feb", full: "February" },
    { short: "Mar", full: "March" },
    { short: "Apr", full: "April" },
    { short: "May", full: "May" },
    { short: "Jun", full: "June" },
    { short: "Jul", full: "July" },
    { short: "Aug", full: "August" },
    { short: "Sep", full: "September" },
    { short: "Oct", full: "October" },
    { short: "Nov", full: "November" },
    { short: "Dec", full: "December" },
  ];

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    if (isMonthPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  const handleSelectMonth = (monthFull: string) => {
    const formatted = `${monthFull} ${pickerYear}`;
    setSelectedMonth(formatted);
    setIsMonthPickerOpen(false);
    toast.success(`Report period set to ${formatted}`);
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = months[now.getMonth()].full;
    setPickerYear(curYear);
    setSelectedMonth(`${curMonth} ${curYear}`);
    setIsMonthPickerOpen(false);
    toast.success(`Report period set to ${curMonth} ${curYear}`);
  };

  const handleSetPrevMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const prevYear = now.getFullYear();
    const prevMonth = months[now.getMonth()].full;
    setPickerYear(prevYear);
    setSelectedMonth(`${prevMonth} ${prevYear}`);
    setIsMonthPickerOpen(false);
    toast.success(`Report period set to ${prevMonth} ${prevYear}`);
  };

  const handleSetNextMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const nextYear = now.getFullYear();
    const nextMonth = months[now.getMonth()].full;
    setPickerYear(nextYear);
    setSelectedMonth(`${nextMonth} ${nextYear}`);
    setIsMonthPickerOpen(false);
    toast.success(`Report period set to ${nextMonth} ${nextYear}`);
  };

  useEffect(() => {
    fetch("/api/institutions?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions && data.institutions.length > 0) {
          setInstitutions(data.institutions);
          setSelectedInstId(data.institutions[0]._id || data.institutions[0].id || "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let url = `/api/cases?limit=200`;
    if (reportType === "client_monthly" && selectedInstId) {
      url += `&institutionId=${selectedInstId}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) setCases(data.cases);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load report data");
      })
      .finally(() => setIsLoading(false));
  }, [reportType, selectedInstId]);

  const selectedInst = institutions.find((i) => (i._id || i.id) === selectedInstId);

  // Generate Professional Legal Letterhead PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      // Gold & Slate Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 842, 65, "F");

      // Gold accent bar
      doc.setFillColor(204, 167, 118); // #cca776
      doc.rect(0, 65, 842, 4, "F");

      // Letterhead Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("LAW FIRM LEGAL SOLUTIONS", 40, 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(204, 167, 118);
      doc.text("ADVOCATES & LEGAL CONSULTANTS • HIGH COURT DIVISION & APPELLATE DIVISION PRACTICE", 40, 48);

      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 720, 48);

      // Report Sub-header Box
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      const clientName = selectedInst ? selectedInst.name.toUpperCase() : "ALL CLIENT INSTITUTIONS";
      doc.text(
        reportType === "client_monthly"
          ? `MONTHLY LITIGATION STATUS REPORT FOR: ${clientName}`
          : reportType === "associate_workload"
          ? "CHAMBER ASSOCIATE WORKLOAD & BRIEF DISTRIBUTION REPORT"
          : "COMPREHENSIVE RUNNING & STAY GRANTED CASES REGISTER",
        40,
        95
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${selectedMonth} • Total Records: ${cases.length}`, 40, 110);

      // Construct table columns & rows
      const head = [
        [
          "SL",
          "CHAMBER FILE",
          "CASE NUMBER & YEAR",
          "COURT / BENCH",
          "PARTIES INVOLVED",
          "MATTER / BRIEF",
          "ASSIGNED COUNSEL",
          "STATUS",
          "LATEST ORDER / REMARK",
        ],
      ];

      const body = cases.map((c, idx) => {
        const caseNo = c.caseNumbers?.[0]
          ? `${c.caseNumbers[0].caseNumber} (${c.caseNumbers[0].year})`
          : "N/A";
        const court = c.caseNumbers?.[0]?.courtDivision || "High Court";
        const party = c.parties?.[0]?.partyNameDetails || "N/A";
        const counsel = c.assignedAdvocate?.advocateName || "Unassigned";
        const latestRemark = c.statusUpdates?.[c.statusUpdates.length - 1]?.statusRemarks || "Rule & Order Active";

        return [
          idx + 1,
          c.chamberFileNo,
          caseNo,
          court,
          party,
          c.matter,
          counsel,
          c.status.toUpperCase(),
          latestRemark,
        ];
      });

      autoTable(doc, {
        head,
        body,
        startY: 125,
        theme: "striped",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [204, 167, 118],
          fontSize: 8,
          fontStyle: "bold",
          halign: "left",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 40, right: 40 },
        styles: {
          overflow: "linebreak",
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: "center" },
          1: { cellWidth: 65, fontStyle: "bold" },
          2: { cellWidth: 95 },
          3: { cellWidth: 85 },
          4: { cellWidth: 120 },
          5: { cellWidth: 90 },
          6: { cellWidth: 85 },
          7: { cellWidth: 55, halign: "center" },
          8: { cellWidth: 140 },
        },
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Law Firm Legal Solutions • Confidential Client Legal Communication • Page ${i} of ${totalPages}`,
          40,
          575
        );
      }

      doc.save(`Legal_Status_Report_${selectedMonth.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF Letterhead Report generated and downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF report");
    }
  };

  // Export to CSV / Excel
  const handleExportCSV = () => {
    try {
      const headers = [
        "SL,Chamber File No,Institution,Case Number,Case Type,Year,Court,Parties,Matter,Advocate,Status,Latest Remark",
      ];
      const rows = cases.map((c, idx) => {
        const cn = c.caseNumbers?.[0];
        const party = c.parties?.[0]?.partyNameDetails?.replace(/"/g, '""') || "";
        const remark = c.statusUpdates?.[c.statusUpdates.length - 1]?.statusRemarks?.replace(/"/g, '""') || "";
        return `"${idx + 1}","${c.chamberFileNo}","${c.institutionName}","${cn?.caseNumber || ""}","${cn?.caseType || ""}","${cn?.year || ""}","${cn?.courtDivision || ""}","${party}","${c.matter}","${c.assignedAdvocate?.advocateName || ""}","${c.status}","${remark}"`;
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Legal_Litigation_Report_${selectedMonth.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV spreadsheet report exported successfully!");
    } catch {
      toast.error("Failed to export CSV report");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#cca776]">
              Reports & Chamber Letterhead Engine
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#cca776]/10 text-[#cca776] border border-[#cca776]/30">
              Institutional Litigation Reports
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[#cca776]" />
            Reports & Letterhead Exports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate client-ready litigation reports for banks, senior partners, and associate workload tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Download Letterhead PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type Radio Tabs */}
          <div
            onClick={() => setReportType("client_monthly")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "client_monthly"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Building2 className={`h-4 w-4 ${reportType === "client_monthly" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "client_monthly" ? "text-white" : "text-slate-300"}`}>
                Client Monthly Report
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              For Banks & Corporate clients with full court order history.
            </p>
          </div>

          <div
            onClick={() => setReportType("associate_workload")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "associate_workload"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users2 className={`h-4 w-4 ${reportType === "associate_workload" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "associate_workload" ? "text-white" : "text-slate-300"}`}>
                Associate Workload Report
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chamber distribution & pending briefs per advocate.
            </p>
          </div>

          <div
            onClick={() => setReportType("running_cases")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "running_cases"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Scale className={`h-4 w-4 ${reportType === "running_cases" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "running_cases" ? "text-white" : "text-slate-300"}`}>
                Running & Stay Granted Cases
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High Court interim stay orders requiring extension.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80 items-center">
          {reportType === "client_monthly" && (
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Financial Institution / Bank
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-[#cca776]"
              >
                {institutions.map((i) => (
                  <option key={i._id || i.id} value={i._id || i.id}>
                    {i.name} ({i.shortCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={`relative ${reportType === "client_monthly" ? "sm:col-span-6" : "sm:col-span-12"}`} ref={monthPickerRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Billing & Report Month
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput((prev) => !prev)}
                className="text-[10px] text-[#cca776] hover:underline font-semibold cursor-pointer"
              >
                {isManualInput ? "Use Month Calendar" : "Edit Manually"}
              </button>
            </div>

            {isManualInput ? (
              <input
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-[#cca776]"
              />
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-950 border border-slate-700 hover:border-[#cca776]/70 rounded-lg text-white font-medium transition-all cursor-pointer group shadow-sm focus:outline-none focus:border-[#cca776]"
                  title="Click to choose month from calendar dropdown"
                  aria-expanded={isMonthPickerOpen}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#cca776]" />
                    <span className="font-bold text-white text-xs sm:text-sm">{selectedMonth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#cca776] bg-[#cca776]/10 px-2 py-0.5 rounded border border-[#cca776]/30">
                      Change Month
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${isMonthPickerOpen ? "rotate-180 text-[#cca776]" : ""}`} />
                  </div>
                </button>

                {/* Calendar / Month Dropdown Popover */}
                {isMonthPickerOpen && (
                  <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-xl border border-slate-800 bg-slate-900/98 p-4 shadow-2xl backdrop-blur-xl text-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                    {/* Header: Year Navigator */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y - 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Previous Year"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-white tracking-wide">{pickerYear}</span>
                        <span className="text-[10px] text-[#cca776] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#cca776]/10 border border-[#cca776]/20">
                          Year
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y + 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Next Year"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 12 Months Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3">
                      {months.map((m) => {
                        const isSelected =
                          selectedMonth.toLowerCase() === `${m.full} ${pickerYear}`.toLowerCase() ||
                          selectedMonth.toLowerCase() === `${m.short} ${pickerYear}`.toLowerCase();
                        return (
                          <button
                            key={m.short}
                            type="button"
                            onClick={() => handleSelectMonth(m.full)}
                            className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                              isSelected
                                ? "bg-[#cca776] text-slate-950 font-bold shadow-md shadow-[#cca776]/30 ring-1 ring-[#cca776]"
                                : "bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <span className="block font-bold">{m.short}</span>
                            <span className="block text-[9px] opacity-75 font-medium truncate">{m.full}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Presets Footer */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px] font-medium">Quick Pick:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleSetPrevMonth}
                          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                        >
                          Prev Month
                        </button>
                        <button
                          type="button"
                          onClick={handleSetCurrentMonth}
                          className="px-2 py-0.5 rounded bg-[#cca776]/15 hover:bg-[#cca776]/25 text-[#cca776] font-bold text-[10px] transition-colors cursor-pointer border border-[#cca776]/30"
                        >
                          Current Month
                        </button>
                        <button
                          type="button"
                          onClick={handleSetNextMonth}
                          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                        >
                          Next Month
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#cca776]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Report Data Preview ({cases.length} records) • Period: {selectedMonth}
            </h2>
          </div>
          <span className="text-[11px] text-[#cca776] font-mono">
            Ready for PDF & Excel Letterhead Print
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3 text-center w-10">SL</th>
                <th className="py-3 px-3 w-28">File No.</th>
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Parties</th>
                <th className="py-3 px-4">Court / Division</th>
                <th className="py-3 px-4">Counsel</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Latest Order Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#cca776] border-r-transparent mb-2"></div>
                    <p>Generating report preview...</p>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileSpreadsheet className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No cases recorded for this selection.</p>
                  </td>
                </tr>
              ) : (
                cases.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#cca776]">{c.chamberFileNo}</td>
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {c.caseNumbers?.[0]?.caseNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div className="truncate max-w-[200px]" title={c.parties?.[0]?.partyNameDetails}>
                        {c.parties?.[0]?.partyNameDetails || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sky-400 font-medium">
                      {c.caseNumbers?.[0]?.courtDivision || "High Court"}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {c.assignedAdvocate?.advocateName || "Unassigned"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="truncate max-w-[240px]">
                        {c.statusUpdates?.[c.statusUpdates.length - 1]?.statusRemarks || "Rule and stay active."}
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
