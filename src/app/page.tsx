"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  Building2,
  Briefcase,
  FileSpreadsheet,
  ArrowRight,
  Lock,
  Mail,
  User,
  Gavel,
  LogOut,
  Landmark,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const SIGNUP_ROLES: { value: "advocate" | "associate"; label: string; desc: string }[] = [
  {
    value: "advocate",
    label: "Advocate (High Court / Subordinate Courts)",
    desc: "Manage assigned files, court petitions & hearings",
  },
  {
    value: "associate",
    label: "Associate Advocate",
    desc: "Daily hearing updates, cause list tracking & filing records",
  },
];

const PARTNER_BANKS = [
  "NRB Bank PLC",
  "BRAC Bank PLC",
  "City Bank PLC",
  "Eastern Bank PLC",
  "Islami Bank Bangladesh PLC",
  "Dutch-Bangla Bank PLC",
  "United Commercial Bank PLC",
  "Pubali Bank PLC",
  "Standard Bank PLC",
  "EXIM Bank PLC",
];

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
    chamberDesignation?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form State
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "associate" as "advocate" | "associate",
    chamberDesignation: "Associate Advocate",
    barEnrollmentNo: "",
    phone: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}!`);
        setCurrentUser(data.user);
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Account created successfully as ${signupData.role}!`);
        setCurrentUser(data.user);
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#cca776]/30 selection:text-[#cca776]">
      {/* 1. TOP WEBSITE HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Chamber Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30 shadow-inner group-hover:scale-105 transition-transform">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <span>Law Firm Legal Solutions</span>
              </div>
              <p className="text-[11px] text-[#cca776] font-medium tracking-wide">
                The Legal Solutions • Bank Litigation Practice
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#practice-areas" className="hover:text-[#cca776] transition-colors">
              Practice Areas
            </a>
            <a href="#flow-chart" className="hover:text-[#cca776] transition-colors">
              Case Workflow
            </a>
            <a href="#banking-clients" className="hover:text-[#cca776] transition-colors">
              Banking Clients
            </a>
            <Link href="/institutions" className="hover:text-[#cca776] transition-colors">
              100+ Banks Directory
            </Link>
          </nav>

          {/* Top Right Action */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <a
                href="#portal"
                className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Chamber Portal Access</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH EMBEDDED PORTAL */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cca776]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-[#cca776]/10 px-4 py-1.5 text-xs font-semibold text-[#cca776] border border-[#cca776]/30">
                <Gavel className="h-4 w-4" />
                <span>Supreme Court of Bangladesh & Bank Litigation Chamber</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                LAW FIRM <span className="text-[#cca776]">LEGAL SOLUTIONS</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
                The comprehensive legal management suite for high-volume banking litigation, High Court writ petitions, Artha Rin recovery suits, and automated corporate letterhead reporting.
              </p>

              {/* Feature Highlights Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">100+ Banking Institutions</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">NRB Bank, BRAC Bank, EBL & Islamic Banks</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Automated Letterhead Reports</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Instant monthly PDF status for bank SAMDs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Daily Cause List & Hearing Diary</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Never miss an order date or limitation period</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Chamber Access Control</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Role-based privileges: Admin, Advocate, Associate</p>
                  </div>
                </div>
              </div>

              {/* Trust Counters */}
              <div className="pt-4 flex flex-wrap items-center gap-8 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-2xl font-bold text-[#cca776]">100+</span>
                  <p className="text-[11px] text-slate-400">Institutional Clients</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-2xl font-bold text-white">1,500+</span>
                  <p className="text-[11px] text-slate-400">Active Litigations</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-2xl font-bold text-emerald-400">96.4%</span>
                  <p className="text-[11px] text-slate-400">Recovery Decree Rate</p>
                </div>
              </div>
            </div>

            {/* Right Column: EMBEDDED LOGIN & SIGNUP PORTAL (5 Cols) */}
            <div id="portal" className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
                {currentUser ? (
                  /* ALREADY LOGGED IN STATE */
                  <div className="space-y-6 text-center py-4 animate-in fade-in">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30">
                      <Gavel className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-[#cca776]/20 px-3 py-1 text-[11px] font-bold text-[#cca776] uppercase tracking-wider">
                        Active Chamber Session
                      </span>
                      <h2 className="text-xl font-bold text-white">
                        Welcome, {currentUser.name}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {currentUser.role.toUpperCase()} • {currentUser.chamberDesignation || "Practitioner"}
                      </p>
                    </div>

                    <div className="pt-2 space-y-3">
                      <Link
                        href="/dashboard"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all hover:scale-[1.01]"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Enter Chamber Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href="/cases/new"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <span>+ Add New Case File</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors pt-2"
                      >
                        Sign Out from Chamber
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LOGIN & SIGNUP FORMS */
                  <div>
                    {/* Tab Navigation */}
                    <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab("signin")}
                        className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                          activeTab === "signin"
                            ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                          activeTab === "signup"
                            ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Register Account
                      </button>
                    </div>

                    {/* SIGN IN FORM */}
                    {activeTab === "signin" && (
                      <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Official Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="email"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="advocate@chamber.com"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Chamber Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="password"
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-2"
                        >
                          <span>{loading ? "Authenticating..." : "Sign In to Chamber Portal"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>

                        <div className="relative my-4 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800" />
                          </div>
                          <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500">
                            Or continue with
                          </span>
                        </div>

                        <a
                          href="/api/auth/google"
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                            />
                          </svg>
                          <span>Continue with Google (Gmail)</span>
                        </a>
                      </form>
                    )}

                    {/* SIGN UP FORM (Advocate / Associate only) */}
                    {activeTab === "signup" && (
                      <form onSubmit={handleSignup} className="space-y-3 animate-in fade-in">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Full Legal Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                            <input
                              type="text"
                              required
                              value={signupData.name}
                              onChange={(e) =>
                                setSignupData({ ...signupData, name: e.target.value })
                              }
                              placeholder="Advocate / Associate Name"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={signupData.email}
                              onChange={(e) =>
                                setSignupData({ ...signupData, email: e.target.value })
                              }
                              placeholder="name@chamber.com"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Password (Min 6 chars) *
                            </label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              value={signupData.password}
                              onChange={(e) =>
                                setSignupData({ ...signupData, password: e.target.value })
                              }
                              placeholder="••••••••"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Chamber Role Selection */}
                        <div>
                          <label className="block text-xs font-semibold text-[#cca776] mb-1">
                            Chamber Role *
                          </label>
                          <select
                            value={signupData.role}
                            onChange={(e) => {
                              const selectedRole = e.target.value as "advocate" | "associate";
                              setSignupData({
                                ...signupData,
                                role: selectedRole,
                                chamberDesignation:
                                  selectedRole === "advocate" ? "Advocate" : "Associate Advocate",
                              });
                            }}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-[#cca776] focus:outline-none font-medium"
                          >
                            {SIGNUP_ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Admin accounts are configured manually by Managing Partners.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Designation
                            </label>
                            <input
                              type="text"
                              value={signupData.chamberDesignation}
                              onChange={(e) =>
                                setSignupData({
                                  ...signupData,
                                  chamberDesignation: e.target.value,
                                })
                              }
                              placeholder="Associate Advocate"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Bar Roll No (Optional)
                            </label>
                            <input
                              type="text"
                              value={signupData.barEnrollmentNo}
                              onChange={(e) =>
                                setSignupData({
                                  ...signupData,
                                  barEnrollmentNo: e.target.value,
                                })
                              }
                              placeholder="e.g. SC-1234/2015"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-1"
                        >
                          <span>{loading ? "Registering..." : "Create Account & Enter Chamber"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>

                        <a
                          href="/api/auth/google"
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors"
                        >
                          <span>Sign up with Google</span>
                        </a>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CASE DATABASE FLOW CHART (Directly Showcasing Image 2 Architecture) */}
      <section id="flow-chart" className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#cca776]">
              System Workflow & Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Case Database Flow Chart
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              The standardized litigation lifecycle connecting chamber practitioners with institutional banking clients.
            </p>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center space-y-2 relative">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-white">1. Login</h3>
              <p className="text-[11px] text-slate-400">Admin, Advocate & Associate Role Access</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center space-y-2 relative">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-white">2. Dashboard</h3>
              <p className="text-[11px] text-slate-400">Cause List, Hearings & Case Analytics</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center space-y-2 relative">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-white">3. Institution / Client</h3>
              <p className="text-[11px] text-slate-400">100+ Banks (NRB, BRAC, City, EBL)</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center space-y-2 relative">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-white">4. Case Database</h3>
              <p className="text-[11px] text-slate-400">Multi-Row Numbers, Parties & Notes</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center space-y-2 relative">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-white">5. Case List & Reports</h3>
              <p className="text-[11px] text-slate-400">Running vs Disposed Monthly Statements</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRACTICE AREAS */}
      <section id="practice-areas" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#cca776]">
              Litigation Expertise
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Banking & Corporate Practice Areas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Specialized representation before the Supreme Court of Bangladesh, Artha Rin Adalats, and Special Tribunals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-[#cca776]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776]">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Artha Rin Suits & Section 33(7)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggressive recovery litigation under the Artha Rin Adalat Ain, 2003, auction notice defense, and possession delivery execution proceedings.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-[#cca776]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776]">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">High Court Writ Petitions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Appearing in Rule Nisi hearings, vacating illegal ad-interim stay orders obtained by defaulting borrowers, and appellate division civil petitions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-[#cca776]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Cheque Dishonour (NI Act 138)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expeditious criminal complaint prosecution under Section 138 of the Negotiable Instruments Act for bank loan cheque bounces and recovery decrees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUSTED FINANCIAL INSTITUTIONS */}
      <section id="banking-clients" className="py-14 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#cca776]">
              Clients & Financial Institutions
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Trusted by 100+ Commercial & Islamic Banks
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {PARTNER_BANKS.map((bank) => (
              <div
                key={bank}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-[#cca776]/50 hover:text-white transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-[#cca776]" />
                <span>{bank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRESTIGIOUS LEGAL FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                Law Firm Legal Solutions
              </span>
              <p className="text-[11px] text-slate-500">
                Supreme Court Bar Association Building, Ramna, Dhaka-1000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/institutions" className="hover:text-[#cca776]">
              Bank Directory
            </Link>
            <Link href="/dashboard" className="hover:text-[#cca776]">
              Practice Dashboard
            </Link>
            <a href="#portal" className="hover:text-[#cca776]">
              Chamber Login
            </a>
          </div>

          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Law Firm Legal Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
