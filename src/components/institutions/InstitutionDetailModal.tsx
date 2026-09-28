"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FilePlus2,
  Calendar,
  ExternalLink,
  Edit,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Institution, Case } from "@/types";

interface InstitutionDetailModalProps {
  institutionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (institution: Institution) => void;
}

export function InstitutionDetailModal({
  institutionId,
  isOpen,
  onClose,
  onEdit,
}: InstitutionDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    if (!isOpen || !institutionId) {
      setInstitution(null);
      setCases([]);
      return;
    }

    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/institutions/${institutionId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setInstitution(data.data);
          setCases(data.data.cases || []);
        }
      } catch (err) {
        console.error("Error fetching institution details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, institutionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#ab8c67] bg-[#dfceb7] p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col text-[#0F172B] dark:text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#ab8c67]/40 pb-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#724916] text-[#cca776] ring-1 ring-[#ab8c67] dark:bg-[#cca776]/15 dark:text-[#cca776] dark:ring-[#cca776]/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0F172B] dark:text-white">
                  {institution?.name || "Institution Profile"}
                </h2>
                {institution?.shortCode && (
                  <span className="rounded bg-[#cbb292] border border-[#ab8c67] px-2 py-0.5 text-xs font-bold text-[#724916] dark:bg-slate-800 dark:text-slate-200">
                    {institution.shortCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4a3e33] dark:text-slate-400 mt-0.5">
                {institution?.category || "Client Profile"} • {institution?.branch || "Main Office"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {institution && (
              <button
                onClick={() => {
                  onEdit(institution);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ab8c67] bg-[#cbb292] px-3 py-1.5 text-xs font-bold text-[#724916] hover:bg-[#724916] hover:text-[#cca776] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#724916] hover:bg-[#cbb292] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#724916] dark:text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#724916] dark:text-[#cca776]" />
              <p className="mt-3 text-xs">Loading client directory &amp; case files...</p>
            </div>
          ) : institution ? (
            <>
              {/* Institution Overview & Focal Person */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Office Info Card */}
                <div className="rounded-xl border border-[#ab8c67]/60 bg-[#ece1d0] p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#724916] dark:text-[#cca776]">
                    Corporate Particulars
                  </span>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-[#724916] dark:text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-[#4a3e33] dark:text-slate-400">Branch / Unit: </span>
                        <span className="font-semibold text-[#0F172B] dark:text-slate-100">
                          {institution.branch || "Head Office / Corporate Division"}
                        </span>
                      </div>
                    </div>
                    {institution.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-[#724916] dark:text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-[#4a3e33] dark:text-slate-400">Address: </span>
                          <span className="text-[#0F172B] dark:text-slate-200">
                            {institution.address}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <ShieldCheck className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                      <span className="text-[11px] font-bold text-[#724916] dark:text-[#cca776]">
                        Active Verified Client Entity
                      </span>
                    </div>
                  </div>
                </div>

                {/* Focal Person Card */}
                <div className="rounded-xl border border-[#ab8c67]/60 bg-[#ece1d0] p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#724916] dark:text-[#cca776]">
                    Legal Officer / Focal Person
                  </span>
                  {institution.focalPerson?.name ? (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {institution.focalPerson.name}
                        </span>
                        {institution.focalPerson.designation && (
                          <span className="text-[11px] text-slate-500">
                            ({institution.focalPerson.designation})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {institution.focalPerson.phone && (
                          <a
                            href={`tel:${institution.focalPerson.phone}`}
                            className="inline-flex items-center gap-1.5 font-medium text-[#724916] hover:underline dark:text-[#cca776]"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{institution.focalPerson.phone}</span>
                          </a>
                        )}
                        {institution.focalPerson.email && (
                          <a
                            href={`mailto:${institution.focalPerson.email}`}
                            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>{institution.focalPerson.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">
                      No focal person designated yet. Click Edit Profile to assign legal contact.
                    </p>
                  )}
                </div>
              </div>

              {/* Mapped Legal Cases Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#724916] dark:text-[#cca776]" />
                    <h3 className="text-sm font-bold text-[#0F172B] dark:text-white">
                      Directly Mapped Legal Cases ({cases.length})
                    </h3>
                  </div>

                  <Link
                    href={`/cases/new?institutionId=${institution.id || institution._id}&institutionName=${encodeURIComponent(
                      institution.name
                    )}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#724916] px-3 py-1.5 text-xs font-bold text-[#cca776] hover:bg-[#8b6028] dark:bg-[#cca776] dark:text-slate-950 transition-colors"
                  >
                    <FilePlus2 className="h-3.5 w-3.5" />
                    <span>+ Register Case File</span>
                  </Link>
                </div>

                {cases.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#ab8c67] bg-[#ece1d0] p-8 text-center dark:border-slate-800 dark:bg-slate-950">
                    <Briefcase className="mx-auto h-7 w-7 text-[#724916] dark:text-slate-400" />
                    <p className="mt-2 text-xs font-bold text-[#0F172B] dark:text-slate-200">
                      No legal case files registered under this institution yet.
                    </p>
                    <p className="text-[11px] text-[#4a3e33] dark:text-slate-500 mt-0.5">
                      Open a new case file to link litigation proceedings with {institution.name}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#ab8c67] bg-[#dfceb7] shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#cbb292] text-[#724916] uppercase tracking-wider font-bold border-b border-[#ab8c67] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Chamber File</th>
                            <th className="px-3.5 py-2.5">Primary Case / Type</th>
                            <th className="px-3.5 py-2.5">Litigating Parties</th>
                            <th className="px-3.5 py-2.5">Lead Counsel</th>
                            <th className="px-3.5 py-2.5">Status</th>
                            <th className="px-3.5 py-2.5">Next Date</th>
                            <th className="px-3.5 py-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ab8c67]/40 dark:divide-slate-800 text-[#0F172B] dark:text-slate-300">
                          {cases.map((c) => {
                            const primaryCase = c.caseNumbers?.[0];
                            const lastUpdate = c.statusUpdates?.[c.statusUpdates.length - 1];
                            const nextDate = lastUpdate?.nextHearingDate;
                            const partyText = c.parties?.length
                              ? c.parties.map((p) => p.partyNameDetails).join(" vs ")
                              : "—";

                            return (
                              <tr
                                key={c.id || c._id}
                                className="hover:bg-[#ece1d0] dark:hover:bg-slate-900/50 transition-colors"
                              >
                                <td className="px-3.5 py-2.5 font-bold text-[#0F172B] dark:text-white">
                                  {c.chamberFileNo || "—"}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <div className="font-semibold text-[#0F172B] dark:text-slate-200">
                                    {primaryCase?.caseNumber || "Case Pending"}
                                  </div>
                                  <div className="text-[10px] text-[#4a3e33] dark:text-slate-500">
                                    {primaryCase?.caseType || c.matter} • {primaryCase?.courtDivision || "Court"}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 max-w-[200px]">
                                  <div className="truncate text-[#0F172B] dark:text-slate-300 font-medium" title={partyText}>
                                    {partyText}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-[#4a3e33] dark:text-slate-400">
                                  {c.assignedAdvocate?.advocateName || c.assignedAssociate?.associateName || "Not assigned"}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <span className="inline-flex rounded-full bg-[#724916] px-2 py-0.5 text-[10px] font-bold text-[#cca776] ring-1 ring-[#ab8c67]/40 dark:bg-[#cca776]/15 dark:text-[#cca776]">
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-[#4a3e33] dark:text-slate-400">
                                  {nextDate ? (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-[#724916] dark:text-[#cca776]" />
                                      <span>
                                        {new Date(nextDate).toLocaleDateString("en-GB")}
                                      </span>
                                    </div>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="px-3.5 py-2.5 text-right">
                                  <Link
                                    href={`/cases/${c.id || c._id}`}
                                    className="inline-flex items-center gap-1 font-semibold text-[#724916] hover:underline dark:text-[#cca776]"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Institution record not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
