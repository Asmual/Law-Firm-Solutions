/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Camera,
  Lock,
  Save,
  Gavel,
  Loader2,
  KeyRound,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "associate",
    chamberDesignation: "",
    barEnrollmentNo: "",
    avatarUrl: "",
    bio: "",
    createdAt: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch current user data
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/");
          return;
        }
        const u = data.user;
        setProfileData({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "associate",
          chamberDesignation: u.chamberDesignation || "",
          barEnrollmentNo: u.barEnrollmentNo || "",
          avatarUrl: u.avatarUrl || "",
          bio: u.bio || "",
          createdAt: u.createdAt || "",
        });
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Handle Image Upload directly to Cloudinary via /api/upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image to Cloudinary");
      }

      // Immediately update local state
      setProfileData((prev) => ({ ...prev, avatarUrl: data.url }));

      // Automatically persist avatarUrl to profile in MongoDB
      const saveRes = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          chamberDesignation: profileData.chamberDesignation,
          barEnrollmentNo: profileData.barEnrollmentNo,
          bio: profileData.bio,
          avatarUrl: data.url,
        }),
      });

      if (saveRes.ok) {
        toast.success("Profile photo updated & saved successfully!", { id: toastId });
      } else {
        toast.success("Image uploaded! Click 'Save Changes' to finalize.", { id: toastId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg, { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setProfileData((prev) => ({ ...prev, avatarUrl: "" }));
    try {
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          avatarUrl: "",
        }),
      });
      toast.success("Profile picture removed.");
    } catch {
      toast.info("Avatar cleared. Click Save to finalize.");
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error("Legal name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile information updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#cca776]" />
          <span>Loading chamber profile...</span>
        </div>
      </div>
    );
  }

  const roleLabel =
    profileData.role === "admin"
      ? "Managing Partner • Admin"
      : profileData.role === "advocate"
      ? "Advocate (Litigation Specialist)"
      : "Associate Advocate";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16 w-full font-sans">
      {/* 1. Header Banner & Profile Snapshot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with Clickable Camera Upload */}
            <div className="relative group shrink-0">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.name}
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-[#cca776]/50 shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#cca776]/15 text-[#cca776] ring-2 ring-[#cca776]/30 font-bold text-3xl shadow-xl">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Upload trigger button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Change Profile Photo"
                aria-label="Upload photo"
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#cca776]" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-[#cca776]" />
                    <span className="text-[10px] font-semibold">Change</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#cca776]/15 px-3 py-0.5 text-xs font-semibold text-[#cca776] border border-[#cca776]/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{roleLabel}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white truncate">
                {profileData.name}
              </h1>
              <p className="text-xs text-slate-300">
                {profileData.chamberDesignation || "Legal Practitioner"} • {profileData.email}
              </p>
              {profileData.barEnrollmentNo && (
                <p className="text-[11px] text-[#cca776] font-mono">
                  Bar Roll: {profileData.barEnrollmentNo}
                </p>
              )}
            </div>
          </div>

          {/* Quick Photo Actions */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-[#cca776] px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  <span>Upload Profile Photo</span>
                </>
              )}
            </button>
            {profileData.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#cca776]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 w-full sm:w-80">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#cca776] text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* 3. TAB 1: Profile Details Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6 animate-in fade-in"
        >
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#cca776]" />
              <span>Chamber Practitioner Information</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your formal profile, courtroom designation, and bar enrollment record
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Barrister / Advocate Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                />
              </div>
            </div>

            {/* Official Email (Read-only verified) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Chamber Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 pl-8 pr-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Official chamber login credential
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+88017XXXXXXXX"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                />
              </div>
            </div>

            {/* Chamber Role (Read-only badge) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Chamber Role
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#cca776]" />
                <input
                  type="text"
                  disabled
                  value={profileData.role.toUpperCase()}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 pl-8 pr-3 py-2 text-xs text-[#cca776] font-bold cursor-not-allowed uppercase"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Privileges managed by Chamber Administrator
              </span>
            </div>

            {/* Chamber Designation */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Chamber Designation
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={profileData.chamberDesignation}
                  onChange={(e) => setProfileData({ ...profileData, chamberDesignation: e.target.value })}
                  placeholder="e.g. Senior Advocate & Bank Litigation Specialist"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
                />
              </div>
            </div>

            {/* Bar Enrollment No */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bangladesh Bar Council Enrollment No
              </label>
              <div className="relative">
                <Gavel className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={profileData.barEnrollmentNo}
                  onChange={(e) => setProfileData({ ...profileData, barEnrollmentNo: e.target.value })}
                  placeholder="e.g. SC-9982/2016"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Professional Bio / Practice Areas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Professional Practice Areas & Chamber Bio
            </label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="e.g. Specialized in Artha Rin Adalat suits, High Court Division writ petitions, banking recovery, and corporate compliance."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile Information</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB 2: Security & Password Form */}
      {activeTab === "security" && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5 animate-in fade-in max-w-xl"
        >
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#cca776]" />
              <span>Change Chamber Password</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure your account uses a secure password of at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              New Password (Min 6 characters) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#cca776] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cca776] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#b8935f] transition-all disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
