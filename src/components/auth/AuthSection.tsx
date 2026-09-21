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

const SIGNUP_ROLES: { value: "advocate" | "associate"; label: string }[] = [
  { value: "advocate", label: "Advocate" },
  { value: "associate", label: "Associate" },
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

              {/* Role Selection (Advocate or Associate only) */}
              <div>
                <label className="block text-xs font-semibold text-[#cca776] mb-1">
                  Chamber Role (Advocate / Associate) *
                </label>
                <select
                  value={signupData.role}
                  onChange={(e) => {
                    const selectedRole = e.target.value as "advocate" | "associate";
                    const defaultDesig =
                      selectedRole === "advocate" ? "Advocate" : "Associate Advocate";

                    setSignupData({
                      ...signupData,
                      role: selectedRole,
                      chamberDesignation: defaultDesig,
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
