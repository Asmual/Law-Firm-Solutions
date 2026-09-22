"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Building2,
  Briefcase,
  FilePlus2,
  FileSpreadsheet,
  Users2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  History,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { BRANDING } from "@/config/branding";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Institution / Client",
    href: "/institutions",
    icon: Building2,
    // Bulky 100+ badge removed per specification
  },
  {
    label: "Case Database",
    href: "/cases",
    icon: Briefcase,
  },
  {
    label: "Add Case File",
    href: "/cases/new",
    icon: FilePlus2,
  },
  {
    label: "Reports & Letterhead",
    href: "/reports",
    icon: FileSpreadsheet,
  },
  {
    label: "Advocates & Associates",
    href: "/team",
    icon: Users2,
    adminOnly: true,
  },
  {
    label: "Activity Audit Log",
    href: "/activity-logs",
    icon: History,
    adminOnly: true,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: UserCircle,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#ab8c67] bg-[#c4a882] text-black dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-all duration-300 ease-in-out select-none lg:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#ab8c67] dark:border-slate-800">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#382613] text-[#cca776] ring-1 ring-[#ab8c67] shadow-inner dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30">
              <Scale className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-wide text-black dark:text-slate-100 uppercase">
                  {BRANDING.brandName}
                </span>
                <span className="text-[11px] text-[#382613] dark:text-[#cca776] font-bold">
                  {BRANDING.tagline}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          <div className={cn("px-2.5 mb-2", collapsed && "text-center")}>
            <p className="text-[10px] font-bold tracking-wider text-[#4a3e33] dark:text-slate-500 uppercase">
              {collapsed ? "—" : "Chamber Modules"}
            </p>
          </div>

          {navItems
            .filter((item) => {
              if (item.adminOnly && userRole !== "admin") return false;
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = (() => {
                // Highlighting /dashboard, /dashboard/admin, /dashboard/advocate, /dashboard/associate
                if (item.href === "/dashboard") {
                  return (
                    pathname === "/dashboard" ||
                    pathname.startsWith("/dashboard/")
                  );
                }
                if (item.href === "/cases") {
                  return (
                    pathname === "/cases" ||
                    (pathname.startsWith("/cases/") && pathname !== "/cases/new")
                  );
                }
                if (item.href === "/cases/new") {
                  return pathname === "/cases/new";
                }
                return pathname === item.href || pathname.startsWith(item.href + "/");
              })();

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-[#382613] text-[#cca776] font-bold shadow-md ring-1 ring-[#382613] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30"
                      : "text-black hover:bg-[#b89b74] hover:text-black font-semibold dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive
                        ? "text-[#cca776]"
                        : "text-black group-hover:text-black dark:text-slate-400 dark:group-hover:text-slate-200"
                    )}
                  />
                  {!collapsed && (
                    <div className="flex flex-1 items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-[#382613] text-[#cca776] px-2 py-0.5 text-[10px] font-bold border border-[#ab8c67] dark:bg-slate-800 dark:text-[#cca776] dark:border-[#cca776]/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Chamber Status Info */}
        {!collapsed && (
          <div className="p-3 mx-2.5 mb-3 rounded-xl bg-[#dfceb7] border border-[#ab8c67] dark:bg-slate-900/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>Chamber System Active</span>
            </div>
            <p className="mt-1 text-[11px] text-[#4a3e33] dark:text-slate-400">
              Role: <strong className="text-[#382613] dark:text-[#cca776] uppercase font-bold">{userRole || "User"}</strong>
            </p>
            {BRANDING.poweredByEnabled && (
              <p className="mt-1.5 text-[10px] text-[#4a3e33] dark:text-slate-500 border-t border-[#ab8c67] dark:border-slate-800 pt-1.5">
                Powered by {BRANDING.poweredByName}
              </p>
            )}
          </div>
        )}

        {/* Collapse Toggle Button */}
        <div className="p-3 border-t border-[#ab8c67] dark:border-slate-800 hidden lg:flex items-center justify-between">
          {!collapsed && (
            <span className="text-[11px] text-[#4a3e33] dark:text-slate-500">v1.0 • Formal Edition</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-[#dfceb7] border border-[#ab8c67] text-black hover:bg-[#cca776] hover:text-black dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
