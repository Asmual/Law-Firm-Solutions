"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  ShieldAlert,
  Search,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Building2,
  KeyRound,
  FileText,
  Clock,
  Shield,
  Laptop,
} from "lucide-react";
import { TableSkeleton } from "@/components/common/Skeleton";

interface ActivityLogItem {
  _id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: "case" | "institution" | "user" | "auth" | "setting" | "report";
  entityId?: string;
  entityTitle?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const ENTITY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  case: {
    label: "Case File",
    icon: Briefcase,
    color: "text-[#724916] bg-[#724916]/10 border-[#ab8c67]/40 dark:text-[#cca776] dark:bg-[#cca776]/10 dark:border-[#cca776]/30",
  },
  institution: {
    label: "Institution",
    icon: Building2,
    color: "text-[#0F172B] bg-[#cca776]/20 border-[#ab8c67]/50 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700",
  },
  user: {
    label: "Practitioner",
    icon: User,
    color: "text-[#724916] bg-[#cca776]/25 border-[#cca776] dark:text-[#cca776] dark:bg-[#cca776]/10 dark:border-[#cca776]/30",
  },
  auth: {
    label: "Security/Auth",
    icon: KeyRound,
    color: "text-[#0F172B] bg-[#724916]/15 border-[#ab8c67] dark:text-[#cca776] dark:bg-[#cca776]/15 dark:border-[#cca776]/40",
  },
  setting: {
    label: "System",
    icon: Shield,
    color: "text-[#724916] bg-[#cca776]/15 border-[#ab8c67]/40 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
  },
  report: {
    label: "Report",
    icon: FileText,
    color: "text-[#0F172B] bg-[#cca776]/30 border-[#ab8c67]/60 dark:text-[#cca776] dark:bg-[#cca776]/10 dark:border-[#cca776]/30",
  },
};

