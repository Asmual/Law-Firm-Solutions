/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Gavel,
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  Search,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User as UserType, Case, ActivityLog } from "@/types";

export default function MemberProfileMonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [member, setMember] = useState<UserType | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Filters
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");
  const [activeSection, setActiveSection] = useState<"cases" | "worklog">("cases");

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCaseToAssign, setSelectedCaseToAssign] = useState("");
  const [assignRoleType, setAssignRoleType] = useState<"advocate" | "associate">("advocate");
  const [assignRemarks, setAssignRemarks] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // 1. Fetch current session user & target member
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/users/${memberId}`).then((r) => r.json()),
    ])
      .then(([authData, memberData]) => {
        if (!isMounted) return;

        if (!authData.authenticated || !authData.user) {
          router.replace("/");
          return;
        }

        setCurrentUser(authData.user);

        // Security check: only admin or the user themselves can view this monitoring page
        if (authData.user.role !== "admin" && (authData.user.id || authData.user._id) !== memberId) {
          toast.error("Access restricted. Only Admins can monitor member portfolios.");
          router.replace("/dashboard");
          return;
        }

        if (memberData.success && memberData.user) {
          setMember(memberData.user);
          if (memberData.user.role === "associate") {
            setAssignRoleType("associate");
          }
        } else {
          toast.error("Chamber member not found");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load member profile");
      })
      .finally(() => setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [memberId, router]);

  // 2. Fetch member's cases
  const refreshMemberCases = useCallback(() => {
    setLoadingCases(true);
    fetch(`/api/cases?memberId=${memberId}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) setCases(data.cases);
      })
      .catch(() => toast.error("Error fetching member cases"))
      .finally(() => setLoadingCases(false));
  }, [memberId]);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/cases?memberId=${memberId}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.cases) setCases(data.cases);
      })
      .catch(() => toast.error("Error fetching member cases"))
      .finally(() => {
        if (isMounted) setLoadingCases(false);
      });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  // 3. Fetch member's activity logs
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/activity-logs?userId=${memberId}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.logs) setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingLogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  // 4. Fetch all cases for assignment modal (if admin)
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetch("/api/cases?limit=200")
        .then((r) => r.json())
        .then((data) => {
          if (data.cases) setAllCases(data.cases);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // Handle Case Assignment
  const handleAssignCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseToAssign) {
      toast.error("Please select a case file to assign.");
      return;
    }

    setIsAssigning(true);
    try {
      const payload: Record<string, unknown> = {
        caseId: selectedCaseToAssign,
        remarks: assignRemarks || `Assigned to ${member?.name}`,
      };

      if (assignRoleType === "advocate") {
        payload.advocateId = memberId;
      } else {
        payload.associateId = memberId;
      }

      const res = await fetch("/api/cases/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to assign case");
      }

      toast.success(`Case assigned to ${member?.name} successfully!`);
      setShowAssignModal(false);
      setSelectedCaseToAssign("");
      setAssignRemarks("");
      refreshMemberCases();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error assigning case";
      toast.error(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  // Export Member PDF Report
  const handleExportMemberPDF = () => {
    if (cases.length === 0) {
      toast.error("No case files found to generate report.");
      return;
    }

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
      doc.text("ADVOCATES & LEGAL CONSULTANTS • HIGH COURT DIVISION & APPELLATE PRACTICE", 40, 48);

      doc.setTextColor(148, 163, 184);
      doc.text(`Report Date: ${new Date().toLocaleDateString("en-GB")}`, 720, 48);

      // Member Sub-header
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        `CHAMBER WORKLOAD & LITIGATION REPORT: ${member?.name.toUpperCase() || "COUNSEL"}`,
        40,
        95
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Designation: ${member?.chamberDesignation || member?.role?.toUpperCase()} • Bar Roll No: ${
          member?.barEnrollmentNo || "N/A"
        } • Total Briefs Monitored: ${cases.length}`,
        40,
        110
      );

      const head = [
        [
          "SL",
          "CHAMBER FILE",
          "CASE NUMBER & YEAR",
          "COURT / BENCH",
          "CLIENT / INSTITUTION",
          "PARTIES INVOLVED",
          "MATTER / BRIEF",
          "STATUS",
          "NEXT HEARING",
        ],
      ];

      const body = cases.map((c, idx) => {
        const caseNo = c.caseNumbers?.[0]
          ? `${c.caseNumbers[0].caseNumber} (${c.caseNumbers[0].year})`
          : "N/A";
        const court = c.caseNumbers?.[0]?.courtDivision || "High Court";
        const party = c.parties?.[0]?.partyNameDetails || "N/A";
        const nextDate = c.statusUpdates?.[c.statusUpdates.length - 1]?.nextHearingDate || "Pending Call";

        return [
          idx + 1,
          c.chamberFileNo,
          caseNo,
          court,
          c.institutionName,
          party,
          c.matter,
          c.status.toUpperCase(),
          nextDate,
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
          1: { cellWidth: 70, fontStyle: "bold" },
          2: { cellWidth: 95 },
          3: { cellWidth: 90 },
          4: { cellWidth: 110 },
          5: { cellWidth: 130 },
          6: { cellWidth: 100 },
          7: { cellWidth: 60, halign: "center" },
          8: { cellWidth: 80 },
        },
      });

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Law Firm Legal Solutions • Supervised Member Litigation Portfolio • Page ${i} of ${totalPages}`,
          40,
          575
        );
      }

      const fileName = `${(member?.name || "Member").replace(/\s+/g, "_")}_Docket_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast.success("Member PDF report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report.");
    }
  };

  // Export Member CSV
  const handleExportMemberCSV = () => {
    if (cases.length === 0) {
      toast.error("No cases to export");
      return;
    }
    const headers = ["Chamber File No", "Institution", "Case Number", "Court", "Parties", "Matter", "Status", "Next Hearing"];
    const rows = cases.map((c) => [
      `"${c.chamberFileNo}"`,
      `"${c.institutionName}"`,
      `"${c.caseNumbers?.[0]?.caseNumber || "N/A"}"`,
      `"${c.caseNumbers?.[0]?.courtDivision || "High Court"}"`,
      `"${c.parties?.[0]?.partyNameDetails?.replace(/"/g, '""') || "N/A"}"`,
      `"${c.matter?.replace(/"/g, '""') || ""}"`,
      `"${c.status}"`,
      `"${c.statusUpdates?.[c.statusUpdates.length - 1]?.nextHearingDate || "Pending"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(member?.name || "Member").replace(/\s+/g, "_")}_Cases.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Member cases exported as CSV!");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#cca776]" />
          <span>Loading member portfolio &amp; activity records...</span>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Chamber Member Not Found</h2>
        <p className="text-xs">The requested practitioner profile does not exist or has been removed.</p>
        <Link
          href="/team"
          className="inline-flex items-center gap-1 text-xs text-[#cca776] hover:underline"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Team Directory
        </Link>
      </div>
    );
  }

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const q = caseSearchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      c.chamberFileNo.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.matter.toLowerCase().includes(q) ||
      (c.caseNumbers && c.caseNumbers.some((cn) => cn.caseNumber.toLowerCase().includes(q))) ||
      (c.parties && c.parties.some((p) => p.partyNameDetails.toLowerCase().includes(q)));

    const matchesStatus = caseStatusFilter === "all" || c.status === caseStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const runningCount = cases.filter((c) => c.status === "running").length;
  const stayCount = cases.filter((c) => c.status === "stay_granted").length;
  const adjournedCount = cases.filter((c) => c.status === "adjourned").length;
  const disposedCount = cases.filter((c) => c.status === "disposed" || c.status === "decreed").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 w-full font-sans">
      {/* Back to Team Directory */}
      <div>
        <Link
          href="/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#cca776] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chamber Advocates &amp; Roles</span>
        </Link>
      </div>

      {/* 1. Member Profile Banner - Compact & Circular Avatar */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900/90 p-4 sm:p-5 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Avatar (Circular with Gold Ring) */}
            <div className="shrink-0">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-2 ring-[#cca776] shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776] ring-2 ring-[#cca776]/40 font-bold text-2xl sm:text-3xl shadow-md">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Information */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  {member.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                    member.role === "admin"
                      ? "bg-[#cca776]/20 text-[#cca776] border border-[#cca776]/40"
                      : member.role === "advocate"
                      ? "bg-[#dfceb7] text-[#0F172B] border border-[#ab8c67] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                      : "bg-[#cca776]/15 text-[#724916] border border-[#cca776]/40 dark:bg-[#cca776]/10 dark:text-[#cca776] dark:border-[#cca776]/30"
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {member.role}
                </span>

                {member.isActive === false && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                    Suspended
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#cca776]" />
                  {member.email}
                </span>
                {member.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#cca776]" />
                    {member.phone}
                  </span>
                )}
                {member.barEnrollmentNo && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Gavel className="h-3.5 w-3.5 text-[#cca776]" />
                    Bar Roll: <span className="font-mono text-white">{member.barEnrollmentNo}</span>
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-slate-300">
                {member.chamberDesignation || "Legal Practitioner"}
              </p>

              {member.bio && (
                <p className="text-xs text-slate-400 max-w-xl italic mt-1">
                  &ldquo;{member.bio}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons for Admin */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentUser?.role === "admin" && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#cca776] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Case Brief</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportMemberCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#cca776]" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportMemberPDF}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#cca776]/40 bg-[#cca776]/10 px-3.5 py-2 text-xs font-semibold text-[#cca776] hover:bg-[#cca776]/20 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Docket (PDF)</span>
            </button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Briefs</span>
          <p className="text-xl font-bold text-[#cca776] mt-1">{cases.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Running</span>
          <p className="text-xl font-bold text-[#cca776] mt-1">{runningCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] font-semibold text-[#cca776] uppercase tracking-wider">Stay Granted</span>
          <p className="text-xl font-bold text-[#cca776] mt-1">{stayCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Adjourned</span>
          <p className="text-xl font-bold text-[#dfceb7] mt-1">{adjournedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Disposed / Decreed</span>
          <p className="text-xl font-bold text-white mt-1">{disposedCount}</p>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 w-full sm:w-80 self-start">
        <button
          type="button"
          onClick={() => setActiveSection("cases")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "cases"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Assigned Cases ({cases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("worklog")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "worklog"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Work Log ({logs.length})</span>
        </button>
      </div>

      {/* 4. Section 1: Assigned Cases */}
      {activeSection === "cases" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter cases by file no, client, case no, party..."
                value={caseSearchQuery}
                onChange={(e) => setCaseSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
              />
            </div>

            <select
              value={caseStatusFilter}
              onChange={(e) => setCaseStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-[#cca776] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="stay_granted">Stay Granted</option>
              <option value="adjourned">Adjourned</option>
              <option value="disposed">Disposed</option>
              <option value="decreed">Decreed</option>
            </select>
          </div>

          {loadingCases ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#cca776] mb-2" />
              <p>Loading assigned cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white">No cases assigned to this member</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the &ldquo;Assign Case Brief&rdquo; button above to allocate litigation to this practitioner.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((c) => {
                const caseId = c._id || c.id;
                const nextDate = c.statusUpdates?.[c.statusUpdates.length - 1]?.nextHearingDate;
                const latestOrder = c.statusUpdates?.[c.statusUpdates.length - 1]?.statusRemarks;

                return (
                  <div
                    key={caseId}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#cca776] text-sm">
                          {c.chamberFileNo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            c.status === "running"
                              ? "bg-[#724916]/20 text-[#cca776] border border-[#cca776]/40"
                              : c.status === "stay_granted"
                              ? "bg-[#cca776]/20 text-[#cca776] border border-[#cca776]/40"
                              : c.status === "adjourned"
                              ? "bg-slate-800 text-slate-300 border border-slate-700"
                              : "bg-[#0F172B] text-slate-300 border border-slate-700"
                          }`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cases/new?id=${caseId}`}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-[#cca776] border border-[#cca776]/30 transition-colors"
                        >
                          View &amp; Edit Brief
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Client / Institution:</span>
                        <span className="font-semibold text-white">{c.institutionName}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Case Number &amp; Court:</span>
                        <span className="font-mono text-slate-200">
                          {c.caseNumbers?.[0]?.caseNumber || "—"} ({c.caseNumbers?.[0]?.courtDivision || "Court"})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Parties:</span>
                        <span className="text-slate-300 truncate block" title={c.parties?.[0]?.partyNameDetails}>
                          {c.parties?.[0]?.partyNameDetails || "—"}
                        </span>
                      </div>
                    </div>

                    {(nextDate || latestOrder) && (
                      <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        {latestOrder && (
                          <span className="text-slate-400 truncate max-w-xl">
                            <strong className="text-slate-300">Latest Diary:</strong> {latestOrder}
                          </span>
                        )}
                        {nextDate && (
                          <span className="text-[#cca776] font-mono shrink-0 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next: {nextDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Section 2: Work Log & Activity Timeline */}
      {activeSection === "worklog" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#cca776]" />
              <span>Chamber Audit &amp; Performance Trail</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supervisory trail of cases updated, diary remarks entered, and actions logged by {member.name}
            </p>
          </div>

          {loadingLogs ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#cca776] mb-2" />
              <p>Loading member activity stream...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white">No actions recorded yet for this member</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
              {logs.map((log) => {
                const logId = log._id || log.id;
                const formattedTime = new Date(log.createdAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div key={logId} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-[#cca776]" />

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#cca776] uppercase tracking-wide">
                          {log.action.replace(":", " • ")}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{formattedTime}</span>
                      </div>
                      <p className="text-xs text-white font-medium">{log.description}</p>
                      {log.entityTitle && (
                        <span className="inline-block text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          Ref: {log.entityTitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Case Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#cca776]" />
                  <span>Assign Case File to {member.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocate chamber brief responsibility and track ongoing courtroom hearings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignCase} className="space-y-4 text-xs">
              {/* Select Case */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Select Chamber Case File *
                </label>
                <select
                  required
                  value={selectedCaseToAssign}
                  onChange={(e) => setSelectedCaseToAssign(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-[#cca776] focus:outline-none"
                >
                  <option value="">-- Choose Case File --</option>
                  {allCases.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.chamberFileNo} • {c.institutionName} • {c.matter}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Role Capacity */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Assignment Capacity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignRoleType("advocate")}
                    className={`rounded-lg py-2 text-xs font-semibold border transition-all cursor-pointer ${
                      assignRoleType === "advocate"
                        ? "bg-[#724916] border-[#ab8c67] text-[#cca776]"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Lead Advocate
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignRoleType("associate")}
                    className={`rounded-lg py-2 text-xs font-semibold border transition-all cursor-pointer ${
                      assignRoleType === "associate"
                        ? "bg-[#cca776] border-[#cca776] text-slate-950"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Assisting Associate
                  </button>
                </div>
              </div>

              {/* Remarks / Instructions */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Internal Instructions / Assignment Remarks
                </label>
                <textarea
                  rows={3}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="e.g. Assigned to conduct upcoming High Court stay extension hearing..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAssigning}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#cca776] text-slate-950 font-bold hover:bg-[#cca776]/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <span>Confirm Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
