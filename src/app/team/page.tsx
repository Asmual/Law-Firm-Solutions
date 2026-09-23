/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  Ban,
  CheckCircle,
  Briefcase,
  LayoutGrid,
  List,
  Award,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { CardSkeleton, TableSkeleton } from "@/components/common/Skeleton";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  admin: {
    bg: "bg-[#724916]/15 border border-[#ab8c67] dark:bg-[#cca776]/20 dark:border-[#cca776]/40",
    text: "text-[#724916] dark:text-[#cca776]",
    label: "Admin",
  },
  advocate: {
    bg: "bg-[#dfceb7] border border-[#ab8c67] dark:bg-slate-800 dark:border-slate-700",
    text: "text-[#0F172B] dark:text-slate-200",
    label: "Advocate",
  },
  associate: {
    bg: "bg-[#cca776]/15 border border-[#cca776]/40 dark:bg-[#cca776]/10 dark:border-[#cca776]/30",
    text: "text-[#724916] dark:text-[#cca776]",
    label: "Associate",
  },
};

const ALL_ROLES: ("admin" | "advocate" | "associate")[] = ["admin", "advocate", "associate"];

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"directory" | "table">("directory");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    userId: string;
    nextStatus: boolean;
    userName: string;
    isProcessing: boolean;
  }>({
    isOpen: false,
    userId: "",
    nextStatus: false,
    userName: "",
    isProcessing: false,
  });

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({ authenticated: false })),
      fetch("/api/users").then((r) => r.json()).catch(() => ({ success: false })),
    ]).then(([authData, usersData]) => {
      if (!isMounted) return;
      if (authData?.authenticated && authData?.user) {
        setCurrentUser(authData.user);
      }
      if (usersData?.success && usersData?.data) {
        setUsers(usersData.data);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Role updated to ${newRole}`);
        refreshUsers();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Network error while updating role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openStatusModal = (userId: string, currentStatus: boolean, userName: string) => {
    setStatusModal({
      isOpen: true,
      userId,
      nextStatus: !currentStatus,
      userName,
      isProcessing: false,
    });
  };

  const handleConfirmToggleStatus = async () => {
    const { userId, nextStatus } = statusModal;
    if (!userId) return;

    setStatusModal((prev) => ({ ...prev, isProcessing: true }));
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        refreshUsers();
        setStatusModal({ isOpen: false, userId: "", nextStatus: false, userName: "", isProcessing: false });
      } else {
        toast.error(data.error || "Failed to change user status");
        setStatusModal((prev) => ({ ...prev, isProcessing: false }));
      }
    } catch {
      toast.error("Network error while updating account status.");
      setStatusModal((prev) => ({ ...prev, isProcessing: false }));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.chamberDesignation && u.chamberDesignation.toLowerCase().includes(q)) ||
      (u.barEnrollmentNo && u.barEnrollmentNo.toLowerCase().includes(q))
    );
  });

  const isAdmin =
    currentUser?.role === "admin" ||
    !currentUser; // default allows admin demo testing

  const totalAdvocates = users.filter((u) => u.role === "advocate").length;
  const totalAssociates = users.filter((u) => u.role === "associate").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Chamber Practitioners &amp; Profiles Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect all chamber Advocates, Associates, and Admins, review individual case dossiers, and monitor performance progress.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Admin Status */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setViewMode("directory")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "directory"
                  ? "bg-[#cca776] text-slate-950 font-bold shadow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Profiles Grid</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#cca776] text-slate-950 font-bold shadow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Management Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Practitioners
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {users.length}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Advocates
          </span>
          <span className="text-2xl font-bold text-[#724916] dark:text-[#cca776] mt-1 block">
            {totalAdvocates}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Associates
          </span>
          <span className="text-2xl font-bold text-[#0F172B] dark:text-slate-200 mt-1 block">
            {totalAssociates}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Admins
          </span>
          <span className="text-2xl font-bold text-[#cca776] mt-1 block">
            {totalAdmins}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search practitioner by name, email, roll no..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#cca776] focus:outline-none transition-colors"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs w-full md:w-auto overflow-x-auto">
          <span className="text-slate-500 px-2 font-medium shrink-0">Role:</span>
          {["all", "advocate", "associate", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize shrink-0 cursor-pointer ${
                roleFilter === r
                  ? "bg-[#cca776] text-slate-950 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              {r === "all" ? "All Profiles" : r}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode: Profiles Grid (Directory) */}
      {viewMode === "directory" ? (
        loading ? (
          <CardSkeleton count={6} />
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 shadow-sm">
            <Users className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No practitioners found</p>
            <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or role filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const userId = user.id || user._id;
              const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.associate;

              return (
                <div
                  key={userId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-lg hover:border-[#cca776]/50 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Role */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#cca776]/40 flex items-center justify-center font-bold text-lg text-[#cca776] shadow-md">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {/* Online/Active status dot */}
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            user.isActive !== false ? "bg-emerald-400" : "bg-rose-500"
                          }`}
                          title={user.isActive !== false ? "Active Member" : "Suspended"}
                        />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${roleConfig.bg} ${roleConfig.text}`}
                        >
                          {roleConfig.label}
                        </span>
                        {user.isActive === false && (
                          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.2 rounded border border-rose-500/20">
                            Suspended
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Details */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#cca776] transition-colors flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.authProvider === "google" && (
                          <span className="rounded bg-[#724916]/10 px-1.5 py-0.2 text-[9px] font-semibold text-[#724916] dark:text-[#cca776] border border-[#ab8c67]/40">
                            Google
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                        {user.chamberDesignation || "Chamber Practitioner"}
                      </p>
                      {user.barEnrollmentNo && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-mono">
                          <Award className="h-3 w-3 text-[#cca776]" />
                          <span>Bar Roll: {user.barEnrollmentNo}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-slate-400 truncate">
                          <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: View Progress Button */}
                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                      href={`/team/${userId}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#cca776] text-slate-800 hover:text-slate-950 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:border-[#cca776] text-xs font-semibold transition-all cursor-pointer group-hover:shadow-md"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-[#cca776] group-hover:text-slate-950 transition-colors" />
                      <span>View Profile &amp; Work Progress</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* View Mode: Management Table */
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Advocate / Member</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3">Bar Roll No</th>
                  <th className="px-4 py-3 text-right">Access &amp; Role Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <TableSkeleton rows={6} cols={7} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userId = user.id || user._id;
                    const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.associate;

                    return (
                      <tr
                        key={userId}
                        className="transition-colors"
                      >
                        {/* Name & Email */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Link
                            href={`/team/${userId}`}
                            className="flex items-center gap-2.5 group"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 group-hover:border-[#cca776] transition-colors shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#cca776] transition-colors flex items-center gap-1.5 whitespace-nowrap">
                                <span>{user.name}</span>
                                {user.authProvider === "google" && (
                                  <span className="rounded bg-[#724916]/10 px-1.5 py-0.2 text-[9px] font-medium text-[#724916] dark:text-[#cca776] border border-[#ab8c67]/30">
                                    Google
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap block">
                                {user.email}
                              </span>
                            </div>
                          </Link>
                        </td>

                        {/* Designation */}
                        <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {user.chamberDesignation || "Legal Practitioner"}
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {user.phone ? (
                            <div className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${roleConfig.bg} ${roleConfig.text}`}
                          >
                            {roleConfig.label}
                          </span>
                        </td>

                        {/* Account Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {user.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#724916]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#724916] dark:text-[#cca776] border border-[#ab8c67]/40 whitespace-nowrap">
                              <CheckCircle className="h-3 w-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30 whitespace-nowrap">
                              <Ban className="h-3 w-3" />
                              <span>Blocked</span>
                            </span>
                          )}
                        </td>

                        {/* Bar Roll */}
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                          {user.barEnrollmentNo || "—"}
                        </td>

                        {/* Admin Access & Role Control */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            {/* View Profile & Cases Dossier */}
                            <Link
                              href={`/team/${userId}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#cca776]/40 bg-[#cca776]/10 px-2.5 py-1 text-xs font-semibold text-[#cca776] hover:bg-[#cca776]/20 transition-colors whitespace-nowrap"
                              title="Inspect assigned cases, work log, and generate report"
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>View Dossier</span>
                            </Link>

                            {isAdmin && (
                              <>
                                {/* Role Select */}
                                <select
                                  value={user.role}
                                  disabled={updatingId === userId}
                                  onChange={(e) =>
                                    handleRoleChange(userId!, e.target.value as UserRole)
                                  }
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:border-[#cca776] focus:border-[#cca776] focus:outline-none cursor-pointer whitespace-nowrap uppercase"
                                >
                                  {ALL_ROLES.map((r) => (
                                    <option key={r} value={r}>
                                      {r.toUpperCase()}
                                    </option>
                                  ))}
                                </select>

                                {/* Block / Unblock Button */}
                                {user.id !== currentUser?.id && user._id !== currentUser?.id ? (
                                  <button
                                    type="button"
                                    disabled={updatingId === userId}
                                    onClick={() =>
                                      openStatusModal(
                                        userId!,
                                        user.isActive !== false,
                                        user.name
                                      )
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                      user.isActive !== false
                                        ? "bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-900/60"
                                        : "bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60"
                                    }`}
                                  >
                                    {user.isActive !== false ? (
                                      <>
                                        <Ban className="h-3 w-3" />
                                        <span>Block</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Unblock</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-800 rounded border border-slate-700 whitespace-nowrap">
                                    You
                                  </span>
                                )}
                              </>
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
      )}

      {/* User Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() =>
          setStatusModal({ isOpen: false, userId: "", nextStatus: false, userName: "", isProcessing: false })
        }
        onConfirm={handleConfirmToggleStatus}
        title={statusModal.nextStatus ? "Reactivate Chamber Member" : "Suspend Chamber Access"}
        message={
          statusModal.nextStatus
            ? `Are you sure you want to reactivate "${statusModal.userName}"? Their chamber login access will be restored immediately.`
            : `Are you sure you want to suspend "${statusModal.userName}"? They will immediately lose login access and be blocked from accessing case files.`
        }
        confirmText={statusModal.nextStatus ? "Reactivate Access" : "Block Member"}
        cancelText="Cancel"
        variant={statusModal.nextStatus ? "gold" : "danger"}
        isLoading={statusModal.isProcessing}
      />
    </div>
  );
}
