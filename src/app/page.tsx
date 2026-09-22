/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { BRANDING } from "@/config/branding";

const SIGNUP_ROLES: { value: "advocate" | "associate"; label: string; desc: string }[] = [
  {
    value: "advocate",
    label: "Advocate",
    desc: "Practicing advocate managing briefs & assigned hearings",
  },
  {
    value: "associate",
    label: "Associate",
    desc: "Chamber associate assisting with research, files & proceedings",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form State
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "advocate" as "advocate" | "associate",
    chamberDesignation: "Advocate",
    barEnrollmentNo: "",
    phone: "",
  });

  // Verify existing user session in background
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.authenticated && data.user) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Handle open modal with specific role preset
  const handleOpenJoin = (role: "advocate" | "associate") => {
    setSignupData((prev) => ({
      ...prev,
      role,
      chamberDesignation: role === "advocate" ? "Advocate" : "Associate Advocate",
    }));
    setActiveTab("signup");
    setAuthModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setActiveTab("signin");
    setAuthModalOpen(true);
  };

  // Login handler
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
        router.replace("/dashboard");
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
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
        router.replace("/dashboard");
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
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden text-slate-100 selection:bg-[#cca776]/30 selection:text-[#cca776]">
      {/* Background Image: Home-Banner.jpg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/Home-Banner.jpg"
          alt="Law Firm Solutions Chamber Banner"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle cinematic gradient: Keeps Lady Justice on left bright & clear while ensuring right text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-slate-950/40 to-slate-950/90 lg:from-slate-950/10 lg:via-slate-950/45 lg:to-slate-950/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      {/* TOP NAVIGATION BAR: No underline, fully transparent & clean */}
      <header className="relative z-20 w-full px-4 sm:px-8 md:px-12 py-5 flex items-center justify-between">
        {/* Top Left: Dari-palla (Scales of Justice) Logo + System Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#cca776]/20 text-[#cca776] ring-1 ring-[#cca776]/40 shadow-lg backdrop-blur-md">
            <Scale className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase drop-shadow-sm">
              {BRANDING.brandName}
            </span>
            <span className="text-[11px] text-[#cca776] font-semibold tracking-wide">
              {BRANDING.tagline}
            </span>
          </div>
        </div>

        {/* Top Right: Chamber Sign In Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenSignIn}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900/80 hover:bg-[#cca776] hover:text-slate-950 border border-[#cca776]/40 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
          >
            <LogIn className="h-3.5 w-3.5 text-[#cca776] group-hover:text-slate-950 transition-colors" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* HERO CONTENT: Left side kept open for the Lady Justice statue focal point */}
      <main className="relative z-20 flex-1 flex items-center px-4 sm:px-8 md:px-12 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center min-h-[60vh]">
          {/* Left Column (Clear of text to let Lady Justice shine through without obstruction) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 pointer-events-none" />

          {/* Right Column: Project Title & Join Actions */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start lg:pl-6 space-y-6">
            {/* Chamber Authority Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#cca776]/40 text-[#cca776] text-xs font-semibold backdrop-blur-md shadow-md">
              <ShieldCheck className="h-4 w-4 text-[#cca776]" />
              <span className="tracking-wide">Legal Practice & Litigation Suite</span>
            </div>

            {/* 1-2 Line Project-wise Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                Smart Legal Solutions <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cca776] via-[#f3ddb3] to-[#cca776]">
                  For Modern Chambers
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed pt-1">
                Centralized litigation database, daily cause list synchronizer, high court stay order tracking, and institutional bank brief management.
              </p>
            </div>

            {/* 2 Primary Action Buttons: Join as Advocate & Join as Associate */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              {/* Button 1: Join as Advocate */}
              <button
                type="button"
                onClick={() => handleOpenJoin("advocate")}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#cca776] text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-[#cca776]/20 hover:bg-[#b8935f] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Briefcase className="h-4 w-4" />
                <span>Join as Advocate</span>
              </button>

              {/* Button 2: Join as Associate */}
              <button
                type="button"
                onClick={() => handleOpenJoin("associate")}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-white font-bold text-xs sm:text-sm border border-[#cca776]/50 hover:border-[#cca776] shadow-xl backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-[#cca776]" />
                <span>Join as Associate</span>
              </button>
            </div>

            {/* Direct Sign In Link */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
              <span>Already registered in this chamber?</span>
              <button
                type="button"
                onClick={handleOpenSignIn}
                className="text-[#cca776] hover:text-[#e4c492] font-bold underline underline-offset-4 cursor-pointer transition-colors"
              >
                Sign In to Portal →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER: Minimal, elegant, and unobtrusive */}
      <footer
        className="relative z-20 w-full px-4 sm:px-8 py-4 text-center text-[11px] text-slate-400 select-none"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()} {BRANDING.brandName} • {BRANDING.tagline}. All Rights Reserved.
      </footer>

      {/* MODERN DUAL-PANEL AUTH MODAL (Login-bg.jpg on Left, Tabbed Forms on Right) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          {/* Modal Card */}
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[92vh]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-3.5 right-3.5 z-30 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* LEFT PANEL: Login-bg.jpg Image & Chamber Identity */}
            <div className="relative md:w-5/12 min-h-[240px] md:min-h-[580px] p-6 sm:p-8 flex flex-col justify-between text-white overflow-hidden">
              <img
                src="/images/Login-bg.jpg"
                alt="Law Firm Solutions Authentication"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Atmospheric Overlay for maximum text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 pointer-events-none" />

              {/* Top: Dari-palla Logo & Seal */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#cca776]/25 text-[#cca776] ring-1 ring-[#cca776]/50 shadow-lg backdrop-blur-md">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black tracking-wide text-white uppercase">
                  {BRANDING.brandName}
                </h3>
                <p className="text-xs text-[#cca776] font-medium">
                  {BRANDING.tagline}
                </p>
              </div>

              {/* Bottom: Chamber Quote & Pillars */}
              <div className="relative z-10 space-y-3 pt-6">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-[#cca776]/30 backdrop-blur-sm space-y-1.5">
                  <p className="text-[11px] text-slate-300 italic">
                    &ldquo;Fiat Justitia Ruat Caelum — Let justice be done though the heavens fall.&rdquo;
                  </p>
                  <p className="text-[10px] text-[#cca776] font-semibold uppercase tracking-wider">
                    High Court & Supreme Court Chambers
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#cca776] shrink-0" />
                    <span>Bank & Financial Litigation Management</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#cca776] shrink-0" />
                    <span>Automated Cause Lists & Court Proceedings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Modern Tabbed Authentication Form */}
            <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-center bg-slate-900/98 overflow-y-auto">
              {/* Dual Tabs: Sign In vs Register Account */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-[#cca776] text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-[#cca776] text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register Account
                </button>
              </div>

              {/* SIGN IN FORM */}
              {activeTab === "signin" && (
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Official Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="advocate@chamber.com"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Chamber Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                      />
                      {/* Password Show/Hide Toggle Icon */}
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-[#cca776] transition-colors p-0.5 cursor-pointer"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-lg shadow-[#cca776]/15 hover:bg-[#b8935f] transition-all disabled:opacity-50 cursor-pointer mt-2"
                  >
                    <span>{loading ? "Authenticating..." : "Sign In to Chamber Portal"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* REGISTER ACCOUNT FORM */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignup} className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                          placeholder="name@chamber.com"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password (Min 6 chars) *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({ ...signupData, password: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                        />
                        {/* Password Show/Hide Toggle Icon */}
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-[#cca776] transition-colors p-0.5 cursor-pointer"
                          title={showSignupPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chamber Role Selection: Advocate vs Associate */}
                  <div>
                    <label className="block text-xs font-semibold text-[#cca776] mb-1.5">
                      Chamber Position & Role *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SIGNUP_ROLES.map((r) => {
                        const isSelected = signupData.role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() =>
                              setSignupData({
                                ...signupData,
                                role: r.value,
                                chamberDesignation:
                                  r.value === "advocate" ? "Advocate" : "Associate Advocate",
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#cca776] bg-[#cca776]/15 shadow-sm"
                                : "border-slate-800 bg-slate-950 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-white" : "text-slate-300"
                                }`}
                              >
                                {r.label}
                              </span>
                              {isSelected && (
                                <Award className="h-3.5 w-3.5 text-[#cca776]" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {r.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                        placeholder="Advocate / Associate"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="tel"
                          value={signupData.phone}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+880 1..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-2.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-lg shadow-[#cca776]/15 hover:bg-[#b8935f] transition-all disabled:opacity-50 cursor-pointer mt-1"
                  >
                    <span>{loading ? "Registering..." : "Create Account & Enter Chamber"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
