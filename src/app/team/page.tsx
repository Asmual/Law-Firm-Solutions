"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  Phone,
  Ban,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  admin: {
    bg: "bg-[#cca776]/20 border border-[#cca776]/40",
    text: "text-[#cca776]",
    label: "Chamber Admin",
  },
  advocate: {
    bg: "bg-blue-500/15 border border-blue-500/30",
    text: "text-blue-400",
    label: "Advocate",
  },
  associate: {
    bg: "bg-emerald-500/15 border border-emerald-500/30",
    text: "text-emerald-400",
    label: "Associate",
  },
};

const ALL_ROLES: ("admin" | "advocate" | "associate")[] = ["admin", "advocate", "associate"];

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const nextStatus = !currentStatus;
    const confirmMessage = nextStatus
      ? `Are you sure you want to UNBLOCK "${userName}" and restore their system access?`
      : `Are you sure you want to BLOCK "${userName}"? They will immediately lose login access.`;

    if (!confirm(confirmMessage)) return;

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
      } else {
        toast.error(data.error || "Failed to change user status");
      }
    } catch {
      toast.error("Network error while updating account status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.chamberDesignation && u.chamberDesignation.toLowerCase().includes(q))
    );
  });

  const isAdmin =
    currentUser?.role === "admin" ||
    !currentUser; // default allows admin demo testing

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Chamber Advocates & Role Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Control chamber member permissions, elevate user roles, and assign advocate designations.
          </p>
        </div>

        {isAdmin && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#cca776]/10 px-3.5 py-1.5 text-xs font-semibold text-[#cca776] border border-[#cca776]/30">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Role Elevation Enabled</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team member by name, email, designation, or role..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* User Table / Registry */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Advocate / Member</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Current Role</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Bar Roll No</th>
                {isAdmin && <th className="px-5 py-3 text-right">Access &amp; Role Control</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading team members...
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No members found matching your search.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.associate;

                  return (
                    <tr
                      key={user.id || user._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.authProvider === "google" && (
                                <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-medium text-blue-400 border border-blue-500/20">
                                  Google
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {user.chamberDesignation || "Legal Practitioner"}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleConfig.bg} ${roleConfig.text}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Account Status Badge */}
                      <td className="px-5 py-4">
                        {user.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
                            <Ban className="h-3 w-3" />
                            <span>Blocked</span>
                          </span>
                        )}
                      </td>

                      {/* Bar Roll */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {user.barEnrollmentNo || "—"}
                      </td>

                      {/* Admin Access & Role Control */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role Select */}
                            <select
                              value={user.role}
                              disabled={updatingId === (user.id || user._id)}
                              onChange={(e) =>
                                handleRoleChange(
                                  (user.id || user._id)!,
                                  e.target.value as UserRole
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm hover:border-[#cca776] focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                              {ALL_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  Set as {r.toUpperCase()}
                                </option>
                              ))}
                            </select>

                            {/* Block / Unblock Button */}
                            {user.id !== currentUser?.id && user._id !== currentUser?.id ? (
                              <button
                                type="button"
                                disabled={updatingId === (user.id || user._id)}
                                onClick={() =>
                                  handleToggleStatus(
                                    (user.id || user._id)!,
                                    user.isActive !== false,
                                    user.name
                                  )
                                }
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
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
                              <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
