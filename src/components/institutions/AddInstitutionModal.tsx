"use client";

import React, { useState } from "react";
import { X, Building2, User, Phone, Mail, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { InstitutionCategory } from "@/types";

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: InstitutionCategory[] = [
  "Private Commercial Bank",
  "State-Owned Bank",
  "Shariah Islamic Bank",
  "Non-Banking Financial Institution (NBFI)",
  "Corporate Client",
  "Individual",
];

export function AddInstitutionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddInstitutionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    category: "Private Commercial Bank" as InstitutionCategory,
    branch: "",
    address: "",
    focalPersonName: "",
    focalPersonDesignation: "Head of Legal & Recovery",
    focalPersonPhone: "",
    focalPersonEmail: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortCode.trim()) {
      toast.error("Please provide Bank/Institution Name and Short Code");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          shortCode: formData.shortCode.trim(),
          category: formData.category,
          branch: formData.branch.trim(),
          address: formData.address.trim(),
          focalPerson: {
            name: formData.focalPersonName.trim(),
            designation: formData.focalPersonDesignation.trim(),
            phone: formData.focalPersonPhone.trim(),
            email: formData.focalPersonEmail.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`"${formData.name}" added to Client Directory`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to add institution");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cca776]/15 text-[#cca776]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Bank / Institution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register corporate client for litigation file tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Section 1: Institution Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cca776]">
              1. Institutional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Institution / Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. NRB Bank PLC"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Short Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortCode}
                  onChange={(e) =>
                    setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. NRB"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none uppercase dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as InstitutionCategory,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Managing Branch / Division
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  placeholder="e.g. Principal Branch / SAMD Division"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Office / Head Office Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. 89 Gulshan Avenue, Dhaka-1212"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Focal Person */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cca776]">
              2. Bank Focal Person / Legal Officer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Focal Person Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.focalPersonName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        focalPersonName: e.target.value,
                      })
                    }
                    placeholder="e.g. Mr. Mahbubul Alam"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.focalPersonDesignation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      focalPersonDesignation: e.target.value,
                    })
                  }
                  placeholder="e.g. Head of SAMD / Legal Advisor"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone / Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.focalPersonPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        focalPersonPhone: e.target.value,
                      })
                    }
                    placeholder="+88017XXXXXXXX"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.focalPersonEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        focalPersonEmail: e.target.value,
                      })
                    }
                    placeholder="legal@bank.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-[#cca776] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#cca776] px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-[#b8935f] disabled:opacity-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Institution"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
