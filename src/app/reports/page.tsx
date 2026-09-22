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
  CheckCircle2,
  Clock,
  CheckCircle,
  ShieldAlert,
  Award,
  Hash,
  Briefcase,
  AlertCircle,
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
    setIsLoading(true);
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

  // Split cases for Client Monthly Report (Photo 1)
  const runningCases = cases.filter(
    (c) => c.status !== "disposed" && c.status !== "decreed"
  );
  const disposedCases = cases.filter(
    (c) => c.status === "disposed" || c.status === "decreed"
  );

  // Dynamic Letterhead Codes
  const instCode = (selectedInst?.shortCode || "BANK").toUpperCase();
  const monthCode = selectedMonth.slice(0, 3).toUpperCase();
  const yearVal = selectedMonth.split(" ")[1] || String(new Date().getFullYear());
  const refNo = `Ref: TLS/${instCode}/AD/HC/${monthCode}/${yearVal}`;
  const todayStr = new Date().toLocaleDateString("en-GB");

  // Helper for Party No. Label
  const getPartyNoLabel = (p: any, idx: number) => {
    if (!p) return "Party No. 01";
    if (p.partyType) {
      const num = p.partyNo || idx + 1;
      return `${p.partyType} No. ${String(num).padStart(2, "0")}`;
    }
    return `Party No. ${String(p.partyNo || idx + 1).padStart(2, "0")}`;
  };

  // Helper for Bulleted Status Updates
  const getFormattedRemarks = (c: Case) => {
    if (c.statusUpdates && c.statusUpdates.length > 0) {
      return c.statusUpdates.map((u) => {
        let line = `• ${u.updateDate ? u.updateDate + ": " : ""}${u.statusRemarks}`;
        if (u.nextHearingDate) {
          line += ` [Next Court Date: ${u.nextHearingDate}]`;
        }
        return line;
      }).join("\n");
    }
    return `• Active litigation matter. Current status: ${c.status}`;
  };

  // Generate Professional Legal Letterhead PDF (Exact Photo 1 layout for Client Monthly)
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = 842;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // Top Gold & Slate Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 52, "F");

      // Gold accent bar
      doc.setFillColor(204, 167, 118); // #cca776
      doc.rect(0, 52, pageWidth, 3.5, "F");

      // Letterhead Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("LAW FIRM SOLUTIONS • ADVOCATES & LEGAL CONSULTANTS", margin, 26);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(204, 167, 118);
      doc.text("SUPREME COURT OF BANGLADESH • HIGH COURT DIVISION & APPELLATE DIVISION PRACTICE", margin, 42);

      let curY = 70;

      if (reportType === "client_monthly" || reportType === "running_cases") {
        // Reference & Date
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(refNo, margin, curY);

        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${todayStr}`, pageWidth - margin - 75, curY);

        curY += 14;
        // Recipient Address Block (Photo 1)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text("To,", margin, curY);
        curY += 11;
        doc.text("The Head of Legal Affairs / Special Assets Management Division (SAMD)", margin, curY);
        curY += 11;
        doc.setTextColor(114, 73, 22); // #724916
        doc.text(selectedInst?.name || "Client Financial Institution", margin, curY);
        curY += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(selectedInst?.branch ? `${selectedInst.branch}` : "Head Office, Legal Division", margin, curY);

        curY += 14;
        // Subject line
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`Subject: Latest Case Position Till Month of ${selectedMonth}`, margin, curY);

        curY += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          "Dear Sir, Enclosed please find the latest litigation position and status report of your cases pending before the Supreme Court of Bangladesh.",
          margin,
          curY
        );

        curY += 14;

        // AutoTable Columns (Photo 1 exact 9 columns):
        const columns = [
          { header: "S.L.", dataKey: "sl" },
          { header: "Case Number", dataKey: "caseNo" },
          { header: "Party No.", dataKey: "partyNo" },
          { header: "Party Name & Details", dataKey: "partyName" },
          { header: "Case Received on", dataKey: "receivedOn" },
          { header: "Search List Entry", dataKey: "searchList" },
          { header: "Matter", dataKey: "matter" },
          { header: "Chamber File No.", dataKey: "chamberFile" },
          { header: "Remark / Status", dataKey: "remarks" },
        ];

        // Format Case Rows
        const mapCaseToRow = (c: Case, idx: number) => {
          const p = c.parties?.[0];
          const partyNoStr = getPartyNoLabel(p, idx);
          const caseNoStr = c.caseNumbers?.map((cn) => cn.caseNumber).filter(Boolean).join("\n") || "N/A";
          const receivedOn = p?.caseReceivedDate || "-";
          const searchList = p?.searchListEntry || "-";
          const remarksText = getFormattedRemarks(c);

          return {
            sl: idx + 1,
            caseNo: caseNoStr,
            partyNo: partyNoStr,
            partyName: p?.partyNameDetails || "N/A",
            receivedOn,
            searchList,
            matter: c.matter || "-",
            chamberFile: c.chamberFileNo || "-",
            remarks: remarksText,
          };
        };

        const targetRunning = runningCases;
        const targetDisposed = reportType === "client_monthly" ? disposedCases : [];

        // Section A Banner (Photo 1 Green badge)
        doc.setFillColor(20, 83, 45); // green-900
        doc.rect(margin, curY, contentWidth, 15, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(`A. RUNNING CASES (${targetRunning.length} Cases)`, margin + 8, curY + 10.5);

        curY += 17;

        autoTable(doc, {
          columns,
          body: targetRunning.map(mapCaseToRow),
          startY: curY,
          theme: "grid",
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: [204, 167, 118],
            fontSize: 7,
            fontStyle: "bold",
            halign: "left",
          },
          bodyStyles: {
            fontSize: 6.8,
            textColor: [30, 41, 59],
            valign: "top",
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { left: margin, right: margin },
          styles: {
            overflow: "linebreak",
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
          },
          columnStyles: {
            sl: { cellWidth: 24, halign: "center", fontStyle: "bold" },
            caseNo: { cellWidth: 95, fontStyle: "bold" },
            partyNo: { cellWidth: 68, fontStyle: "bold", textColor: [114, 73, 22] },
            partyName: { cellWidth: 120 },
            receivedOn: { cellWidth: 55, halign: "center" },
            searchList: { cellWidth: 55, halign: "center" },
            matter: { cellWidth: 80 },
            chamberFile: { cellWidth: 60, fontStyle: "bold", halign: "center" },
            remarks: { cellWidth: 213 },
          },
        });

        // Section B (Photo 1 Rose badge for Disposed cases)
        if (targetDisposed.length > 0) {
          let nextY = (doc as any).lastAutoTable.finalY + 14;
          if (nextY > 480) {
            doc.addPage();
            nextY = 40;
          }

          doc.setFillColor(159, 18, 57); // rose-800
          doc.rect(margin, nextY, contentWidth, 15, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.text(`B. DISPOSED / COMPLETED CASES (${targetDisposed.length} Cases)`, margin + 8, nextY + 10.5);

          nextY += 17;

          autoTable(doc, {
            columns,
            body: targetDisposed.map(mapCaseToRow),
            startY: nextY,
            theme: "grid",
            headStyles: {
              fillColor: [15, 23, 42],
              textColor: [204, 167, 118],
              fontSize: 7,
              fontStyle: "bold",
              halign: "left",
            },
            bodyStyles: {
              fontSize: 6.8,
              textColor: [30, 41, 59],
              valign: "top",
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252],
            },
            margin: { left: margin, right: margin },
            styles: {
              overflow: "linebreak",
              cellPadding: 3,
              lineColor: [226, 232, 240],
              lineWidth: 0.5,
            },
            columnStyles: {
              sl: { cellWidth: 24, halign: "center", fontStyle: "bold" },
              caseNo: { cellWidth: 95, fontStyle: "bold" },
              partyNo: { cellWidth: 68, fontStyle: "bold", textColor: [114, 73, 22] },
              partyName: { cellWidth: 120 },
              receivedOn: { cellWidth: 55, halign: "center" },
              searchList: { cellWidth: 55, halign: "center" },
              matter: { cellWidth: 80 },
              chamberFile: { cellWidth: 60, fontStyle: "bold", halign: "center" },
              remarks: { cellWidth: 213 },
            },
          });
        }

        // Formal closing notice & signature
        let finalY = (doc as any).lastAutoTable.finalY + 18;
        if (finalY > 480) {
          doc.addPage();
          finalY = 40;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          "For any further query or clarification regarding any of the above matters, please feel free to contact the undersigned.",
          margin,
          finalY
        );

        finalY += 22;
        doc.text("Yours faithfully,", margin, finalY);
        finalY += 25;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text("Advocate Asmual", margin, finalY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Senior Advocate, Supreme Court of Bangladesh", margin, finalY + 10);
        doc.text("Head of Chamber • Law Firm Solutions", margin, finalY + 19);

      } else {
        // Associate Workload initial fallback (expanded in Stage 3)
        const clientName = "ALL ADVOCATES & ASSOCIATES";
        doc.text(`CHAMBER ASSOCIATE WORKLOAD REPORT FOR: ${clientName}`, margin, curY + 15);
      }

      // Footer numbering on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Law Firm Solutions • Confidential Client Legal Communication • Page ${i} of ${totalPages}`,
          margin,
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

  // Export to CSV / Excel matching Photo 1 exact 9 columns
  const handleExportCSV = () => {
    try {
      const headers = [
        "Section,SL,Case Number,Party No.,Party Name & Details,Case Received on,Search List Entry,Matter,Chamber File No.,Remark / Status",
      ];
      
      const runningRows = runningCases.map((c, idx) => {
        const cn = c.caseNumbers?.map((n) => n.caseNumber).filter(Boolean).join(" | ") || "";
        const p = c.parties?.[0];
        const partyNoStr = getPartyNoLabel(p, idx);
        const party = p?.partyNameDetails?.replace(/"/g, '""') || "";
        const receivedOn = p?.caseReceivedDate || "";
        const searchList = p?.searchListEntry || "";
        const remark = getFormattedRemarks(c).replace(/"/g, '""');
        return `"A. RUNNING CASES","${idx + 1}","${cn}","${partyNoStr}","${party}","${receivedOn}","${searchList}","${c.matter}","${c.chamberFileNo}","${remark}"`;
      });

      const disposedRows = disposedCases.map((c, idx) => {
        const cn = c.caseNumbers?.map((n) => n.caseNumber).filter(Boolean).join(" | ") || "";
        const p = c.parties?.[0];
        const partyNoStr = getPartyNoLabel(p, idx);
        const party = p?.partyNameDetails?.replace(/"/g, '""') || "";
        const receivedOn = p?.caseReceivedDate || "";
        const searchList = p?.searchListEntry || "";
        const remark = getFormattedRemarks(c).replace(/"/g, '""');
        return `"B. DISPOSED CASES","${idx + 1}","${cn}","${partyNoStr}","${party}","${receivedOn}","${searchList}","${c.matter}","${c.chamberFileNo}","${remark}"`;
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...runningRows, ...disposedRows].join("\n");
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#cca776]">
              Reports &amp; Chamber Letterhead Engine
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#cca776]/10 text-[#cca776] border border-[#cca776]/30">
              Supreme Court of Bangladesh
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[#cca776]" />
            Reports &amp; Letterhead Exports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate client-ready litigation reports for banks, senior partners, and associate workload tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#b8935f] shadow-md shadow-[#cca776]/20 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Download Letterhead PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration & Filter Bar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type Tabs */}
          <div
            onClick={() => setReportType("client_monthly")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "client_monthly"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Building2 className={`h-4 w-4 ${reportType === "client_monthly" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "client_monthly" ? "text-[#cca776] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Client Monthly Report
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              For Banks &amp; Corporate clients with Section A Running &amp; Section B Disposed cases.
            </p>
          </div>

          <div
            onClick={() => setReportType("associate_workload")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "associate_workload"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users2 className={`h-4 w-4 ${reportType === "associate_workload" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "associate_workload" ? "text-[#cca776] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Associate Workload Report
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chamber distribution &amp; assigned cases grouped by Associate ID (A-001, A-002).
            </p>
          </div>

          <div
            onClick={() => setReportType("running_cases")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "running_cases"
                ? "bg-[#cca776]/15 border-[#cca776] shadow-sm"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Scale className={`h-4 w-4 ${reportType === "running_cases" ? "text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "running_cases" ? "text-[#cca776] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Running &amp; Stay Granted Cases
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High Court interim stay orders and active hearings register.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 items-center">
          {reportType === "client_monthly" && (
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Target Financial Institution / Bank
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#cca776]"
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
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Billing &amp; Report Month
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
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#cca776]"
              />
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-[#cca776]/70 rounded-lg text-slate-900 dark:text-white font-medium transition-all cursor-pointer group shadow-sm focus:outline-none focus:border-[#cca776]"
                  title="Click to choose month from calendar dropdown"
                  aria-expanded={isMonthPickerOpen}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#cca776]" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{selectedMonth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#cca776] bg-[#cca776]/10 px-2 py-0.5 rounded border border-[#cca776]/30">
                      Change Month
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 ${isMonthPickerOpen ? "rotate-180 text-[#cca776]" : ""}`} />
                  </div>
                </button>

                {/* Calendar / Month Dropdown Popover */}
                {isMonthPickerOpen && (
                  <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/98 p-4 shadow-2xl backdrop-blur-xl text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y - 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Previous Year"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-slate-900 dark:text-white tracking-wide">{pickerYear}</span>
                        <span className="text-[10px] text-[#cca776] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#cca776]/10 border border-[#cca776]/20">
                          Year
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y + 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Next Year"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3">
                      {months.map((m) => {
                        const isSelected = selectedMonth === `${m.full} ${pickerYear}`;
                        return (
                          <button
                            key={m.short}
                            type="button"
                            onClick={() => handleSelectMonth(m.full)}
                            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#cca776] text-black font-bold shadow-md shadow-[#cca776]/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#cca776]"
                            }`}
                          >
                            {m.short}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={handleSetPrevMonth}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-[10px] transition-colors cursor-pointer"
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
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-[10px] transition-colors cursor-pointer"
                      >
                        Next Month
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ON-SCREEN PREVIEW: OFFICIAL CHAMBER LETTERHEAD (PHOTO 1) ================= */}
      {reportType === "client_monthly" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
          {/* Chamber Letterhead Header */}
          <div className="bg-slate-950 p-6 border-b-4 border-[#cca776] text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[#cca776]" />
                  <span className="text-lg font-bold tracking-wider uppercase text-white">
                    LAW FIRM SOLUTIONS
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#cca776] tracking-wider uppercase mt-0.5">
                  Advocates &amp; Legal Consultants • Supreme Court of Bangladesh
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  High Court Division &amp; Appellate Division Practice
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 border border-[#cca776]/30 text-right">
                  <div className="text-xs font-mono font-bold text-[#cca776]">{refNo}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Date: {todayStr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Bank / Client Address Block */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-2xl space-y-1 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">To,</span>
              <p className="font-bold text-slate-900 dark:text-white">
                The In-charge / Head of Legal Affairs &amp; Recovery
              </p>
              <p className="font-semibold text-[#cca776]">
                Special Assets Management Division (SAMD)
              </p>
              <p className="font-bold text-base text-slate-900 dark:text-white mt-1">
                {selectedInst?.name || "Client Financial Institution"}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedInst?.branch || "Head Office, Legal Division"}
              </p>
              {selectedInst?.address && (
                <p className="text-slate-500 dark:text-slate-500">{selectedInst.address}</p>
              )}

              <div className="pt-3">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Subject: Latest Case Position Till Month of {selectedMonth}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-1 italic text-[11px]">
                  Dear Sir, Enclosed please find the latest litigation position and status report of your cases pending before the Appellate Division &amp; High Court Division, Supreme Court of Bangladesh.
                </p>
              </div>
            </div>
          </div>

          {/* Section A: RUNNING CASES (Photo 1 Green Badge) */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  A. RUNNING CASES
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ({runningCases.length} Active Matters)
                </span>
              </div>
            </div>

            {/* Section A Table (Photo 1 exact 9 columns) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                    <th className="py-2.5 px-2 text-center w-10">S.L.</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Case Number</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Party No.</th>
                    <th className="py-2.5 px-3 min-w-[170px]">Party Name &amp; Details</th>
                    <th className="py-2.5 px-3 text-center min-w-[95px]">Case Received on</th>
                    <th className="py-2.5 px-3 text-center min-w-[95px]">Search List Entry</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Matter</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Chamber File No.</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Remark / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {runningCases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No running cases found for this client.
                      </td>
                    </tr>
                  ) : (
                    runningCases.map((c, idx) => {
                      const p = c.parties?.[0];
                      const partyNoStr = getPartyNoLabel(p, idx);
                      return (
                        <tr key={c._id || c.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {c.caseNumbers && c.caseNumbers.length > 0 ? (
                              <div className="space-y-0.5">
                                {c.caseNumbers.map((cn, i) => (
                                  <div key={i}>{cn.caseNumber}</div>
                                ))}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#cca776] bg-[#cca776]/10 px-2 py-0.5 rounded text-[11px] border border-[#cca776]/20">
                              {partyNoStr}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-200 text-xs">
                            <div className="whitespace-pre-line leading-relaxed">
                              {p?.partyNameDetails || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                            {p?.caseReceivedDate || "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {p?.searchListEntry || "-"}
                          </td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                            {c.matter || "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#cca776]">
                            {c.chamberFileNo}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                            {c.statusUpdates && c.statusUpdates.length > 0 ? (
                              <div className="space-y-1">
                                {c.statusUpdates.map((su, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1 leading-snug">
                                    <span className="text-[#cca776] font-bold">•</span>
                                    <span>
                                      {su.updateDate && <span className="font-mono text-slate-400 mr-1">[{su.updateDate}]</span>}
                                      {su.statusRemarks}
                                      {su.nextHearingDate && (
                                        <span className="text-amber-400 font-semibold ml-1">
                                          (Next: {su.nextHearingDate})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="italic text-slate-400">Active Litigation</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: DISPOSED / COMPLETED CASES (Photo 1 Rose Badge) */}
          <div className="p-5 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-rose-950 border border-rose-700/60 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  B. DISPOSED / COMPLETED CASES
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ({disposedCases.length} Disposed Matters)
                </span>
              </div>
            </div>

            {/* Section B Table (Same 9 columns) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                    <th className="py-2.5 px-2 text-center w-10">S.L.</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Case Number</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Party No.</th>
                    <th className="py-2.5 px-3 min-w-[170px]">Party Name &amp; Details</th>
                    <th className="py-2.5 px-3 text-center min-w-[95px]">Case Received on</th>
                    <th className="py-2.5 px-3 text-center min-w-[95px]">Search List Entry</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Matter</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Chamber File No.</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Remark / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {disposedCases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400">
                        No disposed cases recorded for this client.
                      </td>
                    </tr>
                  ) : (
                    disposedCases.map((c, idx) => {
                      const p = c.parties?.[0];
                      const partyNoStr = getPartyNoLabel(p, idx);
                      return (
                        <tr key={c._id || c.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {c.caseNumbers && c.caseNumbers.length > 0 ? (
                              <div className="space-y-0.5">
                                {c.caseNumbers.map((cn, i) => (
                                  <div key={i}>{cn.caseNumber}</div>
                                ))}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded text-[11px] border border-rose-800/30">
                              {partyNoStr}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-200 text-xs">
                            <div className="whitespace-pre-line leading-relaxed">
                              {p?.partyNameDetails || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                            {p?.caseReceivedDate || "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {p?.searchListEntry || "-"}
                          </td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                            {c.matter || "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#cca776]">
                            {c.chamberFileNo}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                            {c.statusUpdates && c.statusUpdates.length > 0 ? (
                              <div className="space-y-1">
                                {c.statusUpdates.map((su, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1 leading-snug">
                                    <span className="text-rose-400 font-bold">•</span>
                                    <span>
                                      {su.updateDate && <span className="font-mono text-slate-400 mr-1">[{su.updateDate}]</span>}
                                      {su.statusRemarks}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="italic text-slate-400">Disposed Matter</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chamber Sign-Off Block (Photo 1) */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-xs text-slate-500 max-w-md">
              <p className="font-medium text-slate-600 dark:text-slate-400">
                For any further query or clarification regarding any of the above matters, please feel free to contact the undersigned.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Law Firm Solutions • Supreme Court of Bangladesh • Litigation Wing
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-slate-500">Yours faithfully,</div>
              <div className="pt-6 border-b border-slate-300 dark:border-slate-700 w-48 ml-auto"></div>
              <div className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                Advocate Asmual
              </div>
              <div className="text-[11px] text-[#cca776] font-medium">
                Senior Advocate &amp; Litigation Counsel
              </div>
              <div className="text-[10px] text-slate-500">
                Supreme Court of Bangladesh
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= GENERAL & ASSOCIATE WORKLOAD PREVIEW (PLACEHOLDER FOR STAGE 3) ================= */}
      {reportType !== "client_monthly" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {reportType === "associate_workload" ? "Associate Workload Report" : "Running Cases Register"} ({cases.length} records)
              </h2>
            </div>
            <span className="text-[11px] text-[#cca776] font-mono font-semibold">
              Period: {selectedMonth}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-3 text-center w-10">SL</th>
                  <th className="py-3 px-3 w-28">File No.</th>
                  <th className="py-3 px-4">Case Number</th>
                  <th className="py-3 px-4">Parties</th>
                  <th className="py-3 px-4">Court / Division</th>
                  <th className="py-3 px-4">Assigned Counsel</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Latest Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
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
                      <FileSpreadsheet className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-700 dark:text-slate-400">No cases recorded for this selection.</p>
                    </td>
                  </tr>
                ) : (
                  cases.map((c, idx) => (
                    <tr key={idx} className="transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-500 dark:text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#cca776]">{c.chamberFileNo}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                        {c.caseNumbers?.[0]?.caseNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                        <div className="truncate max-w-[200px]" title={c.parties?.[0]?.partyNameDetails}>
                          {c.parties?.[0]?.partyNameDetails || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sky-600 dark:text-sky-400 font-medium">
                        {c.caseNumbers?.[0]?.courtDivision || "High Court"}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-200 font-medium">
                        {c.assignedAdvocate?.advocateName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
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
      )}
    </div>
  );
}
