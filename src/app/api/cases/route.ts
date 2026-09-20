import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CaseModel } from "@/models/Case";
import { InstitutionModel } from "@/models/Institution";
import { getCurrentUserFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const institutionId = searchParams.get("institutionId");
    const status = searchParams.get("status");
    const advocateId = searchParams.get("advocateId");
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const filter: Record<string, unknown> = {};

    if (institutionId) {
      filter.institutionId = institutionId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (advocateId) {
      filter["assignedAdvocate.advocateId"] = advocateId;
    }

    if (query && query.trim() !== "") {
      const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { chamberFileNo: regex },
        { institutionName: regex },
        { matter: regex },
        { "caseNumbers.caseNumber": regex },
        { "parties.partyNameDetails": regex },
        { "assignedAdvocate.advocateName": regex },
      ];
    }

    const skip = (page - 1) * limit;
    const [cases, total] = await Promise.all([
      CaseModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      CaseModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      cases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error("GET /api/cases error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch cases";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Role Rule: Admin is for oversight/monitoring only. Only Advocate and Associate create cases.
    if (user.role === "admin") {
      return NextResponse.json(
        {
          error:
            "Administrative policy: Administrators hold oversight and management authority. Case file creation is reserved for Advocates and Associates.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      chamberFileNo,
      institutionId,
      institutionName,
      matter,
      branch,
      focalPerson,
      caseNumbers,
      parties,
      specialNotes,
      assignedAdvocate,
      statusUpdates,
      status,
    } = body;

    if (!chamberFileNo || !chamberFileNo.trim()) {
      return NextResponse.json({ error: "File No. is required" }, { status: 400 });
    }

    if (!institutionId || !institutionName) {
      return NextResponse.json({ error: "Institution/Client is required" }, { status: 400 });
    }

    if (!matter || !matter.trim()) {
      return NextResponse.json({ error: "Matter/Subject is required" }, { status: 400 });
    }

    // Check duplicate chamberFileNo
    const existingCase = await CaseModel.findOne({
      chamberFileNo: chamberFileNo.trim(),
    });
    if (existingCase) {
      return NextResponse.json(
        { error: `A case file with File No. "${chamberFileNo}" already exists.` },
        { status: 409 }
      );
    }

    // Auto-record creator in first status update if entered
    const formattedStatusUpdates = Array.isArray(statusUpdates)
      ? statusUpdates.map((update: { updateDate: string; statusRemarks: string; orderDetails?: string; nextHearingDate?: string; courtName?: string }) => ({
          ...update,
          enteredBy: user.name || "Chamber Associate",
          createdAt: new Date(),
        }))
      : [];

    const newCase = await CaseModel.create({
      chamberFileNo: chamberFileNo.trim(),
      institutionId,
      institutionName: institutionName.trim(),
      matter: matter.trim(),
      branch: branch ? branch.trim() : "",
      focalPerson: focalPerson || { name: "", designation: "", phone: "", email: "" },
      caseNumbers: Array.isArray(caseNumbers) ? caseNumbers : [],
      parties: Array.isArray(parties) ? parties : [],
      specialNotes: specialNotes || {},
      assignedAdvocate: assignedAdvocate || { advocateName: "Unassigned" },
      statusUpdates: formattedStatusUpdates,
      status: status || "running",
      documents: [],
    });

    // Increment institution's active cases count
    await InstitutionModel.findByIdAndUpdate(institutionId, {
      $inc: { totalCases: 1, activeCases: 1 },
    });

    return NextResponse.json(
      { message: "Case profile created successfully", case: newCase },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/cases error:", error);
    const message = error instanceof Error ? error.message : "Failed to create case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
