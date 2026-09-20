"use client";

import React, { useState } from "react";
import {
  Scale,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/types";

interface AuthSectionProps {
  onSuccess: (user: unknown) => void;
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  {
    value: "admin",
    label: "Managing Partner (Admin)",
    desc: "Full administrative access, assignment & role control",
  },
  {
    value: "partner",
    label: "Senior Partner Advocate",
    desc: "Case oversight, hearing updates & reporting access",
  },
  {
    value: "advocate",
    label: "High Court Advocate",
    desc: "Manage assigned files, court petitions & hearings",
  },
  {
    value: "associate",
    label: "Associate Advocate",
    desc: "File updates, cause list tracking & daily hearing entries",
  },
  {
    value: "user",
    label: "General Practitioner / Client User",
    desc: "Default access level (can be upgraded by Admin)",
  },
];

export function AuthSection({ onSuccess }: AuthSectionProps) {
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
    role: "associate" as UserRole,
    chamberDesignation: "Associate Advocate",
    barEnrollmentNo: "",
    phone: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please provide both email and password.");
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
        onSuccess(data.user);
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
        onSuccess(data.user);
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Showcase (5 Cols) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 text-slate-100 overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30 shadow-inner">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <span className="text-base font-bold tracking-wider text-white uppercase">
                  Law Firm Solutions
                </span>
                <p className="text-xs text-[#cca776] font-medium">
                  Litigation Practice Suite
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Enterprise Legal & Bank Litigation Platform
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure courtroom management for Bangladesh High Court & Subordinate Courts. High-volume Artha Rin suits, writ petition tracking, and automated corporate letterhead reporting.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span>Role-based access: Admin, Partner, Advocate & Associate</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span>100+ Financial Institutions & Bank Recovery Files</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#cca776]/15 text-[#cca776]">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <span>Automated Letterhead Reporting & Daily Cause Lists</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800/80 text-[11px] text-slate-500">
            Enterprise Grade Security • 256-Bit SSL Encrypted
          </div>

          {/* Ambient Glow */}
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
        </div>

        {/* Right Authentication Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-slate-900/60 flex flex-col justify-center">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === "signin"
                  ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In to Chamber
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === "signup"
                  ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* SIGN IN VIEW */}
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
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
                <span>Continue with Google Account</span>
              </a>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="e.g. Barrister / Advocate Name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      placeholder="advocate@chamber.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) =>
                        setSignupData({ ...signupData, phone: e.target.value })
                      }
                      placeholder="+88017XXXXXXXX"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection (All Available Roles) */}
              <div>
                <label className="block text-xs font-semibold text-[#cca776] mb-1">
                  Chamber Role (Access Level) *
                </label>
                <select
                  value={signupData.role}
                  onChange={(e) => {
                    const selectedRole = e.target.value as UserRole;
                    let defaultDesig = "Associate Advocate";
                    if (selectedRole === "admin") defaultDesig = "Managing Partner & Admin";
                    if (selectedRole === "partner") defaultDesig = "Senior Partner Advocate";
                    if (selectedRole === "advocate") defaultDesig = "High Court Advocate";
                    if (selectedRole === "user") defaultDesig = "Legal Practitioner";

                    setSignupData({
                      ...signupData,
                      role: selectedRole,
                      chamberDesignation: defaultDesig,
                    });
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-[#cca776] focus:outline-none font-medium"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — ({r.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Chamber Designation
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
                    placeholder="e.g. Senior Associate"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bar Council Enrollment No (Optional)
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-1"
              >
                <span>{loading ? "Registering..." : "Create Account & Enter Chamber"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {/* Google Button */}
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors"
              >
                <span>Sign up with Google (Default Role: User)</span>
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
