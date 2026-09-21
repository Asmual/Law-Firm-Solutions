"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Trash2,
  Save,
  FileText,
  Clock,
  Printer,
  Eye,
  ArrowLeft,
  X,
  User,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { Institution, CaseNumberItem, PartyItem, StatusHearingUpdate, User as UserType } from "@/types";
import { LegalDatePicker } from "@/components/common/LegalDatePicker";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

// Predefined demo clients & institutions covering Banks, Corporate Clients, and Individual Litigants
const DEFAULT_CLIENTS: Institution[] = [
  {
    id: "demo-inst-1",
    _id: "demo-inst-1",
    name: "Sonali Bank PLC",
    shortCode: "SBL",
    category: "State-Owned Bank",
    branch: "Principal Branch, Motijheel, Dhaka",
    focalPerson: {
      name: "Md. Kamrul Hasan",
      designation: "Assistant General Manager (Legal)",
      phone: "+8801711000101",
      email: "legal.sbl@sonalibank.com.bd",
    },
    isActive: true,
  },
  {
    id: "demo-inst-2",
    _id: "demo-inst-2",
    name: "Agrani Bank PLC",
    shortCode: "ABL",
    category: "State-Owned Bank",
    branch: "Agrani Bhaban Corporate Branch",
    focalPerson: {
      name: "Nazrul Islam Khan",
      designation: "Senior Principal Officer (Law)",
      phone: "+8801712000202",
      email: "law@agranibank.org",
    },
    isActive: true,
  },
  {
    id: "demo-inst-3",
    _id: "demo-inst-3",
    name: "BRAC Bank PLC",
    shortCode: "BBL",
    category: "Private Commercial Bank",
    branch: "Gulshan Head Office, Special Asset Management",
    focalPerson: {
      name: "Tariqul Islam",
      designation: "Head of Litigation Recovery",
      phone: "+8801713000303",
      email: "recovery@bracbank.com",
    },
    isActive: true,
  },
  {
    id: "demo-inst-4",
    _id: "demo-inst-4",
    name: "Islami Bank Bangladesh PLC",
    shortCode: "IBBL",
    category: "Shariah Islamic Bank",
    branch: "Dilkusha Corporate Branch, Dhaka",
    focalPerson: {
      name: "Abu Baker Siddique",
      designation: "VP & In-Charge (Law Division)",
      phone: "+8801714000404",
      email: "law@islamibankbd.com",
    },
    isActive: true,
  },
  {
    id: "demo-inst-5",
    _id: "demo-inst-5",
    name: "IDLC Finance PLC",
    shortCode: "IDLC",
    category: "Non-Banking Financial Institution (NBFI)",
    branch: "Gulshan Corporate Office",
    focalPerson: {
      name: "Shafinur Rahman",
      designation: "Legal Counsel & Head of Litigation",
      phone: "+8801715000505",
      email: "legal@idlc.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-corp-1",
    _id: "demo-client-corp-1",
    name: "Square Pharmaceuticals PLC",
    shortCode: "SQUARE",
    category: "Corporate Client",
    branch: "Corporate Headquarters, Uttara",
    focalPerson: {
      name: "Kazi Ashiqur Rahman",
      designation: "Chief Legal Officer",
      phone: "+8801716000606",
      email: "legal.affairs@squaregroup.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-corp-2",
    _id: "demo-client-corp-2",
    name: "Beximco Group Ltd",
    shortCode: "BEXIMCO",
    category: "Corporate Client",
    branch: "BEXIMCO Industrial Park, Gazipur",
    focalPerson: {
      name: "Barrister Zillur Rahman",
      designation: "Head of Corporate Affairs",
      phone: "+8801717000707",
      email: "zillur@beximco.net",
    },
    isActive: true,
  },
  {
    id: "demo-client-corp-3",
    _id: "demo-client-corp-3",
    name: "Bashundhara Group",
    shortCode: "BG",
    category: "Corporate Client",
    branch: "Bashundhara Industrial Headquarters, Baridhara",
    focalPerson: {
      name: "Maj. (Retd.) Mahfuzul Alam",
      designation: "Executive Director (Legal & Land)",
      phone: "+8801718000808",
      email: "legal@bg.com.bd",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-1",
    _id: "demo-client-ind-1",
    name: "Al-Haj Mohammad Nurul Islam",
    shortCode: "IND",
    category: "Individual",
    branch: "Chittagong Commercial Center",
    focalPerson: {
      name: "Mohammad Nurul Islam",
      designation: "Individual Litigant / Proprietor",
      phone: "+8801819000909",
      email: "nurul.islam@gmail.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-2",
    _id: "demo-client-ind-2",
    name: "Dr. Tahmina Akter",
    shortCode: "IND",
    category: "Individual",
    branch: "Dhanmondi, Dhaka",
    focalPerson: {
      name: "Dr. Tahmina Akter",
      designation: "Individual Petitioner",
      phone: "+8801911000888",
      email: "tahmina.akter@yahoo.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-3",
    _id: "demo-client-ind-3",
    name: "Kazi Mozammel Hossain",
    shortCode: "IND",
    category: "Individual",
    branch: "Banani, Dhaka",
    focalPerson: {
      name: "Kazi Mozammel Hossain",
      designation: "Managing Director & Individual Guarantor",
      phone: "+8801711223344",
      email: "mozammel.hossain@outlook.com",
    },
    isActive: true,
  },
];

function CaseFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const preselectedInstId = searchParams.get("institutionId");

  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState(false);

  // Institution / Client search & selection state
  const [institutions, setInstitutions] = useState<Institution[]>(DEFAULT_CLIENTS);
  const [searchInstQuery, setSearchInstQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  // Advocates & Associates list
  const [advocates, setAdvocates] = useState<UserType[]>([]);
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

  // Special Notes
  const [wokalatnamaNote, setWokalatnamaNote] = useState("");
  const [mainPetitionNote, setMainPetitionNote] = useState("");
  const [extensionNote, setExtensionNote] = useState("");

  // Assigned Advocate & Associate
  const [assignedAdvocateName, setAssignedAdvocateName] = useState("Unassigned");
  const [assignedAdvocateId, setAssignedAdvocateId] = useState("");
  const [assignedAssociateName, setAssignedAssociateName] = useState("");
  const [assignedAssociateId, setAssignedAssociateId] = useState("");
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().split("T")[0]);
  const [internalRemarks, setInternalRemarks] = useState("");

  // Chronological Status Updates
  const [statusUpdates, setStatusUpdates] = useState<StatusHearingUpdate[]>([
    {
      updateDate: new Date().toISOString().split("T")[0],
      statusRemarks: "Initial brief received and case opened in chamber registry.",
      orderDetails: "",
      courtName: "",
    },
  ]);

  const [caseStatus, setCaseStatus] = useState<"running" | "stay_granted" | "adjourned" | "disposed" | "decreed">("running");

  const selectInstitution = (inst: Institution) => {
    setSelectedInst(inst);
    setIsDropdownOpen(false);
    setSearchInstQuery("");
    if (inst.focalPerson) {
      if (inst.focalPerson.name) setContactName(inst.focalPerson.name);
      if (inst.focalPerson.designation) setContactDesignation(inst.focalPerson.designation);
      if (inst.focalPerson.phone) setContactPhone(inst.focalPerson.phone);
      if (inst.focalPerson.email) setContactEmail(inst.focalPerson.email);
    }
  };

  // Check user role
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
        const fetchedList = data.data || data.institutions || [];
        if (fetchedList.length > 0) {
          // Merge with default corporate and individual clients to guarantee variety
          const existingIds = new Set(fetchedList.map((i: Institution) => i._id || i.id));
          const complementary = DEFAULT_CLIENTS.filter(
            (c) => !existingIds.has(c._id) && !existingIds.has(c.id)
          );
          const combined = [...fetchedList, ...complementary];
          setInstitutions(combined);
          if (preselectedInstId) {
            const found = combined.find((i: Institution) => (i._id || i.id) === preselectedInstId);
            if (found) selectInstitution(found);
          }
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_CLIENTS
        setInstitutions(DEFAULT_CLIENTS);
      });

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.data || data.users) {
          setAdvocates(data.data || data.users || []);
        }
      })
      .catch(() => {
        setAdvocates([]);
      });
  }, [preselectedInstId]);

  // Fetch existing case for editing
  useEffect(() => {
    if (!editId) return;

    fetch(`/api/cases/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.case) {
          const c = data.case;
          setChamberFileNo(c.chamberFileNo || "");
          setMatter(c.matter || "");
          setCaseStatus(c.status || "running");

          // Institution binding
          if (c.institutionId) {
            setSelectedInst({
              _id: c.institutionId,
              id: c.institutionId,
              name: c.institutionName || "Bound Client",
              shortCode: "CLNT",
              category: "Private Commercial Bank",
              branch: c.branch || "",
              focalPerson: c.focalPerson || { name: "", designation: "", phone: "", email: "" },
              isActive: true,
            });
          }

          if (c.focalPerson) {
            setContactName(c.focalPerson.name || "");
            setContactDesignation(c.focalPerson.designation || "");
            setContactPhone(c.focalPerson.phone || "");
            setContactEmail(c.focalPerson.email || "");
          }

          if (c.caseNumbers && c.caseNumbers.length > 0) {
            setCaseNumbers(c.caseNumbers);
          }
          if (c.parties && c.parties.length > 0) {
            setParties(c.parties);
          }
          if (c.specialNotes) {
            setWokalatnamaNote(c.specialNotes.wokalatnamaNote || "");
            setMainPetitionNote(c.specialNotes.mainPetitionNote || "");
            setExtensionNote(c.specialNotes.extensionNote || "");
          }
          if (c.assignedAdvocate) {
            setAssignedAdvocateName(c.assignedAdvocate.advocateName || "Unassigned");
            setAssignedAdvocateId(c.assignedAdvocate.advocateId || "");
            setDateAssigned(c.assignedAdvocate.dateAssigned || new Date().toISOString().split("T")[0]);
            setInternalRemarks(c.assignedAdvocate.internalRemarks || "");
          }
          if (c.assignedAssociate) {
            setAssignedAssociateName(c.assignedAssociate.associateName || "");
            setAssignedAssociateId(c.assignedAssociate.associateId || "");
          }
          if (c.statusUpdates && c.statusUpdates.length > 0) {
            setStatusUpdates(c.statusUpdates);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading case to edit:", err);
        toast.error("Failed to load existing case details.");
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
      toast.info("At least one Case Number entry is required.");
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
    const nextNo = parties.length + 1;
    setParties([
      ...parties,
      {
        partyNo: nextNo,
        partyNameDetails: "",
        caseReceivedDate: new Date().toISOString().split("T")[0],
        searchListEntry: "",
      },
    ]);
  };

  const removePartyRow = (index: number) => {
    if (parties.length <= 1) {
      toast.info("At least one Litigating Party entry is required.");
      return;
    }
    const filtered = parties.filter((_, idx) => idx !== index);
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
  const handleSave = async () => {
    if (!editId && currentUserRole === "admin") {
      toast.error(
        "Administrative rule: Administrators maintain oversight and monitoring only. Case file creation is reserved for Advocates and Associates."
      );
      return;
    }

    if (!selectedInst) {
      toast.error("Please select an Institution / Client from the top selector.");
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
      branch: selectedInst.branch || "",
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
      router.push("/cases");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error saving case";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered institutions for search dropdown
  const filteredInstitutions = useMemo(() => {
    if (!searchInstQuery.trim()) return institutions;
    const q = searchInstQuery.toLowerCase();
    return institutions.filter((inst) =>
      inst.name.toLowerCase().includes(q) ||
      inst.shortCode.toLowerCase().includes(q) ||
      (inst.category && inst.category.toLowerCase().includes(q)) ||
      (inst.branch && inst.branch.toLowerCase().includes(q))
    );
  }, [institutions, searchInstQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header - Normal static flow (NOT sticky) so scrolling feels natural */}
      <header className="border-b border-slate-800 bg-slate-900/90 relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/cases"
              className="h-9 w-9 rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Return to Case Registry"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                  {editId ? `Edit Case File • ${chamberFileNo || "Loading..."}` : "Add New Case File"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30 font-medium">
                  Authoritative Litigation Entry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All parameters integrated into one unified record • High Court &amp; Banking Practice
              </p>
            </div>
          </div>

          {/* Top Actions: Print / Export, View Dossier, Save Record */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#cca776]" />
              <span>Print / Export PDF</span>
            </button>

            {editId && (
              <Link
                href={`/cases/${editId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <Eye className="h-4 w-4 text-blue-400" />
                <span>View Case Dossier</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#b89360] shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Record"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Column Full-Width Form Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ================= SECTION 1: TOP INSTITUTION / CLIENT SELECTOR ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                1. Institution / Client
              </h2>
            </div>
            {selectedInst && (
              <button
                type="button"
                onClick={() => {
                  setSelectedInst(null);
                  setIsDropdownOpen(true);
                }}
                className="text-[11px] font-semibold text-[#cca776] hover:underline cursor-pointer"
              >
                Change Selection
              </button>
            )}
          </div>

          {!selectedInst ? (
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select or Search Institution / Client <span className="text-rose-400">*</span>
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type to search Bank, NBFI, Corporate Client, or Individual Litigant..."
                  value={searchInstQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchInstQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#cca776] transition-colors"
                />
              </div>

              {/* Searchable Dropdown Overlay */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800">
                  {filteredInstitutions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching institution or client found.
                    </div>
                  ) : (
                    filteredInstitutions.map((inst) => (
                      <button
                        key={inst._id || inst.id || inst.name}
                        type="button"
                        onClick={() => selectInstitution(inst)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#cca776] transition-colors flex items-center gap-2">
                            <span>{inst.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-[#cca776] border border-[#cca776]/20 font-mono">
                              {inst.shortCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-slate-300 font-medium">{inst.category || "Institution"}</span>
                            {inst.branch && <span>• {inst.branch}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 group-hover:text-white transition-colors">
                          Select →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Selected Institution / Client Card */
            <div className="p-4 rounded-xl bg-slate-950/80 border border-[#cca776]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">
                    {selectedInst.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#cca776]/15 text-[#cca776] border border-[#cca776]/30 uppercase">
                    {selectedInst.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedInst.shortCode}
                  </span>
                </div>
                {selectedInst.branch && (
                  <p className="text-xs text-slate-400">
                    Branch / Office: <strong className="text-slate-300">{selectedInst.branch}</strong>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedInst(null);
                  setIsDropdownOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors self-start md:self-center cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Change Client</span>
              </button>
            </div>
          )}

          {/* Focal Person Contact Details (Associated with this Institution/Client) */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Focal Contact Person
              </label>
              <input
                type="text"
                placeholder="Officer / Representative Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Designation / Department
              </label>
              <input
                type="text"
                placeholder="e.g. AGM (Legal) / Director"
                value={contactDesignation}
                onChange={(e) => setContactDesignation(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Direct Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+88017XXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="contact@client.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-[#cca776]"
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: FILE & MATTER DETAILS ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="h-4 w-4 text-[#cca776]" />
            <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              2. Chamber File &amp; Subject Matter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Chamber File No. <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1224 or CF-2024/098"
                value={chamberFileNo}
                onChange={(e) => setChamberFileNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-[#cca776]"
              />
              <p className="text-[11px] text-slate-400">
                Unique chamber file binder number.
              </p>
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Matter / Subject Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Artha Rin Suit, Stay Vacation, Writ Petition No. 1204/2024"
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#cca776]"
              />
              <p className="text-[11px] text-slate-400">
                Litigation subject, relief sought, and legal issue summary.
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: CASE NUMBER(S) & COURTS ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                3. Case Number(s) &amp; Court Filings
              </h2>
            </div>
            <button
              type="button"
              onClick={addCaseNumberRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Court / Case No.</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2 px-2 text-center w-10">SL</th>
                  <th className="py-2 px-2">Case Number</th>
                  <th className="py-2 px-2">Case Type</th>
                  <th className="py-2 px-2 w-20 text-center">Year</th>
                  <th className="py-2 px-2">Court / Division</th>
                  <th className="py-2 px-2">Remarks</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {caseNumbers.map((cn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. C.P. No. 3727/2023"
                        value={cn.caseNumber}
                        onChange={(e) => updateCaseNumber(idx, "caseNumber", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={cn.caseType}
                        onChange={(e) => updateCaseNumber(idx, "caseType", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
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
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={cn.year}
                        onChange={(e) => updateCaseNumber(idx, "year", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-center bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Appellate / High Court / Artha Rin Adalat"
                        value={cn.courtDivision}
                        onChange={(e) => updateCaseNumber(idx, "courtDivision", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Arising out of W.P. No. 1220"
                        value={cn.remarks || ""}
                        onChange={(e) => updateCaseNumber(idx, "remarks", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeCaseNumberRow(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                        title="Remove row"
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

        {/* ================= SECTION 4: LITIGATING PARTIES ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                4. Litigating Parties (Petitioner / Opposite Party)
              </h2>
            </div>
            <button
              type="button"
              onClick={addPartyRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Party</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2 px-2 text-center w-10">SL</th>
                  <th className="py-2 px-2 w-32">Party Type</th>
                  <th className="py-2 px-2">Party Name &amp; Address Details</th>
                  <th className="py-2 px-2 w-36">Received Date</th>
                  <th className="py-2 px-2 w-32">Search List</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {parties.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Petitioner / Opp. Party"
                        value={p.partyNo === 1 ? "Petitioner No. 1" : `Opposite Party No. 0${p.partyNo - 1}`}
                        onChange={() => updateParty(idx, "partyNo", idx + 1)}
                        className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Luxury Agro Limited / NRB Bank Limited Gulshan Branch"
                        value={p.partyNameDetails}
                        onChange={(e) => updateParty(idx, "partyNameDetails", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2 min-w-[140px]">
                      <LegalDatePicker
                        value={p.caseReceivedDate || ""}
                        onChange={(val) => updateParty(idx, "caseReceivedDate", val)}
                        placeholder="DD.MM.YYYY"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="SL-12345/23"
                        value={p.searchListEntry || ""}
                        onChange={(e) => updateParty(idx, "searchListEntry", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removePartyRow(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                        title="Remove row"
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

        {/* ================= SECTION 5: ASSIGNED ADVOCATE & CASE STATUS ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                5. Assigned Advocate &amp; Chamber Status
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              Internal Chamber Assignment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assigned Advocate (Counsel) <span className="text-rose-400">*</span>
              </label>
              <select
                value={assignedAdvocateId || assignedAdvocateName}
                onChange={handleAdvocateChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
              >
                <option value="Unassigned">Unassigned (Chamber Pool)</option>
                {advocates.map((adv) => (
                  <option key={adv._id || adv.id} value={adv._id || adv.id}>
                    {adv.name} ({adv.chamberDesignation || adv.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-[#cca776]"
              >
                <option value="">None Assigned</option>
                {advocates.map((u) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.name} ({u.chamberDesignation || u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date Assigned
              </label>
              <LegalDatePicker
                value={dateAssigned}
                onChange={(val) => setDateAssigned(val)}
                placeholder="DD.MM.YYYY"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Litigation Status
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
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-[#cca776] font-bold focus:outline-none focus:border-[#cca776]"
              >
                <option value="running">Running (Active Litigation)</option>
                <option value="stay_granted">Stay Granted / Injunction</option>
                <option value="adjourned">Adjourned</option>
                <option value="disposed">Disposed</option>
                <option value="decreed">Decreed / Judgment Executed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Internal Remarks / Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Drafting rejoinder and hearing before High Court Bench 14"
              value={internalRemarks}
              onChange={(e) => setInternalRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
            />
          </div>
        </div>

        {/* ================= SECTION 6: PROCEEDINGS & CHRONOLOGICAL STATUS ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                6. Proceedings &amp; Status Remarks (Chronological History)
              </h2>
            </div>
            <button
              type="button"
              onClick={addStatusRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Status / Hearing</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2 px-2 text-center w-10">SL</th>
                  <th className="py-2 px-2 w-36">Date</th>
                  <th className="py-2 px-2">Status / Remarks / Order Details</th>
                  <th className="py-2 px-2 w-48">Court / Bench</th>
                  <th className="py-2 px-2 w-36">Next Fixed Date</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {statusUpdates.map((su, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <LegalDatePicker
                        value={su.updateDate}
                        onChange={(val) => updateStatus(idx, "updateDate", val)}
                        placeholder="DD.MM.YYYY"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <textarea
                        rows={2}
                        placeholder="e.g. First Order: Rule and Stay for 06 Months on 12.08.2024 before Bijoy-09"
                        value={su.statusRemarks}
                        onChange={(e) => updateStatus(idx, "statusRemarks", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Annex-14 / Court 03"
                        value={su.courtName || ""}
                        onChange={(e) => updateStatus(idx, "courtName", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <LegalDatePicker
                        value={su.nextHearingDate || ""}
                        onChange={(val) => updateStatus(idx, "nextHearingDate", val)}
                        placeholder="DD.MM.YYYY"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeStatusRow(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                        title="Remove status update"
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

        {/* ================= SECTION 7: SPECIAL CHAMBER NOTES ================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="h-4 w-4 text-[#cca776]" />
            <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              7. Special Chamber Notes &amp; Filings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Wokalatnama / Power Note
              </label>
              <input
                type="text"
                placeholder="e.g. Available with bank / Filed on 12.02.2024"
                value={wokalatnamaNote}
                onChange={(e) => setWokalatnamaNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Main Petition Note
              </label>
              <input
                type="text"
                placeholder="e.g. Main petition filed by the bank"
                value={mainPetitionNote}
                onChange={(e) => setMainPetitionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Extension Note
              </label>
              <input
                type="text"
                placeholder="e.g. Extension granted till 30.12.2024"
                value={extensionNote}
                onChange={(e) => setExtensionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#cca776]"
              />
            </div>
          </div>
        </div>

        {/* ================= FORM FOOTER ACTIONS ================= */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-xs text-slate-400">
            {selectedInst ? (
              <span>
                Case will be enrolled under{" "}
                <strong className="text-[#cca776]">{selectedInst.name}</strong> ({selectedInst.category})
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                ⚠️ Please select an Institution / Client above to save
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDiscardConfirmModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Cancel &amp; Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-lg bg-[#cca776] text-slate-950 hover:bg-[#b89360] shadow-md shadow-[#cca776]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Record..." : "Save Record"}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Discard Edits Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDiscardConfirmModal}
        onClose={() => setShowDiscardConfirmModal(false)}
        onConfirm={() => router.push("/cases")}
        title="Discard Current Edits"
        message="Are you sure you want to discard your edits and return to the Case Registry? Any unsaved changes will be lost."
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
