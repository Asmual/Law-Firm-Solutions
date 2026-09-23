/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Camera,
  Lock,
  Save,
  Gavel,
  Loader2,
  KeyRound,
  Trash2,
  Download,
  Calendar,
  Search,
  Clock,
  FileSpreadsheet,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Case, ActivityLog } from "@/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "cases" | "worklog" | "security">("profile");

  // User details
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "associate",
    chamberDesignation: "",
    barEnrollmentNo: "",
    avatarUrl: "",
    bio: "",
    createdAt: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // My Cases State
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");

  // My Work Log State
  const [myLogs, setMyLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch current user data
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/");
          return;
        }
        const u = data.user;
        const uid = u.id || u._id || "";
        setCurrentUserId(uid);
        setProfileData({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "associate",
          chamberDesignation: u.chamberDesignation || "",
          barEnrollmentNo: u.barEnrollmentNo || "",
          avatarUrl: u.avatarUrl || "",
          bio: u.bio || "",
          createdAt: u.createdAt || "",
        });
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  // Tab change handler
  const handleTabChange = (tab: "profile" | "cases" | "worklog" | "security") => {
    setActiveTab(tab);
    if (tab === "cases" && myCases.length === 0) {
      loadMyCases();
    }
    if (tab === "worklog" && myLogs.length === 0) {
      loadMyLogs();
    }
  };

  // Load My Assigned Cases
  const loadMyCases = () => {
    setLoadingCases(true);
    fetch("/api/cases?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          const uName = profileData.name.toLowerCase();
          const filtered = data.cases.filter((c: Case) => {
            const advName = (c.assignedAdvocate?.advocateName || "").toLowerCase();
            const assocName = (c.assignedAssociate?.associateName || "").toLowerCase();
            const advId = c.assignedAdvocate?.advocateId || "";
            const assocId = c.assignedAssociate?.associateId || "";

            return (
              advId === currentUserId ||
              assocId === currentUserId ||
              (uName && advName.includes(uName)) ||
              (uName && assocName.includes(uName))
            );
          });
          setMyCases(filtered.length > 0 ? filtered : data.cases);
        }
      })
      .catch(() => {
        toast.error("Failed to load assigned cases.");
      })
      .finally(() => {
        setLoadingCases(false);
      });
  };

  // Load My Activity Logs
  const loadMyLogs = () => {
    setLoadingLogs(true);
    fetch(`/api/activity-logs?limit=50&userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) {
          setMyLogs(data.logs);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingLogs(false);
      });
  };

  // Handle Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.fileUrl) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      const newAvatarUrl = uploadData.fileUrl;

      const profileRes = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });

      if (!profileRes.ok) {
        throw new Error("Failed to link uploaded photo to profile.");
      }

      setProfileData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      toast.success("Profile photo updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error uploading image";
      toast.error(message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Photo Removal
  const handleConfirmRemovePhoto = async () => {
    setUploadingImage(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "" }),
      });

      if (!res.ok) throw new Error("Failed to remove profile photo");

      setProfileData((prev) => ({ ...prev, avatarUrl: "" }));
      toast.success("Profile photo removed.");
      setConfirmRemoveOpen(false);
    } catch {
      toast.error("Failed to remove profile photo");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save General Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          chamberDesignation: profileData.chamberDesignation,
          barEnrollmentNo: profileData.barEnrollmentNo,
          bio: profileData.bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      toast.success("Chamber practitioner profile updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      toast.success("Security credentials updated! Your password has been changed.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating password";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  // Export My Cases PDF Report
  const handleExportMyCasesPDF = () => {
    if (myCases.length === 0) {
      toast.error("No case records available to generate report.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 842, 65, "F");

      // Gold Accent
      doc.setFillColor(204, 167, 118); // #cca776
      doc.rect(0, 65, 842, 4, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("LAW FIRM SOLUTIONS", 40, 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(204, 167, 118);
      doc.text("ADVOCATES & LEGAL CONSULTANTS • HIGH COURT & APPELLATE DIVISION PRACTICE", 40, 48);

      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 720, 48);

      // Practitioner Info Subtitle
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        `LITIGATION DOCKET & BRIEF SUMMARY FOR: ${profileData.name.toUpperCase()}`,
        40,
        95
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Designation: ${profileData.chamberDesignation || roleLabel} • Bar Roll No: ${
          profileData.barEnrollmentNo || "N/A"
        } • Active Briefs: ${myCases.length}`,
        40,
        110
      );

      // Table construction
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

      const body = myCases.map((c, idx) => {
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
          2: { cellWidth: 100 },
          3: { cellWidth: 90 },
          4: { cellWidth: 100 },
          5: { cellWidth: 130 },
          6: { cellWidth: 100 },
          7: { cellWidth: 65, halign: "center" },
          8: { cellWidth: 75, halign: "center" },
        },
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Law Firm Solutions • Confidential Chamber Portfolio • Page ${i} of ${totalPages}`,
          40,
          575
        );
      }

      const fileName = `${profileData.name.replace(/\s+/g, "_")}_Case_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast.success("Case portfolio report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report.");
    }
  };

  // Export My Cases CSV
  const handleExportMyCasesCSV = () => {
    if (myCases.length === 0) {
      toast.error("No cases to export");
      return;
    }
    const headers = ["Chamber File No", "Institution", "Case Number", "Court", "Parties", "Matter", "Status", "Next Hearing"];
    const rows = myCases.map((c) => [
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
    link.setAttribute("download", `${profileData.name.replace(/\s+/g, "_")}_Cases.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Cases exported as CSV!");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-[#4a3e33] dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#724916] dark:text-[#cca776]" />
          <span>Loading chamber profile...</span>
        </div>
      </div>
    );
  }

  const roleLabel =
    profileData.role === "admin"
      ? "Managing Partner • Admin"
      : profileData.role === "advocate"
      ? "Advocate (Litigation Counsel)"
      : "Associate Advocate";

  // Filtered cases
  const filteredCases = myCases.filter((c) => {
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

  const runningCount = myCases.filter((c) => c.status === "running").length;
  const stayCount = myCases.filter((c) => c.status === "stay_granted").length;
  const adjournedCount = myCases.filter((c) => c.status === "adjourned").length;
  const disposedCount = myCases.filter((c) => c.status === "disposed" || c.status === "decreed").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 w-full font-sans">
      {/* 1. Top Executive Banner & Profile Snapshot - Dashboard Color Theme */}
      <div className="relative overflow-hidden rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          {/* Circular Avatar Container with Center Hover Camera Trigger & Remove */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="relative group h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden cursor-pointer shadow-md ring-2 ring-[#724916] dark:ring-[#cca776] bg-[#cbb292] dark:bg-slate-950 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to update photo"
            >
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#724916]/20 text-[#724916] dark:bg-[#cca776]/15 dark:text-[#cca776] font-bold text-2xl sm:text-3xl">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Photo update/edit icon overlay on hover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#cca776]" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-[#cca776]" />
                    <span className="text-[9px] font-bold text-slate-200 mt-0.5 uppercase tracking-wide">
                      Update
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* Remove button beneath avatar */}
            {profileData.avatarUrl && (
              <button
                type="button"
                onClick={() => setConfirmRemoveOpen(true)}
                disabled={uploadingImage}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          {/* Practitioner Info */}
          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172B] dark:text-white">
                {profileData.name || "Advocate Name"}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#724916] px-2.5 py-0.5 text-[11px] font-bold text-[#cca776] border border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30">
                <ShieldCheck className="h-3 w-3" />
                {roleLabel}
              </span>
            </div>

            {profileData.chamberDesignation && (
              <p className="text-xs font-bold text-[#724916] dark:text-[#cca776]">
                {profileData.chamberDesignation}
              </p>
            )}

            {/* Contact & Bar roll badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#cbb292]/50 text-[#0F172B] border border-[#ab8c67]/60 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800 font-medium">
                <Mail className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
                {profileData.email}
              </span>
              {profileData.phone && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#cbb292]/50 text-[#0F172B] border border-[#ab8c67]/60 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800 font-medium">
                  <Phone className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
                  {profileData.phone}
                </span>
              )}
              {profileData.barEnrollmentNo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#cbb292]/50 text-[#0F172B] border border-[#ab8c67]/60 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800 font-medium">
                  <Gavel className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
                  Roll: <span className="font-mono font-bold text-[#724916] dark:text-white">{profileData.barEnrollmentNo}</span>
                </span>
              )}
            </div>

            {profileData.bio && (
              <p className="text-xs text-[#4a3e33] dark:text-slate-300 italic pt-1 max-w-3xl line-clamp-2 leading-relaxed">
                &ldquo;{profileData.bio}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs - Matching Dashboard Tab Controls */}
      <div className="flex overflow-x-auto rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-1 dark:border-slate-800 dark:bg-slate-900 w-full sm:w-auto self-start shadow-sm">
        <button
          type="button"
          onClick={() => handleTabChange("profile")}
          className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#724916] text-[#cca776] shadow-md dark:bg-[#cca776] dark:text-slate-950"
              : "text-[#4a3e33] hover:text-[#0F172B] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Profile Details
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("cases")}
          className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "cases"
              ? "bg-[#724916] text-[#cca776] shadow-md dark:bg-[#cca776] dark:text-slate-950"
              : "text-[#4a3e33] hover:text-[#0F172B] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>My Cases &amp; Litigation</span>
          {myCases.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "cases"
                ? "bg-[#cca776] text-[#724916] dark:bg-slate-950 dark:text-[#cca776]"
                : "bg-[#ab8c67]/30 text-[#0F172B] dark:bg-slate-800 dark:text-slate-300"
            }`}>
              {myCases.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("worklog")}
          className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "worklog"
              ? "bg-[#724916] text-[#cca776] shadow-md dark:bg-[#cca776] dark:text-slate-950"
              : "text-[#4a3e33] hover:text-[#0F172B] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>My Work Log &amp; Diary</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "security"
              ? "bg-[#724916] text-[#cca776] shadow-md dark:bg-[#cca776] dark:text-slate-950"
              : "text-[#4a3e33] hover:text-[#0F172B] dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Security &amp; Password</span>
        </button>
      </div>

      {/* 3. TAB 1: Profile Details Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <h2 className="text-base font-bold text-[#0F172B] dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Chamber Practitioner Information</span>
            </h2>
            <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-0.5">
              Update your formal profile, courtroom designation, and bar enrollment record
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Advocate Asmual"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Chamber Email <span className="text-[#4a3e33] dark:text-slate-500 text-[10px]">(Fixed by Admin)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916]/60 dark:text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full rounded-lg border border-[#ab8c67]/60 bg-[#cbb292]/40 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-medium cursor-not-allowed opacity-80 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Official Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+8801700000000"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
              </div>
            </div>

            {/* Role Badge */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Authorized System Role
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[#ab8c67] bg-[#cbb292]/50 px-3 py-2 text-xs text-[#0F172B] dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                <span className="font-bold capitalize text-[#724916] dark:text-white">{profileData.role}</span>
                <span className="ml-auto text-[10px] text-[#4a3e33] dark:text-slate-400">Chamber policy</span>
              </div>
            </div>

            {/* Chamber Designation */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Chamber Designation / Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  value={profileData.chamberDesignation}
                  onChange={(e) =>
                    setProfileData({ ...profileData, chamberDesignation: e.target.value })
                  }
                  placeholder="e.g. Senior Advocate, Associate Partner"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
              </div>
            </div>

            {/* Bar Council Roll No */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Bar Council Enrollment Number
              </label>
              <div className="relative">
                <Gavel className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  value={profileData.barEnrollmentNo}
                  onChange={(e) =>
                    setProfileData({ ...profileData, barEnrollmentNo: e.target.value })
                  }
                  placeholder="e.g. BC/ADV/2018/7421"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
              Professional Bio &amp; Legal Practice Focus
            </label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Highlight legal expertise (e.g. Banking & Artha Rin, Writ Petitions, Company Litigation, Commercial Arbitration)..."
              className="w-full rounded-lg border border-[#ab8c67] bg-white/95 p-3 text-xs text-[#0F172B] font-medium placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none resize-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ab8c67]/40 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#724916] px-5 py-2.5 text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB 2: My Cases & Litigation */}
      {activeTab === "cases" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Quick Metrics Bar - Clean Golden Theme (No bright green/sky) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-[#4a3e33] dark:text-slate-400 uppercase tracking-wider block">
                Total Briefs
              </span>
              <p className="text-2xl font-bold text-[#0F172B] dark:text-white mt-1">{myCases.length}</p>
            </div>
            <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-[#724916] dark:text-[#cca776] uppercase tracking-wider block">
                Active Running
              </span>
              <p className="text-2xl font-bold text-[#724916] dark:text-[#cca776] mt-1">{runningCount}</p>
            </div>
            <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-[#724916] dark:text-[#dfceb7] uppercase tracking-wider block">
                Stay / Adjourned
              </span>
              <p className="text-2xl font-bold text-[#724916] dark:text-[#dfceb7] mt-1">{stayCount + adjournedCount}</p>
            </div>
            <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-[#0F172B] dark:text-slate-300 uppercase tracking-wider block">
                Disposed / Decreed
              </span>
              <p className="text-2xl font-bold text-[#0F172B] dark:text-white mt-1">{disposedCount}</p>
            </div>
          </div>

          {/* Action & Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#dfceb7] p-4 rounded-xl border border-[#ab8c67] dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search my cases by file no, client, case no, party..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-3 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
              </div>

              <select
                value={caseStatusFilter}
                onChange={(e) => setCaseStatusFilter(e.target.value)}
                className="rounded-lg border border-[#ab8c67] bg-white/95 px-3 py-2 text-xs text-[#0F172B] font-bold focus:border-[#724916] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-[#cca776]"
              >
                <option value="all">All Statuses</option>
                <option value="running">Running</option>
                <option value="stay_granted">Stay Granted</option>
                <option value="adjourned">Adjourned</option>
                <option value="disposed">Disposed</option>
                <option value="decreed">Decreed</option>
              </select>
            </div>

            {/* Download Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMyCasesCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#cbb292] text-xs font-bold text-[#0F172B] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportMyCasesPDF}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#724916] text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] transition-all cursor-pointer shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Portfolio PDF</span>
              </button>
            </div>
          </div>

          {/* Cases List */}
          {loadingCases ? (
            <div className="p-12 text-center text-xs text-[#4a3e33] dark:text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#724916] dark:text-[#cca776] mb-2" />
              <p>Loading your assigned litigation files...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-12 text-center text-[#4a3e33] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <Briefcase className="h-10 w-10 text-[#724916] dark:text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base text-[#0F172B] dark:text-white">No assigned cases found</p>
              <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-1">
                {profileData.role === "admin"
                  ? "As Admin, you monitor all chamber cases from the Cases and Team pages."
                  : "You currently have no litigation briefs assigned to your docket."}
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
                    className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white hover:border-[#724916] transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#724916] dark:text-[#cca776] text-sm">
                          {c.chamberFileNo}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === "running"
                              ? "bg-[#724916] text-[#cca776] border border-[#ab8c67] dark:bg-[#cca776]/20 dark:text-[#cca776] dark:border-[#cca776]/40"
                              : c.status === "stay_granted"
                              ? "bg-[#cca776]/20 text-[#724916] border border-[#ab8c67] dark:bg-[#cca776]/20 dark:text-[#dfceb7] dark:border-[#cca776]/40"
                              : c.status === "adjourned"
                              ? "bg-[#cbb292] text-[#0F172B] border border-[#ab8c67] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                              : "bg-[#0F172B] text-[#dfceb7] border border-[#ab8c67]/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cases/new?id=${caseId}`}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-[#cca776] border border-[#ab8c67] dark:border-[#cca776]/30 transition-colors"
                        >
                          Open &amp; Edit Brief
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[#4a3e33] dark:text-slate-400 block text-[10px] uppercase font-bold">Client Institution:</span>
                        <span className="font-bold text-[#0F172B] dark:text-white">{c.institutionName}</span>
                      </div>

                      <div>
                        <span className="text-[#4a3e33] dark:text-slate-400 block text-[10px] uppercase font-bold">Case Number &amp; Court:</span>
                        <span className="font-mono text-[#0F172B] dark:text-slate-200 font-medium">
                          {c.caseNumbers?.[0]?.caseNumber || "—"} ({c.caseNumbers?.[0]?.courtDivision || "Court"})
                        </span>
                      </div>

                      <div>
                        <span className="text-[#4a3e33] dark:text-slate-400 block text-[10px] uppercase font-bold">Primary Parties:</span>
                        <span className="text-[#0F172B] dark:text-slate-200 truncate block font-medium" title={c.parties?.[0]?.partyNameDetails}>
                          {c.parties?.[0]?.partyNameDetails || "—"}
                        </span>
                      </div>
                    </div>

                    {(nextDate || latestOrder) && (
                      <div className="bg-white/80 dark:bg-slate-950/60 rounded-lg p-2.5 border border-[#ab8c67]/50 dark:border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        {latestOrder && (
                          <span className="text-[#0F172B] dark:text-slate-300 truncate max-w-xl">
                            <strong className="text-[#724916] dark:text-[#cca776]">Latest Diary:</strong> {latestOrder}
                          </span>
                        )}
                        {nextDate && (
                          <span className="text-[#724916] dark:text-[#cca776] font-mono shrink-0 flex items-center gap-1 font-bold">
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

      {/* 5. TAB 3: My Work Log & Diary */}
      {activeTab === "worklog" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm">
            <h3 className="text-base font-bold text-[#0F172B] dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <span>Chamber Work Log &amp; Activity Stream</span>
            </h3>
            <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-1">
              Chronological log of hearing updates, case additions, and diary records made by your account
            </p>
          </div>

          {loadingLogs ? (
            <div className="p-12 text-center text-xs text-[#4a3e33] dark:text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#724916] dark:text-[#cca776] mb-2" />
              <p>Loading activity records...</p>
            </div>
          ) : myLogs.length === 0 ? (
            <div className="rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-12 text-center text-[#4a3e33] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <Clock className="h-10 w-10 text-[#724916] dark:text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base text-[#0F172B] dark:text-white">No activity logged yet</p>
              <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-1">
                Your future case updates, hearings, and brief submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#ab8c67] dark:border-slate-800 ml-4 space-y-5 py-2">
              {myLogs.map((log) => {
                const logId = log._id || log.id;
                const formattedTime = new Date(log.createdAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div key={logId} className="relative pl-6">
                    {/* Bullet marker */}
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-[#724916] dark:bg-slate-900 border-2 border-[#cca776]" />

                    <div className="rounded-xl border border-[#ab8c67] bg-[#dfceb7] p-4 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#724916] dark:text-[#cca776] uppercase tracking-wide">
                          {log.action.replace(":", " • ")}
                        </span>
                        <span className="text-[11px] text-[#4a3e33] dark:text-slate-400 font-mono font-medium">{formattedTime}</span>
                      </div>
                      <p className="text-xs text-[#0F172B] dark:text-white font-semibold leading-relaxed">{log.description}</p>
                      {log.entityTitle && (
                        <span className="inline-block text-[11px] font-mono text-[#724916] bg-[#cbb292]/50 px-2 py-0.5 rounded border border-[#ab8c67] dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">
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

      {/* 6. TAB 4: Security & Password Form */}
      {activeTab === "security" && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-5 sm:p-6 text-[#0F172B] dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xl space-y-5 max-w-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-[#0F172B] dark:text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                <span>Change Chamber Password</span>
              </h2>
              <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-0.5">
                Update and secure your chamber account credentials
              </p>
            </div>
            {(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) && (
              <button
                type="button"
                onClick={() =>
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }
                className="text-[11px] font-bold text-[#724916] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer dark:text-rose-400"
              >
                <X className="h-3 w-3" />
                <span>Clear Form</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-10 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-[#724916] dark:text-slate-400 hover:text-[#0F172B] dark:hover:text-white transition-colors cursor-pointer"
                  title={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200">
                  New Password <span className="text-rose-500">*</span>
                </label>
                {passwordData.newPassword && (
                  <span
                    className={`text-[10px] inline-flex items-center gap-1 font-bold ${
                      passwordData.newPassword.length >= 6 ? "text-[#724916] dark:text-[#cca776]" : "text-[#724916]/80 dark:text-amber-400"
                    }`}
                  >
                    {passwordData.newPassword.length >= 6 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Min length satisfied
                      </>
                    ) : (
                      <>Min 6 chars ({passwordData.newPassword.length}/6)</>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-10 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-[#724916] dark:text-slate-400 hover:text-[#0F172B] dark:hover:text-white transition-colors cursor-pointer"
                  title={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#0F172B] dark:text-slate-200">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                {passwordData.confirmPassword && (
                  <span
                    className={`text-[10px] inline-flex items-center gap-1 font-bold ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? "text-[#724916] dark:text-[#cca776]"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" /> Passwords do not match
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#724916] dark:text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full rounded-lg border border-[#ab8c67] bg-white/95 pl-8 pr-10 py-2 text-xs text-[#0F172B] font-semibold placeholder-[#724916]/40 focus:border-[#724916] focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-[#cca776]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-[#724916] dark:text-slate-400 hover:text-[#0F172B] dark:hover:text-white transition-colors cursor-pointer"
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ab8c67]/40 dark:border-slate-800">
            <button
              type="submit"
              disabled={
                changingPassword ||
                !passwordData.currentPassword ||
                passwordData.newPassword.length < 6 ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#724916] px-5 py-2.5 text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b8935f] shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Remove Photo Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your chamber profile photo? Your avatar will revert to your name initial."
        confirmText="Remove Photo"
        cancelText="Keep Photo"
        variant="danger"
        isLoading={uploadingImage}
      />
    </div>
  );
}
