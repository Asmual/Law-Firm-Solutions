"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
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
  User,
  Scale,
  AlertCircle,
  UploadCloud,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Institution, CaseNumberItem, PartyItem, StatusHearingUpdate, CaseDocument, User as UserType } from "@/types";
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
    id: "demo-client-corp-4",
    _id: "demo-client-corp-4",
    name: "Apex Footwear Ltd",
    shortCode: "APEX",
    category: "Corporate Client",
    branch: "Apex Centre, Gulshan",
    focalPerson: {
      name: "Mr. Moniruzzaman Tareq",
      designation: "General Manager (Legal Affairs)",
      phone: "+8801719000910",
      email: "legal@apexfootwearltd.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-corp-5",
    _id: "demo-client-corp-5",
    name: "Grameenphone Ltd",
    shortCode: "GP",
    category: "Corporate Client",
    branch: "GPHouse, Bashundhara",
    focalPerson: {
      name: "Syed Tanveer Hossain",
      designation: "Director & Head of Litigation",
      phone: "+8801711554433",
      email: "litigation@grameenphone.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-corp-6",
    _id: "demo-client-corp-6",
    name: "Akij Group Ltd",
    shortCode: "AKIJ",
    category: "Corporate Client",
    branch: "Akij House, Tejgaon",
    focalPerson: {
      name: "Mr. Shamsuddin Ahmed",
      designation: "Head of Legal & Compliance",
      phone: "+8801712889900",
      email: "legal@akij.net",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-1",
    _id: "demo-client-ind-1",
    name: "Al-Haj Mohammad Nurul Islam",
    shortCode: "IND",
    category: "Individual Client",
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
    category: "Individual Client",
    branch: "Dhanmondi, Dhaka",
    focalPerson: {
      name: "Dr. Tahmina Akter",
      designation: "Individual Petitioner / Professor",
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
    category: "Individual Client",
    branch: "Banani, Dhaka",
    focalPerson: {
      name: "Kazi Mozammel Hossain",
      designation: "Managing Director & Individual Guarantor",
      phone: "+8801711223344",
      email: "mozammel.hossain@outlook.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-4",
    _id: "demo-client-ind-4",
    name: "Engr. Faruque Ahmed",
    shortCode: "IND",
    category: "Individual Client",
    branch: "Mirpur, Dhaka",
    focalPerson: {
      name: "Engr. Faruque Ahmed",
      designation: "Managing Partner, Ahmed Construction",
      phone: "+8801715443322",
      email: "faruque.engineer@gmail.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-5",
    _id: "demo-client-ind-5",
    name: "Begum Rokeya Sultana",
    shortCode: "IND",
    category: "Individual Client",
    branch: "Uttara, Dhaka",
    focalPerson: {
      name: "Begum Rokeya Sultana",
      designation: "Landowner & Civil Appellant",
      phone: "+8801817665544",
      email: "rokeya.sultana@hotmail.com",
    },
    isActive: true,
  },
  {
    id: "demo-client-ind-6",
    _id: "demo-client-ind-6",
    name: "Al-Amin Chowdhury",
    shortCode: "IND",
    category: "Individual Client",
    branch: "Narayanganj Port",
    focalPerson: {
      name: "Al-Amin Chowdhury",
      designation: "Importer & Commercial Litigant",
      phone: "+8801913778899",
      email: "alamin.chy@gmail.com",
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Validation Errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation modal state for removing repeater rows
  const [deleteRowModal, setDeleteRowModal] = useState<{
    isOpen: boolean;
    type: "caseNumber" | "party" | "status";
    index: number;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "caseNumber",
    index: -1,
    title: "",
    message: "",
  });

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
  const [generalRemarks, setGeneralRemarks] = useState("");

  // Assigned Advocate & Associate
  const [assignedAdvocateName, setAssignedAdvocateName] = useState("Unassigned");
  const [assignedAdvocateId, setAssignedAdvocateId] = useState("");
  const [assignedAssociateName, setAssignedAssociateName] = useState("");
  const [assignedAssociateId, setAssignedAssociateId] = useState("");
  const [assignedAssociateCode, setAssignedAssociateCode] = useState("");
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

  // Section 8: Legal Documents & Evidence Files
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Main Petition / Plaint");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const titleToUse = newDocTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
    setIsUploadingDoc(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "File upload failed");
      }

      const fileExtension = file.name.split(".").pop() || "pdf";
      const newDoc: CaseDocument = {
        title: `${titleToUse} (${newDocCategory})`,
        fileUrl: data.url,
        fileType: fileExtension.toLowerCase(),
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [...prev, newDoc]);
      setNewDocTitle("");
      toast.success(`"${file.name}" uploaded and attached to case.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error(msg);
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    toast.info("Document detached from case file.");
  };

  const selectInstitution = (inst: Institution) => {
    setSelectedInst(inst);
    setIsDropdownOpen(false);
    setSearchInstQuery("");
    setFormErrors((prev) => ({ ...prev, institution: "" }));
    if (inst.focalPerson) {
      if (inst.focalPerson.name) setContactName(inst.focalPerson.name);
      if (inst.focalPerson.designation) setContactDesignation(inst.focalPerson.designation);
      if (inst.focalPerson.phone) setContactPhone(inst.focalPerson.phone);
      if (inst.focalPerson.email) setContactEmail(inst.focalPerson.email);
    }
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
            setGeneralRemarks(c.specialNotes.generalRemarks || "");
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
            setAssignedAssociateCode(c.assignedAssociate.associateCode || "");
            if (c.assignedAssociate.internalRemarks) {
              setInternalRemarks(c.assignedAssociate.internalRemarks);
            }
          }
          if (c.statusUpdates && c.statusUpdates.length > 0) {
            setStatusUpdates(c.statusUpdates);
          }
          if (c.documents && Array.isArray(c.documents)) {
            setDocuments(c.documents);
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

  const promptRemoveCaseNumberRow = (index: number) => {
    if (caseNumbers.length <= 1) {
      toast.info("At least one Case Number entry is required.");
      return;
    }
    const targetCase = caseNumbers[index];
    setDeleteRowModal({
      isOpen: true,
      type: "caseNumber",
      index,
      title: "Remove Court Case Number Entry",
      message: `Are you sure you want to remove Case Number row #${index + 1}${
        targetCase.caseNumber ? ` ("${targetCase.caseNumber}")` : ""
      }? This court record will be removed from this case file.`,
    });
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

  const promptRemovePartyRow = (index: number) => {
    if (parties.length <= 1) {
      toast.info("At least one Litigating Party entry is required.");
      return;
    }
    const targetParty = parties[index];
    const preview = targetParty.partyNameDetails ? ` ("${targetParty.partyNameDetails.split("\n")[0]}")` : "";
    setDeleteRowModal({
      isOpen: true,
      type: "party",
      index,
      title: "Remove Litigating Party Entry",
      message: `Are you sure you want to remove Party #${index + 1}${preview}? Remaining parties will be automatically renumbered.`,
    });
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

  const promptRemoveStatusRow = (index: number) => {
    if (statusUpdates.length <= 1) {
      toast.info("At least one Status / Remark history row must remain.");
      return;
    }
    setDeleteRowModal({
      isOpen: true,
      type: "status",
      index,
      title: "Remove Status / Remark History Entry",
      message: `Are you sure you want to remove Status Update row #${index + 1}?`,
    });
  };

  const updateStatus = (index: number, field: keyof StatusHearingUpdate, value: string) => {
    const updated = [...statusUpdates];
    updated[index] = { ...updated[index], [field]: value };
    setStatusUpdates(updated);
  };

  // Row removal confirmation execution
  const handleConfirmDeleteRow = () => {
    if (deleteRowModal.type === "caseNumber") {
      setCaseNumbers((prev) => prev.filter((_, idx) => idx !== deleteRowModal.index));
      toast.success("Case number entry removed successfully.");
    } else if (deleteRowModal.type === "party") {
      setParties((prev) => {
        const filtered = prev.filter((_, idx) => idx !== deleteRowModal.index);
        return filtered.map((p, i) => ({ ...p, partyNo: i + 1 }));
      });
      toast.success("Litigating party entry removed successfully.");
    } else if (deleteRowModal.type === "status") {
      setStatusUpdates((prev) => prev.filter((_, idx) => idx !== deleteRowModal.index));
      toast.success("Status update entry removed successfully.");
    }
    setDeleteRowModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Advocate selector change handler
  const handleAdvocateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (formErrors.assignedAdvocate) {
      setFormErrors((prev) => ({ ...prev, assignedAdvocate: "" }));
    }
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

    const errors: Record<string, string> = {};
    if (!selectedInst) {
      errors.institution = "Please select an Institution or Client.";
    }
    if (!chamberFileNo.trim()) {
      errors.chamberFileNo = "Chamber File No. is required.";
    }
    if (!matter.trim()) {
      errors.matter = "Matter / Subject description is required.";
    }
    if (!assignedAdvocateName || assignedAdvocateName === "Unassigned") {
      errors.assignedAdvocate = "Please assign a lead Advocate to this case.";
    }

    if (!selectedInst || Object.keys(errors).length > 0) {
      if (!selectedInst) {
        errors.institution = "Please select an Institution or Client.";
      }
      setFormErrors(errors);
      toast.error("Please fill in all required fields highlighted in red.");
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
        generalRemarks,
      },
      assignedAdvocate: {
        advocateId: assignedAdvocateId || undefined,
        advocateName: assignedAdvocateName,
        dateAssigned,
        internalRemarks,
      },
      assignedAssociate: (assignedAssociateId || assignedAssociateName) ? {
        associateId: assignedAssociateId || undefined,
        associateCode: assignedAssociateCode || undefined,
        associateName: assignedAssociateName,
        dateAssigned,
        internalRemarks: internalRemarks || "Drafting and hearing",
      } : undefined,
      statusUpdates: statusUpdates.filter((s) => s.statusRemarks.trim() !== ""),
      documents: documents.filter((d) => Boolean(d.fileUrl)),
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
    <div className="min-h-screen bg-transparent text-[#0F172B] dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header - Normal static flow (NOT sticky) so scrolling feels natural */}
      <header className="border-b border-[#ab8c67]/40 bg-[#dfceb7] dark:bg-slate-900/90 dark:border-slate-800 relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/cases"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-[#ab8c67] bg-[#cbb292] text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Return to Case Registry"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-[#0F172B] dark:text-white uppercase truncate">
                  {editId ? `Edit Case • ${chamberFileNo || "Loading..."}` : "Add New Case File"}
                </h1>
                <span className="inline-flex items-center text-[9px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#724916] text-[#cca776] border border-[#ab8c67] font-bold whitespace-nowrap">
                  Litigation Entry
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#724916]/80 dark:text-slate-400 mt-0.5 truncate hidden sm:block">
                All parameters integrated into one unified record • High Court &amp; Banking Practice
              </p>
            </div>
          </div>

          {/* Top Actions: Print / Export, View Dossier, Save Record */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg border border-[#ab8c67] bg-[#cbb292] text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776]" />
              <span className="hidden sm:inline">Print / Export PDF</span>
              <span className="sm:hidden">Print</span>
            </button>

            {editId && (
              <Link
                href={`/cases/${editId}`}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg border border-[#ab8c67] bg-[#cbb292] text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="h-3.5 w-3.5 text-[#724916] dark:text-blue-400" />
                <span className="hidden sm:inline">View Dossier</span>
                <span className="sm:hidden">Dossier</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b89360] shadow-md shadow-[#724916]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#cca776] dark:text-slate-950" />
              <span>{isSaving ? "Saving..." : "Save Record"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Column Full-Width Form Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ================= SECTION 1: TOP INSTITUTION / CLIENT SELECTOR ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase">
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
                className="text-[11px] font-bold text-[#724916] hover:underline dark:text-[#cca776] cursor-pointer"
              >
                Change Selection
              </button>
            )}
          </div>

          {!selectedInst ? (
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Select or Search Institution / Client <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#724916] dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Type to search Bank, NBFI, Corporate Client, or Individual Litigant..."
                  value={searchInstQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchInstQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border rounded-lg text-[#0F172B] dark:text-white placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none transition-colors ${
                    formErrors.institution
                      ? "border-rose-500 ring-1 ring-rose-500/40 bg-rose-50 dark:bg-rose-950/20"
                      : "border-[#ab8c67] focus:border-[#724916] dark:border-slate-700 dark:focus:border-[#cca776]"
                  }`}
                />
              </div>

              {formErrors.institution && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{formErrors.institution}</span>
                </div>
              )}

              {/* Searchable Dropdown Overlay */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-72 overflow-y-auto bg-[#dfceb7] border border-[#ab8c67] rounded-xl shadow-2xl divide-y divide-[#ab8c67]/30 dark:bg-slate-900 dark:border-slate-700 dark:divide-slate-800">
                  {filteredInstitutions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#724916] dark:text-slate-400">
                      No matching institution or client found.
                    </div>
                  ) : (
                    filteredInstitutions.map((inst) => (
                      <button
                        key={inst._id || inst.id || inst.name}
                        type="button"
                        onClick={() => selectInstitution(inst)}
                        className="w-full text-left px-4 py-3 bg-transparent hover:bg-[#cbb292] dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#0F172B] group-hover:text-[#724916] dark:text-white dark:group-hover:text-[#cca776] transition-colors flex items-center gap-2">
                            <span>{inst.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] font-bold font-mono dark:bg-slate-800 dark:text-[#cca776] dark:border-[#cca776]/20">
                              {inst.shortCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#724916]/80 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-[#0F172B] dark:text-slate-300 font-semibold">{inst.category || "Institution"}</span>
                            {inst.branch && <span>• {inst.branch}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#724916] group-hover:underline dark:text-slate-500 dark:group-hover:text-white transition-colors">
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
            <div className="p-4 rounded-xl bg-[#cbb292]/30 dark:bg-slate-950/80 border border-[#ab8c67] dark:border-[#cca776]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[#0F172B] dark:text-white">
                    {selectedInst.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#724916] text-[#cca776] border border-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30 uppercase">
                    {selectedInst.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    CODE: {selectedInst.shortCode}
                  </span>
                </div>
                {selectedInst.branch && (
                  <p className="text-xs text-[#724916] dark:text-slate-400 font-medium">
                    Branch: {selectedInst.branch}
                  </p>
                )}
                {selectedInst.address && (
                  <p className="text-[11px] text-[#724916]/80 dark:text-slate-500">
                    Address: {selectedInst.address}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#724916] bg-[#724916]/10 border border-[#ab8c67] px-3 py-1.5 rounded-lg font-bold dark:bg-[#cca776]/15 dark:text-[#cca776] dark:border-[#cca776]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#724916] dark:bg-[#cca776] animate-pulse"></span>
                  Active Institution Record Selected
                </span>
              </div>
            </div>
          )}

          {/* Focal Person Contact Details (Associated with this Institution/Client) */}
          <div className="pt-2 border-t border-[#ab8c67]/40 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                Focal Contact Person
              </label>
              <input
                type="text"
                placeholder="Officer / Representative Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                Designation / Department
              </label>
              <input
                type="text"
                placeholder="e.g. AGM (Legal) / Director"
                value={contactDesignation}
                onChange={(e) => setContactDesignation(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                Direct Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+88017XXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="contact@client.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: FILE & MATTER DETAILS ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <FileText className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
            <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase">
              2. Chamber File &amp; Subject Matter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300">
                  Chamber File No. <span className="text-rose-500">*</span>
                </label>
                {currentUserRole === "associate" && !!editId && (
                  <span className="text-[10px] font-bold text-[#724916] bg-[#cbb292] px-1.5 py-0.5 rounded border border-[#ab8c67] dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/40">
                    Chamber Ledger Locked
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. 1224 or CF-2024/098"
                value={chamberFileNo}
                disabled={currentUserRole === "associate" && !!editId}
                onChange={(e) => {
                  setChamberFileNo(e.target.value);
                  if (formErrors.chamberFileNo) {
                    setFormErrors((prev) => ({ ...prev, chamberFileNo: "" }));
                  }
                }}
                className={`w-full px-3 py-2 text-sm bg-[#f3ebd9] dark:bg-slate-950 border rounded-lg text-[#0F172B] dark:text-white font-mono font-bold placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  formErrors.chamberFileNo
                    ? "border-rose-500 ring-1 ring-rose-500/40 bg-rose-50 dark:bg-rose-950/20"
                    : "border-[#ab8c67] focus:border-[#724916] dark:border-slate-700 dark:focus:border-[#cca776]"
                }`}
              />
              {formErrors.chamberFileNo ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{formErrors.chamberFileNo}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#724916]/80 dark:text-slate-400">
                  {currentUserRole === "associate" && !!editId
                    ? "Chamber File number is restricted to Partners & Lead Advocates."
                    : "Unique chamber file binder number."}
                </p>
              )}
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300">
                Matter / Subject Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Artha Rin Suit, Stay Vacation, Writ Petition No. 1204/2024"
                value={matter}
                onChange={(e) => {
                  setMatter(e.target.value);
                  if (formErrors.matter) {
                    setFormErrors((prev) => ({ ...prev, matter: "" }));
                  }
                }}
                className={`w-full px-3 py-2 text-sm bg-[#f3ebd9] dark:bg-slate-950 border rounded-lg text-[#0F172B] dark:text-white placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none transition-colors ${
                  formErrors.matter
                    ? "border-rose-500 ring-1 ring-rose-500/40 bg-rose-50 dark:bg-rose-950/20"
                    : "border-[#ab8c67] focus:border-[#724916] dark:border-slate-700 dark:focus:border-[#cca776]"
                }`}
              />
              {formErrors.matter ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{formErrors.matter}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#724916]/80 dark:text-slate-400">
                  Litigation subject, relief sought, and legal issue summary.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: CASE NUMBER(S) & COURTS ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Scale className="h-4 w-4 text-[#724916] dark:text-[#cca776] shrink-0" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase truncate">
                3. Case Number(s) &amp; Court Filings
              </h2>
            </div>
            <button
              type="button"
              onClick={addCaseNumberRow}
              className="group inline-flex items-center gap-1.5 text-xs font-bold bg-[#cbb292] text-[#724916] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] hover:border-[#724916] dark:bg-slate-800 dark:text-[#cca776] dark:border-[#cca776]/30 dark:hover:bg-[#cca776] dark:hover:text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-[#724916] group-hover:text-[#cca776] dark:text-[#cca776] dark:group-hover:text-slate-950 transition-colors" />
              <span className="hidden sm:inline">Add Another Court / Case No.</span>
              <span className="sm:hidden">Add Case No.</span>
            </button>
          </div>

          {/* Desktop View: Wide Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ab8c67]/40 dark:border-slate-800 text-[10px] uppercase font-bold text-[#724916] dark:text-slate-400">
                  <th className="py-2 px-2 text-center w-10">SL</th>
                  <th className="py-2 px-2">Case Number</th>
                  <th className="py-2 px-2">Case Type</th>
                  <th className="py-2 px-2 w-20 text-center">Year</th>
                  <th className="py-2 px-2">Court / Division</th>
                  <th className="py-2 px-2">Remarks</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ab8c67]/30 dark:divide-slate-800/60">
                {caseNumbers.map((cn, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#724916] dark:text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. C.P. No. 3727/2023"
                        value={cn.caseNumber}
                        onChange={(e) => updateCaseNumber(idx, "caseNumber", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 font-medium placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={cn.caseType}
                        onChange={(e) => updateCaseNumber(idx, "caseType", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
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
                        className="w-full px-2 py-1.5 text-xs text-center bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Appellate / High Court / Artha Rin Adalat"
                        value={cn.courtDivision}
                        onChange={(e) => updateCaseNumber(idx, "courtDivision", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Arising out of W.P. No. 1220"
                        value={cn.remarks || ""}
                        onChange={(e) => updateCaseNumber(idx, "remarks", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => promptRemoveCaseNumberRow(idx)}
                        className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
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

          {/* Mobile View: Stacked Cards for Case Numbers */}
          <div className="md:hidden space-y-3">
            {caseNumbers.map((cn, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#cbb292]/30 border border-[#ab8c67] dark:bg-slate-950 dark:border-slate-800 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#ab8c67]/40 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-[#724916] dark:text-[#cca776] flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#724916] text-[#cca776] dark:bg-[#cca776]/15 dark:text-[#cca776] text-[11px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    Case Record #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemoveCaseNumberRow(idx)}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 text-xs whitespace-nowrap"
                    title="Remove entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Case Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C.P. No. 3727/2023"
                      value={cn.caseNumber}
                      onChange={(e) => updateCaseNumber(idx, "caseNumber", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 font-medium placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                        Case Type
                      </label>
                      <select
                        value={cn.caseType}
                        onChange={(e) => updateCaseNumber(idx, "caseType", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      >
                        <option value="Civil Petition">Civil Petition</option>
                        <option value="Writ Petition">Writ Petition</option>
                        <option value="Artha Rin Suit">Artha Rin Suit</option>
                        <option value="Civil Revision">Civil Revision</option>
                        <option value="First Appeal">First Appeal</option>
                        <option value="Criminal Misc">Criminal Misc</option>
                        <option value="Execution Case">Execution Case</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                        Filing Year
                      </label>
                      <input
                        type="text"
                        value={cn.year}
                        onChange={(e) => updateCaseNumber(idx, "year", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-center bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Court / Division / Bench
                    </label>
                    <input
                      type="text"
                      placeholder="Appellate / High Court / Artha Rin Adalat"
                      value={cn.courtDivision}
                      onChange={(e) => updateCaseNumber(idx, "courtDivision", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Remarks / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arising out of W.P. No. 1220"
                      value={cn.remarks || ""}
                      onChange={(e) => updateCaseNumber(idx, "remarks", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SECTION 4: LITIGATING PARTIES ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-[#724916] dark:text-[#cca776] shrink-0" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase truncate">
                4. Litigating Parties
              </h2>
            </div>
            <button
              type="button"
              onClick={addPartyRow}
              className="group inline-flex items-center gap-1.5 text-xs font-bold bg-[#cbb292] text-[#724916] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] hover:border-[#724916] dark:bg-slate-800 dark:text-[#cca776] dark:border-[#cca776]/30 dark:hover:bg-[#cca776] dark:hover:text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-[#724916] group-hover:text-[#cca776] dark:text-[#cca776] dark:group-hover:text-slate-950 transition-colors" />
              <span className="hidden sm:inline">Add Another Party</span>
              <span className="sm:hidden">Add Party</span>
            </button>
          </div>

          {/* Desktop View: Wide Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ab8c67]/40 dark:border-slate-800 text-[10px] uppercase font-bold text-[#724916] dark:text-slate-400">
                  <th className="py-2 px-2 text-center w-10">SL</th>
                  <th className="py-2 px-2 w-32">Party Type</th>
                  <th className="py-2 px-2">Party Name &amp; Address Details</th>
                  <th className="py-2 px-2 w-36">Received Date</th>
                  <th className="py-2 px-2 w-36">Search List / SL Entry</th>
                  <th className="py-2 px-2 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ab8c67]/30 dark:divide-slate-800/60">
                {parties.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#724916] dark:text-slate-400">
                      {p.partyNo || idx + 1}
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={p.partyType || "Petitioner"}
                        onChange={(e) => updateParty(idx, "partyType", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      >
                        <option value="Petitioner">Petitioner</option>
                        <option value="Appellant">Appellant</option>
                        <option value="Plaintiff">Plaintiff</option>
                        <option value="Decree Holder">Decree Holder</option>
                        <option value="Opposite Party">Opposite Party</option>
                        <option value="Respondent">Respondent</option>
                        <option value="Defendant">Defendant</option>
                        <option value="Judgment Debtor">Judgment Debtor</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <textarea
                        rows={2}
                        placeholder="e.g. M/S Bengal Agro Trade Ltd. Represented by MD, 45 Dilkusha C/A, Dhaka"
                        value={p.partyNameDetails}
                        onChange={(e) => updateParty(idx, "partyNameDetails", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
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
                        className="w-full px-2 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-300 font-mono font-bold placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => promptRemovePartyRow(idx)}
                        className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
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

          {/* Mobile View: Stacked Cards for Litigating Parties */}
          <div className="md:hidden space-y-3">
            {parties.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#cbb292]/30 border border-[#ab8c67] dark:bg-slate-950 dark:border-slate-800 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#ab8c67]/40 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-[#724916] dark:text-[#cca776] flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#724916] text-[#cca776] dark:bg-[#cca776]/15 dark:text-[#cca776] text-[11px] font-mono font-bold">
                      {p.partyNo || idx + 1}
                    </span>
                    Party #{p.partyNo || idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemovePartyRow(idx)}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 text-xs whitespace-nowrap"
                    title="Remove party"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                        Party Type
                      </label>
                      <select
                        value={p.partyType || "Petitioner"}
                        onChange={(e) => updateParty(idx, "partyType", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      >
                        <option value="Petitioner">Petitioner</option>
                        <option value="Appellant">Appellant</option>
                        <option value="Plaintiff">Plaintiff</option>
                        <option value="Decree Holder">Decree Holder</option>
                        <option value="Opposite Party">Opposite Party</option>
                        <option value="Respondent">Respondent</option>
                        <option value="Defendant">Defendant</option>
                        <option value="Judgment Debtor">Judgment Debtor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                        Received Date
                      </label>
                      <LegalDatePicker
                        value={p.caseReceivedDate || ""}
                        onChange={(val) => updateParty(idx, "caseReceivedDate", val)}
                        placeholder="DD.MM.YYYY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Party Name &amp; Full Address Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. M/S Bengal Agro Trade Ltd. Represented by MD, 45 Dilkusha C/A, Dhaka"
                      value={p.partyNameDetails}
                      onChange={(e) => updateParty(idx, "partyNameDetails", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Search List / SL Entry
                    </label>
                    <input
                      type="text"
                      placeholder="SL-12345/23"
                      value={p.searchListEntry || ""}
                      onChange={(e) => updateParty(idx, "searchListEntry", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-300 font-mono font-bold placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SECTION 5: ASSIGNED ADVOCATE & CASE STATUS ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase">
                5. Assigned Advocate &amp; Chamber Status
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] font-bold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Internal Chamber Assignment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300">
                  Assigned Advocate (Counsel) <span className="text-rose-500">*</span>
                </label>
                {currentUserRole === "associate" && (
                  <span className="text-[10px] text-[#724916] dark:text-amber-400/90 font-mono font-bold">Lead Counsel</span>
                )}
              </div>
              <select
                value={assignedAdvocateId || assignedAdvocateName}
                onChange={handleAdvocateChange}
                disabled={currentUserRole === "associate"}
                className={`w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border rounded-lg text-[#0F172B] dark:text-slate-100 font-medium focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  formErrors.assignedAdvocate
                    ? "border-rose-500 ring-1 ring-rose-500/40 bg-rose-50 dark:bg-rose-950/20"
                    : "border-[#ab8c67] focus:border-[#724916] dark:border-slate-700 dark:focus:border-[#cca776]"
                }`}
              >
                <option value="Unassigned">Unassigned (Chamber Pool)</option>
                {advocates.map((adv) => (
                  <option key={adv._id || adv.id} value={adv._id || adv.id}>
                    {adv.name} ({adv.chamberDesignation || adv.role})
                  </option>
                ))}
              </select>
              {formErrors.assignedAdvocate && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{formErrors.assignedAdvocate}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Assisting Associate (Optional)
              </label>
              <select
                value={assignedAssociateId}
                onChange={(e) => {
                  const selId = e.target.value;
                  setAssignedAssociateId(selId);
                  const found = advocates.find((u) => (u._id || u.id) === selId);
                  setAssignedAssociateName(found ? found.name : "");
                  setAssignedAssociateCode(found?.associateId || "");
                }}
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 font-medium focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              >
                <option value="">None Assigned</option>
                {advocates.map((u) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.associateId ? `[${u.associateId}] ` : ""}{u.name} ({u.chamberDesignation || u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Date Assigned
              </label>
              <LegalDatePicker
                value={dateAssigned}
                onChange={(val) => setDateAssigned(val)}
                placeholder="DD.MM.YYYY"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
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
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#724916] dark:text-[#cca776] font-bold focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              >
                <option value="running">Running (Active Litigation)</option>
                <option value="stay_granted">Stay Granted / Injunction</option>
                <option value="adjourned">Adjourned</option>
                <option value="disposed">Disposed</option>
                <option value="decreed">Decreed / Judgment Executed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-400">
                Internal Remarks / Instructions
              </label>
              <span className="text-[10px] text-[#724916] dark:text-slate-500 font-bold">Quick Law Presets</span>
            </div>
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                "Drafting and hearing",
                "Waiting for documents",
                "Hearing scheduled",
                "File under process",
                "Notice issued",
                "Research and draft",
                "Initial review",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInternalRemarks(preset)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    internalRemarks === preset
                      ? "bg-[#724916] text-[#cca776] border-[#ab8c67] font-bold dark:bg-[#cca776] dark:text-black dark:border-[#cca776]"
                      : "bg-[#cbb292]/50 border-[#ab8c67] text-[#724916] font-medium hover:bg-[#724916] hover:text-[#cca776] dark:bg-slate-950 dark:border-slate-700/80 dark:text-slate-300 dark:hover:border-[#cca776]/60 dark:hover:text-white"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="e.g. Drafting rejoinder and hearing before High Court Bench 14"
              value={internalRemarks}
              onChange={(e) => setInternalRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
            />
          </div>
        </div>

        {/* ================= SECTION 6: PROCEEDINGS & CHRONOLOGICAL STATUS ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 text-[#724916] dark:text-[#cca776] shrink-0" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase truncate">
                6. Court Proceedings &amp; Status Updates
              </h2>
            </div>
            <button
              type="button"
              onClick={addStatusRow}
              className="group inline-flex items-center gap-1.5 text-xs font-bold bg-[#cbb292] text-[#724916] border border-[#ab8c67] hover:bg-[#724916] hover:text-[#cca776] hover:border-[#724916] dark:bg-slate-800 dark:text-[#cca776] dark:border-[#cca776]/30 dark:hover:bg-[#cca776] dark:hover:text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-[#724916] group-hover:text-[#cca776] dark:text-[#cca776] dark:group-hover:text-slate-950 transition-colors" />
              <span className="hidden sm:inline">Add Progress Entry</span>
              <span className="sm:hidden">Add Entry</span>
            </button>
          </div>

          {/* Desktop View: Wide Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ab8c67]/40 dark:border-slate-800 text-[10px] uppercase font-bold text-[#724916] dark:text-slate-400">
                  <th className="py-2 px-2 w-36">Date</th>
                  <th className="py-2 px-2">Order / Step / Status Description</th>
                  <th className="py-2 px-2 w-48">Court / Bench</th>
                  <th className="py-2 px-2 w-36">Next Date</th>
                  <th className="py-2 px-2 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ab8c67]/30 dark:divide-slate-800/60">
                {statusUpdates.map((su, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2">
                      <LegalDatePicker
                        value={su.updateDate || ""}
                        onChange={(val) => updateStatus(idx, "updateDate", val)}
                        placeholder="DD.MM.YYYY"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. First Order: Rule and Stay for 06 Months on 12.08.2024 before Bijoy-09"
                        value={su.statusRemarks}
                        onChange={(e) => updateStatus(idx, "statusRemarks", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Annex-14 / Court 03"
                        value={su.courtName || ""}
                        onChange={(e) => updateStatus(idx, "courtName", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
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
                        onClick={() => promptRemoveStatusRow(idx)}
                        className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
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

          {/* Mobile View: Clean Stacked Fields Per Proceeding Entry */}
          <div className="md:hidden space-y-3.5">
            {statusUpdates.map((su, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#cbb292]/30 border border-[#ab8c67] dark:bg-slate-950 dark:border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-[#ab8c67]/40 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-[#724916] dark:text-[#cca776] flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#724916] text-[#cca776] dark:bg-[#cca776]/15 dark:text-[#cca776] text-[11px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    Proceeding Entry #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemoveStatusRow(idx)}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 text-xs whitespace-nowrap"
                    title="Remove status update"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Date of Proceeding / Hearing
                    </label>
                    <LegalDatePicker
                      value={su.updateDate || ""}
                      onChange={(val) => updateStatus(idx, "updateDate", val)}
                      placeholder="DD.MM.YYYY"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Order / Step / Status Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. First Order: Rule and Stay for 06 Months on 12.08.2024 before Bijoy-09"
                      value={su.statusRemarks}
                      onChange={(e) => updateStatus(idx, "statusRemarks", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Court / Bench / Chamber Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annex-14 / Court 03 / Bench 22"
                      value={su.courtName || ""}
                      onChange={(e) => updateStatus(idx, "courtName", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700/80 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                      Next Fixed Hearing Date
                    </label>
                    <LegalDatePicker
                      value={su.nextHearingDate || ""}
                      onChange={(val) => updateStatus(idx, "nextHearingDate", val)}
                      placeholder="DD.MM.YYYY"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SECTION 7: SPECIAL CHAMBER NOTES ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800">
            <FileText className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
            <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase">
              7. Special Chamber Notes &amp; Filings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Wokalatnama / Power Note
              </label>
              <input
                type="text"
                placeholder="e.g. Available with bank / Filed on 12.02.2024"
                value={wokalatnamaNote}
                onChange={(e) => setWokalatnamaNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Main Petition Note
              </label>
              <input
                type="text"
                placeholder="e.g. Main petition filed by the bank"
                value={mainPetitionNote}
                onChange={(e) => setMainPetitionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                Extension / Stay Note
              </label>
              <input
                type="text"
                placeholder="e.g. Extension granted till 30.12.2024"
                value={extensionNote}
                onChange={(e) => setExtensionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172B] dark:text-slate-300 mb-1.5">
                General Chamber Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Confidential client instructions / file notes"
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f3ebd9] dark:bg-slate-950 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 8: LEGAL DOCUMENTS & EVIDENCE MANAGEMENT ================= */}
        <div className="bg-[#dfceb7] border border-[#ab8c67] text-[#0F172B] dark:bg-slate-900/90 dark:border-slate-800 dark:text-white rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab8c67]/40 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <UploadCloud className="h-4 w-4 text-[#724916] dark:text-[#cca776] shrink-0" />
              <h2 className="text-xs font-bold tracking-wider text-[#0F172B] dark:text-white uppercase truncate">
                8. Case Documents &amp; Evidence Files ({documents.length})
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] font-bold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              PDF, DOCX, Evidence (Max 15MB)
            </span>
          </div>

          {/* Upload Input & Category Selector */}
          <div className="p-3.5 rounded-xl bg-[#cbb292]/30 border border-[#ab8c67] dark:bg-slate-950 dark:border-slate-800/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certified Copy of High Court Order"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-100 placeholder-[#6e5a44] dark:placeholder-slate-500 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-[#0F172B] dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#f3ebd9] dark:bg-slate-900 border border-[#ab8c67] dark:border-slate-700 rounded-lg text-[#0F172B] dark:text-slate-200 focus:outline-none focus:border-[#724916] dark:focus:border-[#cca776]"
                >
                  <option value="Main Petition / Plaint">Main Petition / Plaint</option>
                  <option value="Wokalatnama / Power of Attorney">Wokalatnama / Power of Attorney</option>
                  <option value="Court Order / Injunction">Court Order / Injunction</option>
                  <option value="Evidence / Exhibit">Evidence / Exhibit</option>
                  <option value="Legal Notice / Demand">Legal Notice / Demand</option>
                  <option value="Written Statement / Reply">Written Statement / Reply</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.txt"
                />
                <button
                  type="button"
                  disabled={isUploadingDoc}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{isUploadingDoc ? "Uploading..." : "Browse & Attach"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          {documents.length === 0 ? (
            <div className="p-6 text-center rounded-lg border border-dashed border-[#ab8c67] dark:border-slate-800 text-xs text-[#724916] dark:text-slate-500 font-medium">
              No documents attached yet. Click Browse &amp; Attach above to archive petitions, certified orders, or evidence.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#ab8c67]/40 dark:border-slate-800 text-[10px] uppercase font-bold text-[#724916] dark:text-slate-400">
                    <th className="py-2 px-2 w-10 text-center">SL</th>
                    <th className="py-2 px-2">Document Title &amp; Category</th>
                    <th className="py-2 px-2 w-28 text-center">Type</th>
                    <th className="py-2 px-2 w-32">Uploaded Date</th>
                    <th className="py-2 px-2 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ab8c67]/30 dark:divide-slate-800/60">
                  {documents.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-[#cbb292]/20 dark:hover:bg-slate-950/60">
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-[#724916] dark:text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-3.5 w-3.5 text-[#724916] dark:text-[#cca776] shrink-0" />
                          <span className="font-bold text-[#0F172B] dark:text-slate-200">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-[#cbb292] text-[#724916] border border-[#ab8c67] font-bold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          {doc.fileType || "doc"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#724916] dark:text-slate-400 text-[11px] font-medium">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-GB") : "Just now"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-[#724916] hover:underline dark:text-[#cca776]"
                            title="Open document in new tab"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= FORM FOOTER ACTIONS ================= */}
        <div className="p-4 bg-[#dfceb7] border border-[#ab8c67] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl">
          <div className="text-xs">
            {selectedInst ? (
              <span className="truncate block text-[#724916] dark:text-slate-400 font-medium">
                Case enrolled under{" "}
                <strong className="text-[#0F172B] dark:text-[#cca776]">{selectedInst.name}</strong>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#724916]/15 text-[#724916] border border-[#ab8c67] font-bold text-xs dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                ⚠️ Select Institution / Client above to save
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowDiscardConfirmModal(true)}
              className="px-3 sm:px-4 py-2 text-xs font-bold rounded-lg border border-[#ab8c67] bg-[#cbb292] text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel &amp; Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 text-xs font-bold rounded-lg bg-[#724916] text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 dark:hover:bg-[#b89360] shadow-md shadow-[#724916]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Save className="h-4 w-4 text-[#cca776] dark:text-slate-950" />
              <span>{isSaving ? "Saving..." : "Save Record"}</span>
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

      {/* Delete Repeater Row Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteRowModal.isOpen}
        onClose={() => setDeleteRowModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeleteRow}
        title={deleteRowModal.title}
        message={deleteRowModal.message}
        confirmText="Remove Entry"
        cancelText="Keep Entry"
        variant="danger"
      />
    </div>
  );
}

export default function CaseFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center text-[#724916] dark:text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#724916] dark:border-[#cca776] border-r-transparent"></div>
            <p className="text-xs font-bold">Loading Case Entry Engine...</p>
          </div>
        </div>
      }
    >
      <CaseFormContent />
    </Suspense>
  );
}
