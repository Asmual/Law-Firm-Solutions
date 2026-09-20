"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Building2,
  Briefcase,
  FilePlus2,
  CalendarDays,
  FileSpreadsheet,
  Users2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Institutions & Banks",
    href: "/institutions",
    icon: Building2,
    badge: "100+",
  },
  {
    label: "Case Registry",
    href: "/cases",
    icon: Briefcase,
  },
  {
    label: "New Case Entry",
    href: "/cases/new",
    icon: FilePlus2,
  },
  {
    label: "Daily Cause List",
    href: "/cause-list",
    icon: CalendarDays,
  },
  {
    label: "Reports & Letterhead",
    href: "/reports",
    icon: FileSpreadsheet,
  },
  {
    label: "Associates & Team",
    href: "/team",
    icon: Users2,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300 ease-in-out z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-400/20 shadow-inner">
            <Scale className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
                Law Firm Solutions
              </span>
              <span className="text-[11px] text-amber-400/90 font-medium">
                Litigation Practice Suite
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={cn("px-3 mb-2", collapsed && "text-center")}>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {collapsed ? "—" : "Main Modules"}
          </p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/15 text-amber-400 font-semibold shadow-sm ring-1 ring-amber-500/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
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
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Chamber Security Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Bank Litigation & High Court Practice Management
          </p>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] text-slate-400">v1.0 • Enterprise Edition</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
