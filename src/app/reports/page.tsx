"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Building2,
  Users2,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Institution, Case } from "@/types";
import { generateInstitutionCasePositionPdf } from "@/lib/reports/institutionReportPdf";
import { generateAssociateAssignedCasesPdf } from "@/lib/reports/associateReportPdf";

const DEFAULT_INSTITUTIONS: Institution[] = [
  { _id: "inst-nrb", name: "NRB Bank PLC", shortCode: "NRB", category: "Private Commercial Bank", branch: "Principal Branch, Gulshan", address: "Head Office: Uday Sanz, Block: SE (A), Plot: 2/B, Road: 134, South Avenue, Gulshan – 1, Dhaka-1212.", isActive: true, focalPerson: { name: "Legal Division", designation: "Head of Legal", phone: "+8801700000000" } },
  { _id: "inst-brac", name: "BRAC Bank PLC", shortCode: "BRAC", category: "Private Commercial Bank", branch: "Special Asset Management, Anik Tower", address: "Tejgaon Industrial Area, Dhaka", isActive: true, focalPerson: { name: "Legal Affairs", designation: "Head of SAMD", phone: "+8801700000001" } },
  { _id: "inst-city", name: "The City Bank Limited", shortCode: "CBL", category: "Private Commercial Bank", branch: "Law & Recovery Division", address: "City Bank Center, Gulshan-2, Dhaka", isActive: true, focalPerson: { name: "Law Division", designation: "Vice President", phone: "+8801700000002" } },
  { _id: "inst-ebl", name: "Eastern Bank PLC", shortCode: "EBL", category: "Private Commercial Bank", branch: "Special Asset Management Division", address: "100 Gulshan Avenue, Dhaka", isActive: true, focalPerson: { name: "Legal Team", designation: "Senior Manager", phone: "+8801700000003" } },
  { _id: "inst-pubali", name: "Pubali Bank Limited", shortCode: "PBL", category: "Private Commercial Bank", branch: "Law Division, Head Office", address: "Motijheel C/A, Dhaka", isActive: true, focalPerson: { name: "Law Division", designation: "DGM Legal", phone: "+8801700000004" } },
  { _id: "inst-dbbl", name: "Dutch-Bangla Bank Limited", shortCode: "DBBL", category: "Private Commercial Bank", branch: "Legal Affairs Division", address: "Sena Kalyan Bhaban, Motijheel, Dhaka", isActive: true, focalPerson: { name: "Legal Division", designation: "Head of Legal", phone: "+8801700000005" } },
  { _id: "inst-ibbl", name: "Islami Bank Bangladesh PLC", shortCode: "IBBL", category: "Shariah Islamic Bank", branch: "Law & Recovery Wing", address: "Dilkusha C/A, Dhaka", isActive: true, focalPerson: { name: "Law Wing", designation: "EVP Legal", phone: "+8801700000006" } },
  { _id: "inst-ucb", name: "United Commercial Bank PLC", shortCode: "UCB", category: "Private Commercial Bank", branch: "Special Asset Management", address: "Gulshan-1, Dhaka", isActive: true, focalPerson: { name: "Legal Desk", designation: "Manager Legal", phone: "+8801700000007" } },
  { _id: "inst-scb", name: "Standard Chartered Bank", shortCode: "SCB", category: "Private Commercial Bank", branch: "Legal & Compliance", address: "Gulshan North Avenue, Dhaka", isActive: true, focalPerson: { name: "Legal Counsel", designation: "Country Head Legal", phone: "+8801700000008" } },
  { _id: "inst-idlc", name: "IDLC Finance Limited", shortCode: "IDLC", category: "Non-Banking Financial Institution (NBFI)", branch: "Special Asset Management", address: "Bays Galleria, Gulshan-1, Dhaka", isActive: true, focalPerson: { name: "Legal Department", designation: "Head of Legal", phone: "+8801700000009" } },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"client_monthly" | "associate_workload" | "running_cases">("client_monthly");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [selectedAssociateCode, setSelectedAssociateCode] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("July 2026");
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
        const fetched = data.data || data.institutions;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setInstitutions(fetched);
          setSelectedInstId(fetched[0]._id || fetched[0].id || "");
        } else {
          setInstitutions(DEFAULT_INSTITUTIONS);
          setSelectedInstId(DEFAULT_INSTITUTIONS[0]._id || "");
        }
      })
      .catch(() => {
        setInstitutions(DEFAULT_INSTITUTIONS);
        setSelectedInstId(DEFAULT_INSTITUTIONS[0]._id || "");
      });
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

  const selectedInst = institutions.find((i) => (i._id || i.id) === selectedInstId) || DEFAULT_INSTITUTIONS[0];

  // Split cases for Client Monthly Report (Running vs Disposed)
  const runningCases = cases.filter(
    (c) => c.status !== "disposed" && c.status !== "decreed"
  );
  const disposedCases = cases.filter(
    (c) => c.status === "disposed" || c.status === "decreed"
  );

  // Group cases by Associate for Associate Workload Report
  const allAssociateGroups = useMemo(() => {
    const groups: { [key: string]: { associateCode: string; associateName: string; cases: Case[] } } = {};

    cases.forEach((c) => {
      let code = c.assignedAssociate?.associateCode;
      let name = c.assignedAssociate?.associateName;

      // Fallback matching
      if (!code) {
        if (name && name.includes("Shakil")) code = "A-001";
        else if (name && name.includes("Sabrina")) code = "A-002";
        else if (name && name.includes("Tariqul")) code = "A-003";
        else if (name && name.includes("Rezaul")) code = "A-004";
        else if (c.assignedAdvocate?.advocateName) {
          name = c.assignedAdvocate.advocateName;
          code = "A-001";
        } else {
          code = "A-001";
          name = "Advocate Associate";
        }
      }

      if (!name) {
        name = "Chamber Legal Associate";
      }

      const key = `${code}_${name}`;
      if (!groups[key]) {
        groups[key] = {
          associateCode: code,
          associateName: name,
          cases: [],
        };
      }
      groups[key].cases.push(c);
    });

    return Object.values(groups).sort((a, b) => a.associateCode.localeCompare(b.associateCode));
  }, [cases]);

  // Filter associate groups if user picked a specific associate
  const filteredAssociateGroups = useMemo(() => {
    if (selectedAssociateCode === "all") return allAssociateGroups;
    return allAssociateGroups.filter((g) => g.associateCode === selectedAssociateCode);
  }, [allAssociateGroups, selectedAssociateCode]);

  // Unique associate codes list for dropdown
  const availableAssociateCodes = useMemo(() => {
    return Array.from(new Set(allAssociateGroups.map((g) => g.associateCode))).sort();
  }, [allAssociateGroups]);

  const totalAssignedCasesCount = useMemo(() => {
    return filteredAssociateGroups.reduce((acc, g) => acc + g.cases.length, 0);
  }, [filteredAssociateGroups]);

  // Dynamic Letterhead Codes
  const instCode = (selectedInst?.shortCode || "BANK").toUpperCase();
  const monthCode = selectedMonth.split(" ")[0] || "Month";
  const yearVal = selectedMonth.split(" ")[1] || String(new Date().getFullYear());
  const refNo = `TLS/${instCode}/AD/HC/RAJ/${monthCode}/${yearVal}`;
  const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

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
    const list: string[] = [];
    if (c.statusUpdates && c.statusUpdates.length > 0) {
      c.statusUpdates.forEach((u) => {
        let line = `• ${u.updateDate ? u.updateDate + ": " : ""}${u.statusRemarks}`;
        if (u.nextHearingDate) {
          line += ` [Next Court Date: ${u.nextHearingDate}]`;
        }
        list.push(line);
      });
    }
    if (c.specialNotes?.mainPetitionNote) {
      list.push(`• Main Petition: ${c.specialNotes.mainPetitionNote}`);
    }
    if (c.specialNotes?.extensionNote) {
      list.push(`• Stay / Extension: ${c.specialNotes.extensionNote}`);
    }
    if (c.specialNotes?.generalRemarks) {
      list.push(`• Note: ${c.specialNotes.generalRemarks}`);
    }
    if (list.length === 0) {
      list.push(`• Active litigation matter. Current status: ${c.status}`);
    }
    return list.join("\n");
  };

  // ================= EXPORT PROFESSIONAL PDF =================
  const handleExportPDF = () => {
    try {
      if (reportType === "associate_workload") {
        const doc = generateAssociateAssignedCasesPdf({
          associateGroups: filteredAssociateGroups,
          totalCases: totalAssignedCasesCount,
          reportDate: todayStr,
          institutionFilterName: selectedInst?.name || "All Institutions",
          associateFilterCode: selectedAssociateCode === "all" ? "All" : selectedAssociateCode,
          preparedByName: "Chamber Admin",
          checkedByName: "Managing Partner",
        });
        const fileName = `Associate_Wise_Assigned_Cases_${todayStr.replace(/\./g, "_")}.pdf`;
        doc.save(fileName);
        toast.success(`PDF downloaded: ${fileName}`);
        return;
      }

      // Default: Report Type A (Institution-wise Case Position Report)
      const doc = generateInstitutionCasePositionPdf({
        institution: selectedInst,
        cases,
        reportMonth: selectedMonth,
        reportDate: todayStr,
        customRef: refNo,
      });
      const fileName = `Latest_Case_Position_${instCode}_${selectedMonth.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      toast.success(`PDF downloaded: ${fileName}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report");
    }
  };

  // ================= BROWSER PRINT TRIGGER =================
  const handleBrowserPrint = () => {
    window.print();
  };

  // ================= EXPORT CSV / EXCEL =================
  const handleExportCSV = () => {
    try {
      if (reportType === "associate_workload") {
        const headers = [
          "SL,Associate ID,Associate Name,Institution / Client,Case File No.,Case Number(s),Party Name & Details,Matter,Date Assigned,Remarks (Internal)",
        ];
        const rows: string[] = [];
        let runningIdx = 1;

        filteredAssociateGroups.forEach((g) => {
          g.cases.forEach((c) => {
            const cn = c.caseNumbers?.map((n) => n.caseNumber).filter(Boolean).join(" | ") || "";
            const party = c.parties?.[0]?.partyNameDetails?.replace(/"/g, '""') || "";
            const dateAssigned = c.assignedAssociate?.dateAssigned || c.assignedAdvocate?.dateAssigned || "";
            const remarks = (c.assignedAssociate?.internalRemarks || c.assignedAdvocate?.internalRemarks || "Drafting and hearing").replace(/"/g, '""');
            rows.push(
              `"${runningIdx++}","${g.associateCode}","${g.associateName}","${c.institutionName || ""}","${c.chamberFileNo}","${cn}","${party}","${c.matter}","${dateAssigned}","${remarks}"`
            );
          });
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Associate_Assigned_Cases_${todayStr.replace(/\./g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Associate Workload CSV exported successfully!");
        return;
      }

      // Default: Client Monthly Report CSV
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
      link.setAttribute("download", `Latest_Case_Position_${instCode}_${selectedMonth.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV spreadsheet report exported successfully!");
    } catch {
      toast.error("Failed to export CSV report");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 print:p-0 print:max-w-none">
      {/* Page Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#724916] dark:text-[#cca776]">
              Report Generation &amp; Export Studio
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#724916]/10 text-[#724916] border border-[#ab8c67]/40 dark:bg-[#cca776]/10 dark:text-[#cca776] dark:border-[#cca776]/30 font-bold">
              Dynamic Letterhead PDF
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172B] dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[#724916] dark:text-[#cca776]" />
            Litigation Reports &amp; Legal PDF Exports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate formal Supreme Court chamber position reports and associate workload registers matching official firm formatting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#0F172B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleBrowserPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#0F172B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-[#0F172B] hover:bg-[#b8935f] shadow-md shadow-[#cca776]/30 transition-all cursor-pointer font-sans"
          >
            <Download className="h-4 w-4" />
            <span>Download Letterhead PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration & Filter Bar (Hidden in Print) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 print:hidden">
        {/* Report Type Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setReportType("client_monthly")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "client_monthly"
                ? "bg-[#724916]/10 border-[#ab8c67] dark:bg-[#cca776]/15 dark:border-[#cca776] shadow-sm ring-1 ring-[#ab8c67]/40"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-[#ab8c67]/60 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Building2 className={`h-4 w-4 ${reportType === "client_monthly" ? "text-[#724916] dark:text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "client_monthly" ? "text-[#724916] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Report Type A: Latest Case Position
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Institution-wise formal letterhead report with Running &amp; Disposed cases and Supreme Court Senior Advocate seal.
            </p>
          </div>

          <div
            onClick={() => setReportType("associate_workload")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "associate_workload"
                ? "bg-[#724916]/10 border-[#ab8c67] dark:bg-[#cca776]/15 dark:border-[#cca776] shadow-sm ring-1 ring-[#ab8c67]/40"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-[#ab8c67]/60 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users2 className={`h-4 w-4 ${reportType === "associate_workload" ? "text-[#724916] dark:text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "associate_workload" ? "text-[#724916] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Report Type B: Associate Assigned Cases
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Landscape registry grouped by Associate ID (A-001, A-002) with row spanning, subtotals, and Admin/Partner verification.
            </p>
          </div>

          <div
            onClick={() => setReportType("running_cases")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              reportType === "running_cases"
                ? "bg-[#724916]/10 border-[#ab8c67] dark:bg-[#cca776]/15 dark:border-[#cca776] shadow-sm ring-1 ring-[#ab8c67]/40"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-[#ab8c67]/60 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Scale className={`h-4 w-4 ${reportType === "running_cases" ? "text-[#724916] dark:text-[#cca776]" : "text-slate-400"}`} />
              <span className={`text-xs font-bold ${reportType === "running_cases" ? "text-[#724916] dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                Active Litigation &amp; Stay Registry
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Filtered register showing only pending High Court hearings, stay orders, and rule returns.
            </p>
          </div>
        </div>

        {/* Dynamic Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 items-center">
          {/* Target Institution Selector */}
          <div className={reportType === "associate_workload" ? "sm:col-span-4" : "sm:col-span-6"}>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Target Financial Institution / Bank
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white/95 dark:bg-slate-950 border border-[#ab8c67]/70 dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-white font-semibold focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776] shadow-sm cursor-pointer"
            >
              <option value="">All Financial Institutions (Chamber Pool)</option>
              {institutions.map((i) => (
                <option key={i._id || i.id} value={i._id || i.id}>
                  {i.name} ({i.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Associate ID Selector (For Associate Report) */}
          {reportType === "associate_workload" && (
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Filter by Associate ID
              </label>
              <select
                value={selectedAssociateCode}
                onChange={(e) => setSelectedAssociateCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white/95 dark:bg-slate-950 border border-[#ab8c67]/70 dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-white font-semibold focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776] shadow-sm cursor-pointer"
              >
                <option value="all">All Chamber Associates ({allAssociateGroups.length})</option>
                {availableAssociateCodes.map((code) => (
                  <option key={code} value={code}>
                    Associate: {code}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Report Month / Date Picker */}
          <div className={`relative ${reportType === "associate_workload" ? "sm:col-span-4" : "sm:col-span-6"}`} ref={monthPickerRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Billing &amp; Report Month
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput((prev) => !prev)}
                className="text-[10px] text-[#724916] dark:text-[#cca776] hover:underline font-semibold cursor-pointer"
              >
                {isManualInput ? "Use Month Calendar" : "Edit Manually"}
              </button>
            </div>

            {isManualInput ? (
              <input
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="e.g. July 2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#cca776]"
              />
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-[#cca776]/70 rounded-lg text-slate-900 dark:text-white font-medium transition-all cursor-pointer group shadow-sm focus:outline-none focus:border-[#cca776]"
                  title="Click to choose month from calendar dropdown"
                  aria-expanded={isMonthPickerOpen}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{selectedMonth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#724916] bg-[#724916]/10 dark:text-[#cca776] dark:bg-[#cca776]/10 px-2 py-0.5 rounded border border-[#ab8c67]/40 dark:border-[#cca776]/30">
                      Change Month
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 ${isMonthPickerOpen ? "rotate-180 text-[#cca776]" : ""}`} />
                  </div>
                </button>

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

      {/* ================= ON-SCREEN PREVIEW: REPORT TYPE A (INSTITUTION-WISE CASE POSITION REPORT) ================= */}
      {(reportType === "client_monthly" || reportType === "running_cases") && (
        <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl overflow-hidden p-8 sm:p-12 space-y-6 max-w-5xl mx-auto font-serif">
          {/* 1. Official Chamber Letterhead */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 border-b-2 border-slate-800">
            {/* Logo Emblem (Left) */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-14 rounded bg-[#0F172B] flex flex-col items-center justify-center text-[#cca776] shadow-sm">
                <Scale className="h-6 w-6 stroke-[1.7]" />
              </div>
              <div className="leading-tight">
                <div className="font-serif text-sm font-bold text-[#0F172B]">The</div>
                <div className="font-serif text-base font-extrabold text-[#0F172B] tracking-tight">Legal Solutions</div>
                <div className="font-sans text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Barristers &amp; Advocates</div>
              </div>
            </div>

            {/* Firm Name Center */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#0F172B] tracking-tight">
                The Legal Solutions
              </h2>
              <p className="font-sans text-[11px] font-bold text-[#724916] uppercase tracking-[0.25em] mt-0.5">
                — A L A W F I R M —
              </p>
            </div>

            {/* Chamber Addresses Right */}
            <div className="text-right font-sans text-[9px] text-slate-600 leading-snug space-y-0.5 max-w-xs">
              <p><strong>Chamber:</strong> Flat No- 702 (6th Floor), 24/D, Topkhana Road, Seguna Bagicha, Dhaka-1000.</p>
              <p><strong>Court Chamber:</strong> Room-206 (Annex Extension), Supreme Court Bar Association Building, Shahbag, Dhaka-1000.</p>
              <p><strong>Phone:</strong> 02-9666885, 01740615720 | <strong>Web:</strong> www.thelegalsolutions.net</p>
            </div>
          </div>

          {/* 2. Recipient Block & Date/Ref Box */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 font-sans text-xs">
            <div className="space-y-1 text-slate-700">
              <div className="text-slate-500">To,</div>
              <div className="font-semibold text-slate-800">Legal Division</div>
              <div className="text-sm font-bold text-[#0F172B]">{selectedInst?.name || "Client Financial Institution"}</div>
              <div>Head Office: {selectedInst?.branch || "Uday Sanz"}</div>
              <div>{selectedInst?.address || "Block: SE (A), Plot: 2/B, Road: 134, South Avenue"}</div>
              <div>Gulshan – 1, Dhaka-1212.</div>
            </div>

            {/* Date & Ref Table */}
            <div className="border border-slate-400 rounded overflow-hidden text-xs min-w-[220px]">
              <div className="grid grid-cols-12 border-b border-slate-300">
                <div className="col-span-4 bg-[#E0EEFC] font-bold text-[#0F172B] px-3 py-1.5 border-r border-slate-300">Date:</div>
                <div className="col-span-8 px-3 py-1.5 font-mono text-slate-800">{todayStr}</div>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-4 bg-[#E0EEFC] font-bold text-[#0F172B] px-3 py-1.5 border-r border-slate-300">Ref:</div>
                <div className="col-span-8 px-3 py-1.5 font-mono text-[11px] text-slate-800">{refNo}</div>
              </div>
            </div>
          </div>

          {/* 3. Subject Banner */}
          <div className="border border-slate-400 rounded overflow-hidden flex font-sans text-xs">
            <div className="bg-[#E0EEFC] font-bold text-[#0F172B] px-6 py-2 border-r border-slate-400 flex items-center">
              Subject:
            </div>
            <div className="px-5 py-2 font-bold text-[#0F172B] flex-1 text-sm">
              Latest Case Position Till Month of {selectedMonth}
            </div>
          </div>

          {/* 4. Letter Intro */}
          <div className="font-sans text-xs text-slate-800 leading-relaxed space-y-1">
            <p>Dear Sir,</p>
            <p>Greetings from <strong>“The Legal Solutions”</strong>.</p>
            <p>
              Thank you very much for engaging us as your Legal Counsel on the following case matters. The latest position of cases
              which were assigned to us is given below:-
            </p>
          </div>

          {/* 5. Category Banner */}
          <div className="bg-[#0F172B] text-white font-sans text-xs font-bold text-center py-2 uppercase tracking-wider rounded">
            CASES BEFORE HIGH COURT DIVISION &amp; APPELLATE DIVISION
          </div>

          {/* 6. Section A: Running Cases */}
          <div className="space-y-2 font-sans">
            <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] font-bold text-xs px-3 py-1.5 rounded flex items-center justify-between">
              <span>A.  RUNNING CASES</span>
              <span className="text-[11px] font-normal">({runningCases.length} Cases)</span>
            </div>

            <div className="border border-slate-300 overflow-x-auto rounded">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[#0F172B] font-bold border-b border-slate-300 text-center">
                    <th className="p-2 border-r border-slate-300 w-8">S.L.</th>
                    <th className="p-2 border-r border-slate-300 min-w-[110px]">Case Number<br/><span className="text-[9px] font-normal text-slate-500">(As per Database)</span></th>
                    <th className="p-2 border-r border-slate-300 min-w-[85px]">Party No.</th>
                    <th className="p-2 border-r border-slate-300 min-w-[140px]">Party Name &amp; Details<br/><span className="text-[9px] font-normal text-slate-500">(As per Database)</span></th>
                    <th className="p-2 border-r border-slate-300 min-w-[75px]">Case<br/>Received on</th>
                    <th className="p-2 border-r border-slate-300 min-w-[75px]">Search List<br/>Entry</th>
                    <th className="p-2 border-r border-slate-300 min-w-[80px]">Matter</th>
                    <th className="p-2 border-r border-slate-300 min-w-[65px]">Chamber<br/>File No.</th>
                    <th className="p-2 min-w-[180px]">Remark / Status<br/><span className="text-[9px] font-normal text-slate-500">(As per Database)</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {runningCases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 italic">No running cases recorded for this client.</td>
                    </tr>
                  ) : (
                    runningCases.map((c, idx) => {
                      const p = c.parties?.[0];
                      const partyNoStr = getPartyNoLabel(p, idx);
                      return (
                        <tr key={c._id || c.id || idx} className="hover:bg-slate-50/70 align-top">
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-bold font-mono text-[#0F172B]">
                            {c.caseNumbers && c.caseNumbers.length > 0 ? (
                              c.caseNumbers.map((cn, i) => <div key={i}>{cn.caseNumber}</div>)
                            ) : "N/A"}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-semibold text-[#724916] whitespace-pre-line text-[10px]">
                            {partyNoStr}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800 leading-snug">
                            <div className="font-semibold">{p?.partyNameDetails || "N/A"}</div>
                            {c.branch && <div className="text-[10px] text-slate-500">({selectedInst?.name}, {c.branch})</div>}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{p?.caseReceivedDate || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold text-slate-700">{p?.searchListEntry || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">{c.matter || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0F172B]">{c.chamberFileNo}</td>
                          <td className="p-2 text-slate-700 leading-relaxed text-[10px]">
                            <div className="whitespace-pre-line">{getFormattedRemarks(c)}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Section B: Disposed Cases */}
          {disposedCases.length > 0 && (
            <div className="space-y-2 font-sans pt-2">
              <div className="bg-[#FEE2E2] border border-[#FECDD3] text-[#9F1239] font-bold text-xs px-3 py-1.5 rounded flex items-center justify-between">
                <span>B.  DISPOSED / COMPLETED CASES</span>
                <span className="text-[11px] font-normal">({disposedCases.length} Cases)</span>
              </div>

              <div className="border border-slate-300 overflow-x-auto rounded">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[#0F172B] font-bold border-b border-slate-300 text-center">
                      <th className="p-2 border-r border-slate-300 w-8">S.L.</th>
                      <th className="p-2 border-r border-slate-300 min-w-[110px]">Case Number</th>
                      <th className="p-2 border-r border-slate-300 min-w-[85px]">Party No.</th>
                      <th className="p-2 border-r border-slate-300 min-w-[140px]">Party Name &amp; Details</th>
                      <th className="p-2 border-r border-slate-300 min-w-[75px]">Case Received on</th>
                      <th className="p-2 border-r border-slate-300 min-w-[75px]">Search List Entry</th>
                      <th className="p-2 border-r border-slate-300 min-w-[80px]">Matter</th>
                      <th className="p-2 border-r border-slate-300 min-w-[65px]">Chamber File No.</th>
                      <th className="p-2 min-w-[180px]">Remark / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {disposedCases.map((c, idx) => {
                      const p = c.parties?.[0];
                      const partyNoStr = getPartyNoLabel(p, idx);
                      return (
                        <tr key={c._id || c.id || idx} className="hover:bg-slate-50/70 align-top">
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-bold font-mono text-[#0F172B]">
                            {c.caseNumbers && c.caseNumbers.length > 0 ? (
                              c.caseNumbers.map((cn, i) => <div key={i}>{cn.caseNumber}</div>)
                            ) : "N/A"}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-semibold text-[#724916] whitespace-pre-line text-[10px]">
                            {partyNoStr}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800 leading-snug">
                            <div className="font-semibold">{p?.partyNameDetails || "N/A"}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{p?.caseReceivedDate || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold text-slate-700">{p?.searchListEntry || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">{c.matter || "-"}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0F172B]">{c.chamberFileNo}</td>
                          <td className="p-2 text-slate-700 leading-relaxed text-[10px]">
                            <div className="whitespace-pre-line">{getFormattedRemarks(c)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. Footer Disclaimer & Authority Signature */}
          <div className="pt-6 font-sans text-xs space-y-4 text-slate-800">
            <p className="leading-relaxed">
              If you have any further queries regarding above mentioned case matters please feel free to contact us (Phone No- 01740615720 /
              Advocate Shahriar Mahmud 01614291511, E-mail: thelegalsolutions.bd@gmail.com). This is for your kind information and necessary record.
            </p>

            <div className="pt-3">
              <div>Thanking you,</div>
              <div>Sincerely yours,</div>

              {/* Styled Digital Ink Flourish */}
              <div className="py-2">
                <svg width="180" height="42" viewBox="0 0 180 42" fill="none" className="text-sky-700">
                  <path
                    d="M10 28 C 30 10, 45 40, 70 18 C 90 2, 105 32, 130 14 C 150 5, 165 24, 175 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-sm text-[#0F172B]">Md. Mahfuzur Rahman (Milon)</div>
                <div className="text-slate-600">Barrister-at-Law</div>
                <div className="text-slate-600">Senior Advocate</div>
                <div className="text-slate-600">Supreme Court of Bangladesh</div>
                <div className="font-bold text-[#724916]">For: The Legal Solutions</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ON-SCREEN PREVIEW: REPORT TYPE B (ASSOCIATE-WISE ASSIGNED CASES REPORT) ================= */}
      {reportType === "associate_workload" && (
        <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl overflow-hidden p-8 sm:p-10 space-y-5 max-w-6xl mx-auto font-sans">
          {/* Top Letterhead */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-12 rounded bg-[#0F172B] flex flex-col items-center justify-center text-[#cca776]">
                <Scale className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="leading-tight">
                <div className="font-serif text-xs font-bold text-[#0F172B]">The Legal Solutions</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Barristers &amp; Advocates</div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-serif font-black text-[#0F172B] tracking-tight">
                The Legal Solutions
              </h2>
              <p className="text-[10px] font-bold text-[#724916] uppercase tracking-[0.2em]">
                — A L A W F I R M —
              </p>
            </div>

            <div className="text-right text-[9px] text-slate-600 leading-snug space-y-0.5">
              <p>Chamber: Topkhana Road, Seguna Bagicha, Dhaka-1000</p>
              <p>Court: Room-206, Supreme Court Bar Association, Dhaka</p>
              <p>Phone: 02-9666885, 01740615720 | www.thelegalsolutions.net</p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-[#0F172B] text-white text-center py-2.5 px-4 rounded-md">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider">
              ASSOCIATE WISE ASSIGNED CASES REPORT
            </h3>
            <p className="text-xs text-[#cca776] mt-0.5">
              (As on {todayStr})
            </p>
          </div>

          {/* Filter & Metric Container */}
          <div className="border border-slate-400 rounded grid grid-cols-1 sm:grid-cols-12 text-xs overflow-hidden">
            <div className="sm:col-span-3 p-2 bg-[#E0EEFC] border-b sm:border-b-0 sm:border-r border-slate-300 flex items-center justify-between">
              <span className="font-bold text-[#0F172B]">Report Date:</span>
              <span className="font-mono">{todayStr}</span>
            </div>
            <div className="sm:col-span-3 p-2 border-b sm:border-b-0 sm:border-r border-slate-300 flex items-center justify-between">
              <span className="font-bold text-[#0F172B]">Institution:</span>
              <span className="truncate max-w-[120px]">{selectedInst?.name || "All Institutions"}</span>
            </div>
            <div className="sm:col-span-3 p-2 border-b sm:border-b-0 sm:border-r border-slate-300 flex items-center justify-between">
              <span className="font-bold text-[#0F172B]">Associate ID:</span>
              <span className="font-bold font-mono text-[#724916]">{selectedAssociateCode === "all" ? "All" : selectedAssociateCode}</span>
            </div>
            <div className="sm:col-span-3 bg-slate-50 p-2 text-right space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-600">Total Associates:</span>
                <span className="font-bold text-[#0F172B]">{filteredAssociateGroups.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-600">Total Assigned:</span>
                <span className="font-bold text-[#724916]">{totalAssignedCasesCount} Cases</span>
              </div>
            </div>
          </div>

          {/* Grouped 10-Column Table */}
          <div className="border border-slate-300 overflow-x-auto rounded">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#E0EEFC] text-[#0F172B] font-bold border-b border-slate-400 text-center">
                  <th className="p-2 border-r border-slate-300 w-10">SL.</th>
                  <th className="p-2 border-r border-slate-300 min-w-[70px]">Associate ID</th>
                  <th className="p-2 border-r border-slate-300 min-w-[120px]">Associate Name</th>
                  <th className="p-2 border-r border-slate-300 min-w-[130px]">Institution / Client</th>
                  <th className="p-2 border-r border-slate-300 min-w-[80px]">Case File No.</th>
                  <th className="p-2 border-r border-slate-300 min-w-[120px]">Case Number(s)</th>
                  <th className="p-2 border-r border-slate-300 min-w-[160px]">Party Name &amp; Details</th>
                  <th className="p-2 border-r border-slate-300 min-w-[110px]">Matter</th>
                  <th className="p-2 border-r border-slate-300 min-w-[85px]">Date Assigned</th>
                  <th className="p-2 min-w-[160px]">Remarks (Internal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredAssociateGroups.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 italic">No associate workload assignments found.</td>
                  </tr>
                ) : (
                  filteredAssociateGroups.map((group, gIdx) => (
                    <React.Fragment key={group.associateCode}>
                      {group.cases.map((c, cIdx) => {
                        const cn = c.caseNumbers?.map((n) => n.caseNumber).filter(Boolean).join("\n") || "N/A";
                        const party = c.parties?.[0]?.partyNameDetails || "N/A";
                        const dateAssigned = c.assignedAssociate?.dateAssigned || c.assignedAdvocate?.dateAssigned || "-";
                        const remarks = c.assignedAssociate?.internalRemarks || c.assignedAdvocate?.internalRemarks || "Drafting and hearing";

                        return (
                          <tr key={c._id || c.id || cIdx} className="hover:bg-slate-50/80 align-top">
                            {cIdx === 0 && (
                              <>
                                <td rowSpan={group.cases.length} className="p-2 border-r border-slate-300 text-center font-bold text-slate-600 align-middle bg-white">
                                  {gIdx + 1}
                                </td>
                                <td rowSpan={group.cases.length} className="p-2 border-r border-slate-300 text-center font-bold font-mono text-[#0F172B] align-middle bg-white">
                                  {group.associateCode}
                                </td>
                                <td rowSpan={group.cases.length} className="p-2 border-r border-slate-300 font-bold text-[#0F172B] align-middle bg-white">
                                  {group.associateName}
                                </td>
                              </>
                            )}
                            <td className="p-2 border-r border-slate-300 font-medium text-slate-800">{c.institutionName || "Client"}</td>
                            <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-[#0F172B]">{c.chamberFileNo}</td>
                            <td className="p-2 border-r border-slate-300 font-mono text-[10px] text-[#0F172B] whitespace-pre-line">{cn}</td>
                            <td className="p-2 border-r border-slate-300 text-slate-800 leading-snug">{party}</td>
                            <td className="p-2 border-r border-slate-300 text-slate-800">{c.matter || "-"}</td>
                            <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-600">{dateAssigned}</td>
                            <td className="p-2 text-slate-700 text-[10px]">{remarks}</td>
                          </tr>
                        );
                      })}

                      {/* Subtotal Row */}
                      <tr className="bg-[#E0EEFC]/70 font-bold border-y border-slate-300">
                        <td colSpan={4} className="p-2 text-slate-900 pl-4">
                          Total Cases Assigned to {group.associateCode}
                        </td>
                        <td className="p-2 text-center font-mono text-sm text-[#0F172B] border-x border-slate-300">
                          {group.cases.length}
                        </td>
                        <td colSpan={5} className="p-2"></td>
                      </tr>
                    </React.Fragment>
                  ))
                )}

                {/* Grand Total Row */}
                <tr className="bg-[#0F172B] text-white font-bold text-xs">
                  <td colSpan={4} className="p-2.5 uppercase tracking-wider pl-4 text-[#cca776]">
                    Grand Total Assigned Cases
                  </td>
                  <td className="p-2.5 text-center font-mono text-base border-x border-slate-700">
                    {totalAssignedCasesCount}
                  </td>
                  <td colSpan={5} className="p-2.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Blocks Footer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-700">
            <div className="text-center sm:text-left">
              <div>Prepared by:  ____________________________________</div>
              <div className="font-semibold text-slate-500 pl-20 pt-1">(Admin)</div>
            </div>
            <div className="text-center sm:text-left">
              <div>Checked by:  ____________________________________</div>
              <div className="font-semibold text-slate-500 pl-20 pt-1">(Partner)</div>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Date &amp; Time: {todayStr} {nowTimeStr}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
