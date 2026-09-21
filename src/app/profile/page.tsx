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

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      .finally(() => setLoading(false));
  }, [router]);

  const handleTabChange = (tab: "profile" | "cases" | "worklog" | "security") => {
    setActiveTab(tab);
    if (tab === "cases") setLoadingCases(true);
    if (tab === "worklog") setLoadingLogs(true);
  };

  // Fetch My Cases when clicking the cases tab
  useEffect(() => {
    if (activeTab === "cases" && currentUserId) {
      let isMounted = true;
      fetch(`/api/cases?memberId=${currentUserId}&limit=200`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.cases) {
            setMyCases(data.cases);
          }
        })
        .catch(() => {
          toast.error("Failed to load assigned cases");
        })
        .finally(() => {
          if (isMounted) setLoadingCases(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [activeTab, currentUserId]);

  // Fetch Work Log when clicking the worklog tab
  useEffect(() => {
    if (activeTab === "worklog" && currentUserId) {
      let isMounted = true;
      fetch(`/api/activity-logs?userId=${currentUserId}&limit=50`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.logs) {
            setMyLogs(data.logs);
          }
        })
        .catch(() => {
          toast.error("Failed to load work log");
        })
        .finally(() => {
          if (isMounted) setLoadingLogs(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [activeTab, currentUserId]);

  // Handle Image Upload directly to Cloudinary via /api/upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const uploadedUrl = data.url;
      setProfileData((prev) => ({ ...prev, avatarUrl: uploadedUrl }));

      // Immediately persist to database
      const saveRes = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploadedUrl }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save avatar URL to user profile");
      }

      toast.success("Profile photo uploaded to Cloudinary successfully!", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading image";
      toast.error(msg, { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Photo handler
  const handleRemovePhoto = async () => {
    if (!profileData.avatarUrl) return;
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    setUploadingImage(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "" }),
      });
      if (!res.ok) throw new Error("Failed to remove avatar");
      setProfileData((prev) => ({ ...prev, avatarUrl: "" }));
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Could not remove photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save profile information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          chamberDesignation: profileData.chamberDesignation,
          barEnrollmentNo: profileData.barEnrollmentNo,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile details updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Change Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      toast.error(msg);
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
      doc.text("LAW FIRM LEGAL SOLUTIONS", 40, 32);

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
          `Law Firm Legal Solutions • Counsel Case Portfolio • Confidential • Page ${i} of ${totalPages}`,
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
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#cca776]" />
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
      {/* 1. Header Banner & Profile Snapshot - Compact, Modern & Snug */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900/90 p-4 sm:p-5 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          {/* Circular Avatar Container with Integrated Camera & Remove */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-2 ring-[#cca776] shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776] ring-2 ring-[#cca776]/40 font-bold text-2xl sm:text-3xl shadow-md cursor-pointer hover:bg-[#cca776]/20 transition-colors"
                >
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Pinned Camera Badge Button on the bottom-right of avatar circle */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Upload or Change Photo"
                aria-label="Upload photo"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#cca776] text-slate-950 hover:bg-[#cca776]/90 hover:scale-110 transition-transform shadow-md cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* Remove button directly beneath the avatar circle */}
            {profileData.avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploadingImage}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50 hover:underline"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          {/* Practitioner Info - Tightly fitted without massive gaps */}
          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {profileData.name || "Advocate Name"}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#cca776]/15 px-2 py-0.5 text-[11px] font-semibold text-[#cca776] border border-[#cca776]/30">
                <ShieldCheck className="h-3 w-3" />
                {roleLabel}
              </span>
            </div>

            {profileData.chamberDesignation && (
              <p className="text-xs font-semibold text-[#cca776]/90">
                {profileData.chamberDesignation}
              </p>
            )}

            {/* Contact & Bar roll badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
                <Mail className="h-3 w-3 text-[#cca776]" />
                {profileData.email}
              </span>
              {profileData.phone && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
                  <Phone className="h-3 w-3 text-[#cca776]" />
                  {profileData.phone}
                </span>
              )}
              {profileData.barEnrollmentNo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
                  <Gavel className="h-3 w-3 text-[#cca776]" />
                  Roll: <span className="font-mono text-white">{profileData.barEnrollmentNo}</span>
                </span>
              )}
            </div>

            {profileData.bio && (
              <p className="text-[11px] text-slate-400 italic pt-0.5 max-w-3xl line-clamp-2">
                &ldquo;{profileData.bio}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (Mobile-responsive horizontal scroll) */}
      <div className="flex overflow-x-auto rounded-xl bg-slate-900/90 p-1 border border-slate-800 w-full sm:w-auto self-start">
        <button
          type="button"
          onClick={() => handleTabChange("profile")}
          className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Profile Details
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("cases")}
          className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "cases"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>My Cases &amp; Litigation</span>
          {myCases.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "cases" ? "bg-slate-950 text-[#cca776]" : "bg-slate-800 text-slate-300"}`}>
              {myCases.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("worklog")}
          className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "worklog"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>My Work Log &amp; Diary</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "security"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
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
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg space-y-4 animate-in fade-in"
        >
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#cca776]" />
              <span>Chamber Practitioner Information</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Update your formal profile, courtroom designation, and bar enrollment record
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Barrister / Advocate Name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Official Email (Read-only verified) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chamber Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 pl-8 pr-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Official chamber login credential
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+88017XXXXXXXX"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Role Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized System Role
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-[#cca776]" />
                <span className="font-semibold capitalize text-white">{profileData.role}</span>
                <span className="ml-auto text-[10px] text-slate-500">Chamber policy</span>
              </div>
            </div>

            {/* Chamber Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chamber Designation / Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={profileData.chamberDesignation}
                  onChange={(e) =>
                    setProfileData({ ...profileData, chamberDesignation: e.target.value })
                  }
                  placeholder="e.g. Senior Advocate, Associate Partner"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bar Council Roll No */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bar Council Enrollment Number
              </label>
              <div className="relative">
                <Gavel className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={profileData.barEnrollmentNo}
                  onChange={(e) =>
                    setProfileData({ ...profileData, barEnrollmentNo: e.target.value })
                  }
                  placeholder="e.g. BC/ADV/2018/7421"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Professional Bio &amp; Legal Practice Focus
            </label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Highlight legal expertise (e.g. Banking & Artha Rin, Writ Petitions, Company Litigation, Commercial Arbitration)..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#cca776] px-5 py-2 text-xs font-bold text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-50"
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
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Briefs</span>
              <p className="text-xl font-bold text-[#cca776] mt-1">{myCases.length}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Active Running</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{runningCount}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Stay / Adjourned</span>
              <p className="text-xl font-bold text-amber-400 mt-1">{stayCount + adjournedCount}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Disposed / Decreed</span>
              <p className="text-xl font-bold text-sky-400 mt-1">{disposedCount}</p>
            </div>
          </div>

          {/* Action & Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search my cases by file no, client, case no, party..."
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

            {/* Download Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMyCasesCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#cca776]" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportMyCasesPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#cca776] text-xs font-bold text-slate-950 hover:bg-[#cca776]/90 transition-all cursor-pointer shadow-md shadow-[#cca776]/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download My Report (PDF)</span>
              </button>
            </div>
          </div>

          {/* Cases List */}
          {loadingCases ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#cca776] mb-2" />
              <p>Loading your assigned litigation files...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white">No assigned cases found</p>
              <p className="text-xs text-slate-500 mt-1">
                {profileData.role === "admin"
                  ? "As Chamber Admin, you monitor all chamber cases from the Cases and Team pages."
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
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                              : c.status === "stay_granted"
                              ? "bg-[#cca776]/20 text-[#cca776] border border-[#cca776]/40"
                              : c.status === "adjourned"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
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
                          Open &amp; Edit Brief
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Client Institution:</span>
                        <span className="font-semibold text-white">{c.institutionName}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Case Number &amp; Court:</span>
                        <span className="font-mono text-slate-200">
                          {c.caseNumbers?.[0]?.caseNumber || "—"} ({c.caseNumbers?.[0]?.courtDivision || "Court"})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Primary Parties:</span>
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

      {/* 5. TAB 3: My Work Log & Diary */}
      {activeTab === "worklog" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#cca776]" />
              <span>Chamber Work Log &amp; Activity Stream</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chronological log of hearing updates, case additions, and diary records made by your account
            </p>
          </div>

          {loadingLogs ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#cca776] mb-2" />
              <p>Loading activity records...</p>
            </div>
          ) : myLogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white">No activity logged yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your future case updates, hearings, and brief submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
              {myLogs.map((log) => {
                const logId = log._id || log.id;
                const formattedTime = new Date(log.createdAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div key={logId} className="relative pl-6">
                    {/* Bullet marker */}
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

      {/* 6. TAB 4: Security & Password Form */}
      {activeTab === "security" && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-lg space-y-5 max-w-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#cca776]" />
                <span>Change Chamber Password</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Update and secure your chamber account credentials
              </p>
            </div>
            {(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) && (
              <button
                type="button"
                onClick={() =>
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Clear Form</span>
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  New Password <span className="text-rose-400">*</span>
                </label>
                {passwordData.newPassword && (
                  <span
                    className={`text-[10px] inline-flex items-center gap-1 font-semibold ${
                      passwordData.newPassword.length >= 6 ? "text-emerald-400" : "text-amber-400"
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
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                {passwordData.confirmPassword && (
                  <span
                    className={`text-[10px] inline-flex items-center gap-1 font-semibold ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? "text-emerald-400"
                        : "text-rose-400"
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
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={
                changingPassword ||
                !passwordData.currentPassword ||
                passwordData.newPassword.length < 6 ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#cca776] px-5 py-2 text-xs font-bold text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
    </div>
  );
}
