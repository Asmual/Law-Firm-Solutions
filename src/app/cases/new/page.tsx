"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  UserCheck,
  Printer,
  ChevronRight,
  Shield,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Institution, CaseNumberItem, PartyItem, StatusHearingUpdate, User } from "@/types";
import { LegalDatePicker } from "@/components/common/LegalDatePicker";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

function CaseFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const preselectedInstId = searchParams.get("institutionId");

  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Institutions state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchInstQuery, setSearchInstQuery] = useState("");
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  // Advocates list for assignment
  const [advocates, setAdvocates] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Form Fields
  const [chamberFileNo, setChamberFileNo] = useState("");
  const [matter, setMatter] = useState("Artha Rin Matter");
  const [contactName, setContactName] = useState("");
  const [contactDesignation, setContactDesignation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Repeater 1: Case Numbers
  const [caseNumbers, setCaseNumbers] = useState<CaseNumberItem[]>([
    {
      caseNumber: "",
      caseType: "Civil Petition",
      year: new Date().getFullYear().toString(),
      courtDivision: "Appellate Division",
      remarks: "",
    },
  ]);

  // Repeater 2: Parties
  const [parties, setParties] = useState<PartyItem[]>([
    {
      partyNo: 1,
      partyNameDetails: "",
      caseReceivedDate: new Date().toISOString().split("T")[0],
      searchListEntry: "",
    },
  ]);

  // Section 5: Special Notes
  const [wokalatnamaNote, setWokalatnamaNote] = useState("");
  const [mainPetitionNote, setMainPetitionNote] = useState("");
  const [extensionNote, setExtensionNote] = useState("");

  // Section 6: Assigned Advocate & Associate
  const [assignedAdvocateName, setAssignedAdvocateName] = useState("Unassigned");
  const [assignedAdvocateId, setAssignedAdvocateId] = useState("");
  const [assignedAssociateName, setAssignedAssociateName] = useState("");
  const [assignedAssociateId, setAssignedAssociateId] = useState("");
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split("T")[0]);
  const [internalRemarks, setInternalRemarks] = useState("");

  // Section 7: Chronological Status Updates
  const [statusUpdates, setStatusUpdates] = useState<StatusHearingUpdate[]>([
    {
      updateDate: new Date().toISOString().split("T")[0],
      statusRemarks: "Initial brief received and case opened in registry.",
      orderDetails: "",
      courtName: "",
    },
  ]);

  const [caseStatus, setCaseStatus] = useState<"running" | "stay_granted" | "adjourned" | "disposed" | "decreed">("running");

  const selectInstitution = (inst: Institution) => {
    setSelectedInst(inst);
    if (inst.focalPerson) {
      if (inst.focalPerson.name) setContactName(inst.focalPerson.name);
      if (inst.focalPerson.designation) setContactDesignation(inst.focalPerson.designation);
      if (inst.focalPerson.phone) setContactPhone(inst.focalPerson.phone);
      if (inst.focalPerson.email) setContactEmail(inst.focalPerson.email);
    }
  };

  // Check user role and protect page
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUserRole(data.user.role);
          if (data.user.role === "advocate" && !editId) {
            setAssignedAdvocateName(data.user.name);
            setAssignedAdvocateId(data.user.id || data.user._id || "");
          }
        }
      })
      .catch(() => {});
  }, [editId]);

  // Load Institutions & Advocates
  useEffect(() => {
    fetch("/api/institutions?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) {
          setInstitutions(data.institutions);
          if (preselectedInstId) {
            const found = data.institutions.find((i: Institution) => (i._id || i.id) === preselectedInstId);
            if (found) selectInstitution(found);
          }
        }
      })
      .catch((err) => console.error("Error fetching institutions:", err));

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setAdvocates(data.users);
        }
      })
      .catch(() => {
        // Fallback default advocates
        setAdvocates([]);
      });
  }, [preselectedInstId]);

  // If editing, load case data
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/cases/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.case) {
          const c = data.case;
          setChamberFileNo(c.chamberFileNo || "");
          setMatter(c.matter || "");
          if (c.focalPerson) {
            setContactName(c.focalPerson.name || "");
            setContactDesignation(c.focalPerson.designation || "");
            setContactPhone(c.focalPerson.phone || "");
            setContactEmail(c.focalPerson.email || "");
          }
          if (c.caseNumbers && c.caseNumbers.length > 0) setCaseNumbers(c.caseNumbers);
          if (c.parties && c.parties.length > 0) setParties(c.parties);
          if (c.specialNotes) {
            setWokalatnamaNote(c.specialNotes.wokalatnamaNote || "");
            setMainPetitionNote(c.specialNotes.mainPetitionNote || "");
            setExtensionNote(c.specialNotes.extensionNote || "");
          }
          if (c.assignedAdvocate) {
            setAssignedAdvocateName(c.assignedAdvocate.advocateName || "Unassigned");
            setAssignedAdvocateId(c.assignedAdvocate.advocateId || "");
            setDateAssigned(c.assignedAdvocate.dateAssigned || "");
            setInternalRemarks(c.assignedAdvocate.internalRemarks || "");
          }
          if (c.assignedAssociate) {
            setAssignedAssociateName(c.assignedAssociate.associateName || "");
            setAssignedAssociateId(c.assignedAssociate.associateId || "");
          }
          if (c.statusUpdates && c.statusUpdates.length > 0) setStatusUpdates(c.statusUpdates);
          if (c.status) setCaseStatus(c.status);

          // Find institution
          fetch(`/api/institutions/${c.institutionId}`)
            .then((r) => r.json())
            .then((iData) => {
              if (iData.institution) {
                setSelectedInst(iData.institution);
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load case data");
      });
  }, [editId]);

  // Repeater Helpers: Case Numbers
  const addCaseNumberRow = () => {
    setCaseNumbers([
      ...caseNumbers,
      {
        caseNumber: "",
        caseType: "Writ Petition",
        year: new Date().getFullYear().toString(),
        courtDivision: "High Court Division",
        remarks: "",
      },
    ]);
  };

  const removeCaseNumberRow = (index: number) => {
    if (caseNumbers.length <= 1) {
      toast.info("At least one Case Number row must remain.");
      return;
    }
    setCaseNumbers(caseNumbers.filter((_, idx) => idx !== index));
  };

  const updateCaseNumber = (index: number, field: keyof CaseNumberItem, value: string) => {
    const updated = [...caseNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setCaseNumbers(updated);
  };

  // Repeater Helpers: Parties
  const addPartyRow = () => {
    setParties([
      ...parties,
      {
        partyNo: parties.length + 1,
        partyNameDetails: "",
        caseReceivedDate: new Date().toISOString().split("T")[0],
        searchListEntry: "",
      },
    ]);
  };

  const removePartyRow = (index: number) => {
    if (parties.length <= 1) {
      toast.info("At least one Party row must remain.");
      return;
    }
    const filtered = parties.filter((_, idx) => idx !== index);
    // re-index partyNo
    const reindexed = filtered.map((p, i) => ({ ...p, partyNo: i + 1 }));
    setParties(reindexed);
  };

  const updateParty = (index: number, field: keyof PartyItem, value: string | number) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    setParties(updated);
  };

  // Repeater Helpers: Chronological Status Updates
  const addStatusRow = () => {
    setStatusUpdates([
      ...statusUpdates,
      {
        updateDate: new Date().toISOString().split("T")[0],
        statusRemarks: "",
        orderDetails: "",
        courtName: "",
      },
    ]);
  };

  const removeStatusRow = (index: number) => {
    if (statusUpdates.length <= 1) {
      toast.info("At least one Status / Remark history row must remain.");
      return;
    }
    setStatusUpdates(statusUpdates.filter((_, idx) => idx !== index));
  };

  const updateStatus = (index: number, field: keyof StatusHearingUpdate, value: string) => {
    const updated = [...statusUpdates];
    updated[index] = { ...updated[index], [field]: value };
    setStatusUpdates(updated);
  };

  // Advocate selector change handler
  const handleAdvocateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Unassigned") {
      setAssignedAdvocateName("Unassigned");
      setAssignedAdvocateId("");
    } else {
      const adv = advocates.find((a) => (a._id || a.id) === val || a.name === val);
      if (adv) {
        setAssignedAdvocateName(adv.name);
        setAssignedAdvocateId(adv._id || adv.id || "");
      } else {
        setAssignedAdvocateName(val);
      }
    }
  };

  // Save handler
  const handleSave = async (andAddNew = false) => {
    if (!editId && currentUserRole === "admin") {
      toast.error(
        "Administrative rule: Administrators maintain oversight and monitoring only. Case file creation is reserved for Advocates and Associates."
      );
      return;
    }

    if (!selectedInst) {
      toast.error("Please select an Institution / Client from the left list.");
      return;
    }

    if (!chamberFileNo.trim()) {
      toast.error("File No. is required.");
      return;
    }

    if (!matter.trim()) {
      toast.error("Matter / Subject is required.");
      return;
    }

    setIsSaving(true);

    const payload = {
      chamberFileNo: chamberFileNo.trim(),
      institutionId: selectedInst._id || selectedInst.id,
      institutionName: selectedInst.name,
      matter: matter.trim(),
      focalPerson: {
        name: contactName.trim(),
        designation: contactDesignation.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
      },
      caseNumbers: caseNumbers.filter((cn) => cn.caseNumber.trim() !== ""),
      parties: parties.filter((p) => p.partyNameDetails.trim() !== ""),
      specialNotes: {
        wokalatnamaNote,
        mainPetitionNote,
        extensionNote,
      },
      assignedAdvocate: {
        advocateId: assignedAdvocateId || undefined,
        advocateName: assignedAdvocateName,
        dateAssigned,
        internalRemarks,
      },
      assignedAssociate: (assignedAssociateId || assignedAssociateName) ? {
        associateId: assignedAssociateId || undefined,
        associateName: assignedAssociateName,
        dateAssigned,
        internalRemarks: "Assisting Associate",
      } : undefined,
      statusUpdates: statusUpdates.filter((s) => s.statusRemarks.trim() !== ""),
      status: caseStatus,
    };

    try {
      const url = editId ? `/api/cases/${editId}` : "/api/cases";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save case file");
      }

      toast.success(editId ? "Case updated successfully!" : "New Case created successfully!");

      if (andAddNew) {
        // Reset form for next entry
        setChamberFileNo("");
        setMatter("Artha Rin Matter");
        setCaseNumbers([
          {
            caseNumber: "",
            caseType: "Civil Petition",
            year: new Date().getFullYear().toString(),
            courtDivision: "Appellate Division",
            remarks: "",
          },
        ]);
        setParties([
          {
            partyNo: 1,
            partyNameDetails: "",
            caseReceivedDate: new Date().toISOString().split("T")[0],
            searchListEntry: "",
          },
        ]);
        setWokalatnamaNote("");
        setMainPetitionNote("");
        setExtensionNote("");
        setStatusUpdates([
          {
            updateDate: new Date().toISOString().split("T")[0],
            statusRemarks: "Initial brief received and case opened in registry.",
          },
        ]);
      } else {
        router.push("/cases");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error saving case";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchInstQuery.toLowerCase()) ||
    inst.shortCode.toLowerCase().includes(searchInstQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Banner matching blueprint flow */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#cca776]/15 text-[#cca776] ring-1 ring-[#cca776]/30 flex items-center justify-center font-serif font-bold text-xl shadow-inner">
              ⚖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                  {editId ? "Edit Case File" : "Add / Edit Case File"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#cca776]/20 text-[#cca776] border border-[#cca776]/40 font-medium">
                  The Legal Solutions System Flow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All fields integrated into one authoritative litigation record • High Court & Banking Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/cases")}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Back to Case Registry
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Record"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Blueprint Visual Breadcrumb Step Indicator */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center text-xs text-slate-400 gap-2 overflow-x-auto whitespace-nowrap py-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> Login Active
          </span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-400">Dashboard</span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-[#cca776] font-semibold flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> Institution Selection
          </span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-white font-semibold flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded">
            <FileText className="h-3.5 w-3.5 text-[#cca776]" /> Case Database (Entry Form)
          </span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-400">Case List (Registry)</span>
        </div>
      </div>

      {/* Main 3-Column Layout matching Blueprint exactly */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT COLUMN: INSTITUTION / CLIENT LIST (100+ Banks) ================= */}
        <aside className="lg:col-span-3 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Institutions / Clients
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#cca776] px-2 py-0.5 rounded bg-[#cca776]/10 border border-[#cca776]/20">
              ~100 Banks
            </span>
          </div>

          {/* Search Box for Institutions */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search institution name..."
                value={searchInstQuery}
                onChange={(e) => setSearchInstQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#cca776] focus:ring-1 focus:ring-[#cca776]"
              />
            </div>
          </div>

          {/* Scrollable Institution List */}
          <div className="flex-1 overflow-y-auto max-h-[750px] divide-y divide-slate-800/60">
            {filteredInstitutions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching financial institutions found.
              </div>
            ) : (
              filteredInstitutions.map((inst) => {
                const isSelected = selectedInst && (selectedInst._id === inst._id || selectedInst.id === inst.id);
                return (
                  <button
                    key={inst._id || inst.id || inst.name}
                    onClick={() => selectInstitution(inst)}
                    className={`w-full text-left px-3.5 py-3 transition-colors flex items-center justify-between group ${
                      isSelected
                        ? "bg-[#cca776]/20 border-l-4 border-l-[#cca776] text-white"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold truncate group-hover:text-[#cca776] transition-colors">
                        {inst.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                          {inst.shortCode}
                        </span>
                        <span className="truncate">{inst.category}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-[#cca776] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Status Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Selected Client:</span>
            <span className="font-semibold text-[#cca776] truncate max-w-[150px]">
              {selectedInst ? selectedInst.name : "None"}
            </span>
          </div>
        </aside>

        {/* ================= CENTER COLUMN: CASE ENTRY FORM (All 7 Sections) ================= */}
        <section className="lg:col-span-6 space-y-4">
          
          {/* Row 1: Section 1 (File Information) & Section 2 (Case Numbers) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 1. FILE INFORMATION */}
            <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  1. File Information
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  File No. <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1224 or CF-2024/098"
                  value={chamberFileNo}
                  onChange={(e) => setChamberFileNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#cca776] focus:ring-1 focus:ring-[#cca776]"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Unique physical chamber file binder number.
                </p>
              </div>
            </div>

            {/* 2. CASE NUMBER(S) REPEATER TABLE */}
            <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  2. Case Number(s)
                </span>
                <button
                  type="button"
                  onClick={addCaseNumberRow}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2 py-1 rounded transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Another Case Number
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-1.5 px-1 text-center w-8">SL</th>
                      <th className="py-1.5 px-1.5">Case Number</th>
                      <th className="py-1.5 px-1.5">Case Type</th>
                      <th className="py-1.5 px-1.5 w-16">Year</th>
                      <th className="py-1.5 px-1.5">Court / Division</th>
                      <th className="py-1.5 px-1.5">Remarks</th>
                      <th className="py-1.5 px-1 text-center w-8">Act</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {caseNumbers.map((cn, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-1 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="C.P. No. 3727/2023"
                            value={cn.caseNumber}
                            onChange={(e) => updateCaseNumber(idx, "caseNumber", e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <select
                            value={cn.caseType}
                            onChange={(e) => updateCaseNumber(idx, "caseType", e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                          >
                            <option value="Civil Petition">Civil Petition</option>
                            <option value="Writ Petition">Writ Petition</option>
                            <option value="Artha Rin Suit">Artha Rin Suit</option>
                            <option value="Civil Revision">Civil Revision</option>
                            <option value="First Appeal">First Appeal</option>
                            <option value="Criminal Misc">Criminal Misc</option>
                            <option value="Execution Case">Execution Case</option>
                          </select>
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            value={cn.year}
                            onChange={(e) => updateCaseNumber(idx, "year", e.target.value)}
                            className="w-full px-1 py-1 text-xs text-center bg-slate-950 border border-slate-700/80 rounded text-slate-200 font-mono focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="Appellate / High Court"
                            value={cn.courtDivision}
                            onChange={(e) => updateCaseNumber(idx, "courtDivision", e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="e.g. Arising out of W.P."
                            value={cn.remarks || ""}
                            onChange={(e) => updateCaseNumber(idx, "remarks", e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeCaseNumberRow(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40"
                            title="Remove row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Row 2: Section 3 (Party Name & Details) & Section 4 (Matter & Contact Person) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 3. PARTY NAME & DETAILS REPEATER TABLE */}
            <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  3. Party Name & Details
                </span>
                <button
                  type="button"
                  onClick={addPartyRow}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2 py-1 rounded transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Another Party
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-1.5 px-1 text-center w-8">SL</th>
                      <th className="py-1.5 px-1.5 w-24">Party No.</th>
                      <th className="py-1.5 px-1.5">Party Name & Details</th>
                      <th className="py-1.5 px-1.5 w-28">Received Date</th>
                      <th className="py-1.5 px-1.5 w-28">Search List</th>
                      <th className="py-1.5 px-1 text-center w-8">Act</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parties.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-1 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="Petitioner / Opp. Party"
                            value={p.partyNo === 1 ? "Petitioner No. 1" : `Opposite Party No. 0${p.partyNo - 1}`}
                            onChange={() => updateParty(idx, "partyNo", idx + 1)}
                            className="w-full px-1.5 py-1 text-[11px] bg-slate-950 border border-slate-700/80 rounded text-slate-300 focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="e.g. Luxury Agro Limited / NRB Bank Gulshan"
                            value={p.partyNameDetails}
                            onChange={(e) => updateParty(idx, "partyNameDetails", e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1 min-w-[130px]">
                          <LegalDatePicker
                            value={p.caseReceivedDate || ""}
                            onChange={(val) => updateParty(idx, "caseReceivedDate", val)}
                            placeholder="DD.MM.YYYY"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="SL-12345/23"
                            value={p.searchListEntry || ""}
                            onChange={(e) => updateParty(idx, "searchListEntry", e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono focus:outline-none focus:border-[#cca776]"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => removePartyRow(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40"
                            title="Remove row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. MATTER & CONTACT PERSON */}
            <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  4. Matter & Contact Person
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Matter / Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artha Rin Matter, Stay Vacation"
                    value={matter}
                    onChange={(e) => setMatter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-[#cca776]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Contact Person (Client Bank Officer)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Md. Kamrul Hasan"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-[#cca776]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="Legal Division"
                      value={contactDesignation}
                      onChange={(e) => setContactDesignation(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="legal@bank.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Section 5 (Special Note) & Section 6 (Assigned Advocate) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 5. SPECIAL NOTE */}
            <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  5. Special Notes
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Wokalatnama / Power Note
                  </label>
                  <input
                    type="text"
                    placeholder="Available with bank / Filed on 12.02.2024"
                    value={wokalatnamaNote}
                    onChange={(e) => setWokalatnamaNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Main Petition Note
                  </label>
                  <input
                    type="text"
                    placeholder="Main petition filed by the bank"
                    value={mainPetitionNote}
                    onChange={(e) => setMainPetitionNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Extension Note
                  </label>
                  <input
                    type="text"
                    placeholder="No extension filed yet / Extension granted till June"
                    value={extensionNote}
                    onChange={(e) => setExtensionNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                  />
                </div>
              </div>
            </div>

            {/* 6. ASSIGNED ADVOCATE & CASE STATUS */}
            <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  6. Assigned Advocate & Status
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Internal Chamber
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Assigned Advocate <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={assignedAdvocateId || assignedAdvocateName}
                    onChange={handleAdvocateChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                  >
                    <option value="Unassigned">Unassigned (Chamber Pool)</option>
                    {advocates.map((adv) => (
                      <option key={adv._id || adv.id} value={adv._id || adv.id}>
                        {adv.name} ({adv.chamberDesignation || adv.role})
                      </option>
                    ))}
                    {/* Fallback custom option */}
                    <option value="Adv. Shahriar Mahmud">Adv. Shahriar Mahmud</option>
                    <option value="Adv. Tanvir Ahmed">Adv. Tanvir Ahmed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Assisting Associate (Optional)
                  </label>
                  <select
                    value={assignedAssociateId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setAssignedAssociateId(selId);
                      const found = advocates.find((u) => (u._id || u.id) === selId);
                      setAssignedAssociateName(found ? found.name : "");
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                  >
                    <option value="">None Assigned (No Associate)</option>
                    {advocates.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.chamberDesignation || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Date Assigned
                    </label>
                    <LegalDatePicker
                      value={dateAssigned}
                      onChange={(val) => setDateAssigned(val)}
                      placeholder="DD.MM.YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Overall Case Status
                    </label>
                    <select
                      value={caseStatus}
                      onChange={(e) =>
                        setCaseStatus(
                          e.target.value as
                            | "running"
                            | "stay_granted"
                            | "adjourned"
                            | "disposed"
                            | "decreed"
                        )
                      }
                      className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-[#cca776] font-semibold focus:outline-none focus:border-[#cca776]"
                    >
                      <option value="running">Running (Active)</option>
                      <option value="stay_granted">Stay Granted</option>
                      <option value="adjourned">Adjourned</option>
                      <option value="disposed">Disposed</option>
                      <option value="decreed">Decreed / Judgment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Internal Remarks / Instruction
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Drafting and hearing before Bench 14"
                    value={internalRemarks}
                    onChange={(e) => setInternalRemarks(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Section 7 (Remark / Status - Chronological Updates) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#cca776]" />
                <span className="text-xs font-bold text-[#cca776] uppercase tracking-wider">
                  7. Remark / Status (Chronological Updates)
                </span>
              </div>
              <button
                type="button"
                onClick={addStatusRow}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Status / Remark
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-2 text-center w-10">SL</th>
                    <th className="py-2 px-2 w-32">Date</th>
                    <th className="py-2 px-2">Status / Remarks / Order Details</th>
                    <th className="py-2 px-2 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statusUpdates.map((su, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2 w-36">
                        <LegalDatePicker
                          value={su.updateDate}
                          onChange={(val) => updateStatus(idx, "updateDate", val)}
                          placeholder="DD.MM.YYYY"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          placeholder="e.g. First Order: Rule and Stay for 06 Months on 12.08.2012 before Bijoy-09"
                          value={su.statusRemarks}
                          onChange={(e) => updateStatus(idx, "statusRemarks", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded text-slate-100 focus:outline-none focus:border-[#cca776]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeStatusRow(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/40"
                          title="Remove update"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Actions Bar inside form matching blueprint */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">
              {selectedInst ? (
                <span>
                  Case file will be bound to{" "}
                  <strong className="text-white">{selectedInst.name}</strong>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Please pick an Institution from the left panel
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/cases")}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                ✕ Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Save & Add New
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#cca776]/90 shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Record"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: ACTIONS & QUICK SEARCH ================= */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* ACTIONS (For this case) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Actions (For this case)
              </h2>
            </div>
            <div className="p-3 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (editId) router.push(`/cases/${editId}`);
                  else toast.info("Save this case first to view full profile.");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <FileText className="h-4 w-4 text-[#cca776]" />
                <span>View Case File</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info("Already in the case editor.")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <FileText className="h-4 w-4 text-sky-400" />
                <span>Edit Case File</span>
              </button>

              <button
                type="button"
                onClick={addStatusRow}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Add Status / Remark</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info("Advocate assignment dropdown is available in section 6.")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <UserCheck className="h-4 w-4 text-violet-400" />
                <span>Assign / Reassign</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <FileText className="h-4 w-4 text-[#cca776]" />
                <span>Generate Report (This Case)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#cca776] transition-colors border border-transparent hover:border-slate-700"
              >
                <Printer className="h-4 w-4 text-amber-400" />
                <span>Print / Export (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/40 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Discard Edits / Return</span>
              </button>
            </div>
          </div>

          {/* QUICK SEARCH PANEL matching Blueprint */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
              <Search className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Quick Search
              </h2>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  By Institution
                </label>
                <select
                  value={selectedInst ? selectedInst._id || selectedInst.id : ""}
                  onChange={(e) => {
                    const inst = institutions.find((i) => (i._id || i.id) === e.target.value);
                    if (inst) selectInstitution(inst);
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                >
                  <option value="">-- All Institutions --</option>
                  {institutions.map((i) => (
                    <option key={i._id || i.id} value={i._id || i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  By File No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1224"
                  value={chamberFileNo}
                  onChange={(e) => setChamberFileNo(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-[#cca776]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  By Case Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. C.P. 3727/2023"
                  className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-[#cca776]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  By Party Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Agro"
                  className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#cca776]"
                />
              </div>

              <button
                type="button"
                onClick={() => router.push("/cases")}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-[#cca776] border border-[#cca776]/30 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search in Registry</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* ================= BOTTOM BAR: OUTPUT & USAGE ================= */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/90 px-6 py-4">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <Layers className="h-4 w-4 text-[#cca776]" />
            <span>Output & Usage</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full md:w-auto text-xs">
            <button
              onClick={() => router.push("/cases")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-center transition-colors font-medium"
            >
              View Case Details
            </button>
            <button
              onClick={() => router.push("/cases")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-center transition-colors font-medium"
            >
              List of Cases
            </button>
            <button
              onClick={() => router.push("/reports")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-center transition-colors font-medium"
            >
              Monthly Client Report
            </button>
            <button
              onClick={() => router.push("/reports")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-center transition-colors font-medium"
            >
              Export to Excel / PDF
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-center transition-colors font-medium"
            >
              Dashboard & Analytics
            </button>
          </div>
        </div>
      </footer>

      {/* Discard Edits Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={() => router.push("/cases")}
        title="Discard Current Edits"
        message="Are you sure you want to discard your edits and return to the Case Registry? Any unsaved changes in this brief will be lost."
        confirmText="Discard & Return"
        cancelText="Stay on Form"
        variant="warning"
      />
    </div>
  );
}

export default function CaseFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#cca776] border-r-transparent"></div>
            <p className="text-xs">Loading Case Entry Engine...</p>
          </div>
        </div>
      }
    >
      <CaseFormContent />
    </Suspense>
  );
}