function getActionColor(action: string) {
  if (action.includes("create") || action.includes("restore") || action.includes("login")) {
    return "bg-[#724916]/15 text-[#724916] border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/40";
  }
  if (action.includes("delete") || action.includes("toggle") || action.includes("logout")) {
    return "bg-[#0F172B]/10 text-[#0F172B] border-[#0F172B]/30 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
  if (action.includes("assign") || action.includes("status")) {
    return "bg-[#cca776]/20 text-[#724916] border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/40";
  }
  return "bg-[#dfceb7] text-[#0F172B] border-[#ab8c67] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ActivityAuditLogsPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const refreshLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });
      if (entityFilter !== "all") params.append("entityType", entityFilter);
      if (roleFilter !== "all") params.append("userRole", roleFilter);

      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, roleFilter]);

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "25",
    });
    if (entityFilter !== "all") params.append("entityType", entityFilter);
    if (roleFilter !== "all") params.append("userRole", roleFilter);

    fetch(`/api/activity-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setLogs(data.logs || []);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
            setTotalCount(data.pagination.total || 0);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, entityFilter, roleFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.userEmail.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      (log.entityTitle && log.entityTitle.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#724916] dark:text-[#cca776] border border-[#ab8c67]/40 dark:border-[#cca776]/30">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F172B] dark:text-white flex items-center gap-2">
                Chamber Activity &amp; Audit Log
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#724916]/10 text-[#724916] border border-[#ab8c67]/40 dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30">
                  Live Stream
                </span>
              </h1>
              <p className="text-xs text-[#724916]/80 dark:text-slate-400 mt-0.5">
                Comprehensive chronological forensic records of all litigation case updates, user role changes, and security operations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshLogs()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ab8c67] bg-[#dfceb7] text-xs font-semibold text-[#0F172B] hover:bg-[#cbb292] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#724916] text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b89360] transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#ab8c67] bg-[#dfceb7] text-[#0F172B] dark:border-slate-800 dark:bg-slate-900/80 dark:text-white shadow-sm">
          <span className="text-[11px] font-bold text-[#724916] dark:text-slate-400 uppercase tracking-wider block">
            Total Audited Events
          </span>
          <span className="text-2xl font-bold text-[#0F172B] dark:text-white mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-[#ab8c67] bg-[#dfceb7] text-[#0F172B] dark:border-slate-800 dark:bg-slate-900/80 dark:text-white shadow-sm">
          <span className="text-[11px] font-bold text-[#724916] dark:text-slate-400 uppercase tracking-wider block">
            Page View
          </span>
          <span className="text-2xl font-bold text-[#724916] dark:text-[#cca776] mt-1 block">
            {page} / {totalPages || 1}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-[#ab8c67] bg-[#dfceb7] text-[#0F172B] dark:border-slate-800 dark:bg-slate-900/80 dark:text-white shadow-sm">
          <span className="text-[11px] font-bold text-[#724916] dark:text-slate-400 uppercase tracking-wider block">
            Active Filter
          </span>
          <span className="text-sm font-semibold text-[#0F172B] dark:text-slate-200 mt-2 block capitalize">
            {entityFilter === "all" ? "All Modules" : entityFilter}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-[#ab8c67] bg-[#dfceb7] text-[#0F172B] dark:border-slate-800 dark:bg-slate-900/80 dark:text-white shadow-sm">
          <span className="text-[11px] font-bold text-[#724916] dark:text-slate-400 uppercase tracking-wider block">
            Security Status
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2 w-2 rounded-full bg-[#724916] dark:bg-[#cca776] animate-pulse" />
            <span className="text-xs font-bold text-[#724916] dark:text-[#cca776]">Tamper-Proof</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl border border-[#ab8c67] bg-[#dfceb7] dark:border-slate-800 dark:bg-slate-900/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#724916]/60 dark:text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor, file, action or keyword..."
            className="w-full rounded-lg border border-[#ab8c67] bg-white/95 dark:bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-[#0F172B] dark:text-slate-200 placeholder:text-[#724916]/40 dark:placeholder:text-slate-500 focus:border-[#724916] dark:focus:border-[#cca776] focus:outline-none transition-colors shadow-sm font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Entity Type Filter */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-950 p-1 rounded-lg border border-[#ab8c67]/60 dark:border-slate-800 text-xs">
            <span className="text-[#724916] dark:text-slate-500 px-2 font-bold">Module:</span>
            {["all", "case", "user", "institution", "auth"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setEntityFilter(type);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  entityFilter === type
                    ? "bg-[#724916] text-[#cca776] font-bold dark:bg-[#cca776] dark:text-slate-950"
                    : "text-[#0F172B] hover:text-[#724916] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-950 p-1 rounded-lg border border-[#ab8c67]/60 dark:border-slate-800 text-xs">
            <span className="text-[#724916] dark:text-slate-500 px-2 font-bold">Role:</span>
            {["all", "admin", "advocate", "associate"].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  roleFilter === role
                    ? "bg-[#724916] text-[#cca776] font-bold dark:bg-[#cca776] dark:text-slate-950"
                    : "text-[#0F172B] hover:text-[#724916] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table / Stream */}
      <div className="overflow-hidden rounded-xl border border-[#ab8c67] bg-white/95 dark:border-slate-800 dark:bg-slate-900/90 shadow-xl">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldAlert className="h-10 w-10 text-[#724916]/60 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#0F172B] dark:text-slate-300">No Audit Records Found</h3>
            <p className="text-xs text-[#724916]/80 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              There are no recorded activities matching your current search parameters or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#dfceb7] text-[#0F172B] dark:bg-slate-950 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-[#ab8c67] dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / Practitioner</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Target / File</th>
                  <th className="px-4 py-3">Forensic Description</th>
                  <th className="px-4 py-3 text-right">Device / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ab8c67]/20 dark:divide-slate-800 text-[#0F172B] dark:text-slate-300">
                {filteredLogs.map((log) => {
                  const entity = ENTITY_CONFIG[log.entityType] || ENTITY_CONFIG.setting;
                  const EntityIcon = entity.icon;

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-[#dfceb7]/30 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#724916]/80 dark:text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-[#724916]/60 dark:text-slate-500" />
                          <span>{formatTimestamp(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#cbb292]/60 border border-[#ab8c67]/60 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center font-bold text-[#724916] dark:text-[#cca776] text-xs">
                            {log.userName ? log.userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-[#0F172B] dark:text-white block">
                              {log.userName}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#724916] dark:text-[#cca776] tracking-wider">
                              {log.userRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase font-mono ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Target / Module */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${entity.color}`}
                          >
                            <EntityIcon className="h-3 w-3" />
                            <span>{entity.label}</span>
                          </span>
                          {log.entityTitle && (
                            <span
                              className="font-medium text-[#0F172B] dark:text-slate-200 truncate max-w-[140px] text-xs block"
                              title={log.entityTitle}
                            >
                              {log.entityTitle}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Forensic Description */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-[#0F172B]/90 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                          {log.description}
                        </p>
                      </td>

                      {/* Client / IP */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-[10px] text-[#724916]/70 dark:text-slate-500">
                        {log.ipAddress ? (
                          <div className="flex items-center justify-end gap-1" title={log.userAgent}>
                            <Laptop className="h-3 w-3 text-[#724916]/60 dark:text-slate-600" />
                            <span>{log.ipAddress}</span>
                          </div>
                        ) : (
                          <span>Internal Chamber</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#ab8c67]/60 bg-[#dfceb7] dark:border-slate-800 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-[#0F172B]/80 dark:text-slate-400">
            Showing Page <strong className="text-[#0F172B] dark:text-white font-bold">{page}</strong> of{" "}
            <strong className="text-[#0F172B] dark:text-white font-bold">{totalPages || 1}</strong> ({totalCount} total entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#ab8c67] bg-white/90 text-xs font-semibold text-[#0F172B] hover:bg-[#cbb292] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#ab8c67] bg-white/90 text-xs font-semibold text-[#0F172B] hover:bg-[#cbb292] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
