"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  Lock,
  Mail,
  User,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const SIGNUP_ROLES: { value: "advocate" | "associate"; label: string }[] = [
  { value: "advocate", label: "Advocate" },
  { value: "associate", label: "Associate" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
          router.replace("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [router]);

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#cca776] border-t-transparent" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#cca776]/30 selection:text-[#cca776] flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#cca776]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md my-auto relative z-10">
        {/* Branding Header: Logo & Project Name */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30 shadow-inner">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            Case Database
          </h1>
          <p className="text-xs text-[#cca776] font-medium tracking-wide">
            The Legal Solutions
          </p>
        </div>

        {/* Existing Auth Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
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

          {/* SIGN IN FORM (Preserved Exact Design) */}
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Chamber Portal"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* SIGN UP FORM (Matched Exact Tokens & Styling) */}
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

              {/* Role Selection */}
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 mt-1 cursor-pointer"
              >
                <span>{loading ? "Registering..." : "Create Account & Enter Chamber"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Case Database – The Legal Solutions. All rights reserved.
      </footer>
    </div>
  );
}
