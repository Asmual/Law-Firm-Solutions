export type UserRole = "admin" | "partner" | "advocate" | "associate" | "user";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  chamberDesignation: string;
  barEnrollmentNo?: string;
  avatarUrl?: string;
  authProvider?: "credentials" | "google";
  isActive: boolean;
  createdAt?: string;
}

export type InstitutionCategory =
  | "Private Commercial Bank"
  | "State-Owned Bank"
  | "Shariah Islamic Bank"
  | "Non-Banking Financial Institution (NBFI)"
  | "Corporate Client"
  | "Individual";

export interface Institution {
  _id?: string;
  id?: string;
  name: string;
  shortCode: string;
  category: InstitutionCategory;
  branch?: string;
  address?: string;
  focalPerson: {
    name: string;
    designation: string;
    phone: string;
    email?: string;
  };
  totalCases?: number;
  activeCases?: number;
  disposedCases?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseNumberItem {
  id?: string;
  caseNumber: string;
  caseType: string; // e.g. Artha Rin, Writ Petition, Civil Revision
  year: string;
  courtDivision: string; // e.g. High Court Division, Artha Rin Adalat Dhaka
  remarks?: string;
}

export interface PartyItem {
  id?: string;
  partyNo: number;
  partyNameDetails: string;
  caseReceivedDate?: string;
  searchListEntry?: string;
}

export interface SpecialNotes {
  wokalatnamaNote?: string;
  mainPetitionNote?: string;
  extensionNote?: string;
  generalRemarks?: string;
}

export interface AssignedAdvocate {
  advocateId?: string;
  advocateName: string;
  dateAssigned?: string;
  internalRemarks?: string;
}

export interface StatusHearingUpdate {
  id?: string;
  updateDate: string;
  statusRemarks: string;
  orderDetails?: string;
  nextHearingDate?: string;
  courtName?: string;
  enteredBy?: string;
  createdAt?: string;
}

export interface CaseDocument {
  id?: string;
  title: string;
  fileUrl: string;
  fileType?: string;
  uploadedAt: string;
}

export type CaseStatus =
  | "running"
  | "stay_granted"
  | "adjourned"
  | "disposed"
  | "decreed";

export interface Case {
  _id?: string;
  id?: string;
  chamberFileNo: string; // Unique chamber file identifier e.g. CF-2024/012
  institutionId: string;
  institutionName: string;
  matter: string; // e.g. Artha Rin, Loan Recovery, Writ
  branch?: string;
  focalPerson?: {
    name: string;
    designation: string;
    phone: string;
    email?: string;
  };
  caseNumbers: CaseNumberItem[];
  parties: PartyItem[];
  specialNotes?: SpecialNotes;
  assignedAdvocate?: AssignedAdvocate;
  statusUpdates: StatusHearingUpdate[];
  status: CaseStatus;
  disposalDetails?: {
    disposalDate?: string;
    outcomeRemarks?: string;
    decreeSummary?: string;
  };
  documents?: CaseDocument[];
  createdAt?: string;
  updatedAt?: string;
}
