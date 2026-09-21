import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CaseModel } from "@/models/Case";
import { InstitutionModel } from "@/models/Institution";
import { getCurrentUserFromSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const caseDoc = await CaseModel.findById(id).lean();
    if (!caseDoc) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ case: caseDoc });
  } catch (error: unknown) {
    console.error("GET /api/cases/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await CaseModel.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if File No changed and conflicts with another record
    if (body.chamberFileNo && body.chamberFileNo.trim() !== existing.chamberFileNo) {
      const conflict = await CaseModel.findOne({
        chamberFileNo: body.chamberFileNo.trim(),
        _id: { $ne: id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `File No. "${body.chamberFileNo}" is already taken by another case.` },
          { status: 409 }
        );
      }
      existing.chamberFileNo = body.chamberFileNo.trim();
    }

    if (body.matter) existing.matter = body.matter.trim();
    if (body.branch !== undefined) existing.branch = body.branch.trim();
    if (body.focalPerson) existing.focalPerson = body.focalPerson;
    if (body.caseNumbers) existing.caseNumbers = body.caseNumbers;
    if (body.parties) existing.parties = body.parties;
    if (body.specialNotes) existing.specialNotes = body.specialNotes;
    if (body.assignedAdvocate) existing.assignedAdvocate = body.assignedAdvocate;

    // Append any new status update
    if (Array.isArray(body.statusUpdates)) {
      existing.statusUpdates = body.statusUpdates;
    }

    // Update status and institution stats if changed
    if (body.status && body.status !== existing.status) {
      const prevStatus = existing.status;
      existing.status = body.status;

      if (body.status === "disposed" || body.status === "decreed") {
        if (prevStatus === "running" || prevStatus === "stay_granted" || prevStatus === "adjourned") {
          await InstitutionModel.findByIdAndUpdate(existing.institutionId, {
            $inc: { activeCases: -1, disposedCases: 1 },
          });
        }
      } else if (prevStatus === "disposed" || prevStatus === "decreed") {
        await InstitutionModel.findByIdAndUpdate(existing.institutionId, {
          $inc: { activeCases: 1, disposedCases: -1 },
        });
      }
    }

    if (body.disposalDetails) {
      existing.disposalDetails = body.disposalDetails;
    }

    await existing.save();

    return NextResponse.json({
      message: "Case profile updated successfully",
      case: existing,
    });
  } catch (error: unknown) {
    console.error("PUT /api/cases/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only Senior Lawyer / Admin can delete case files." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const caseDoc = await CaseModel.findById(id);
    if (!caseDoc) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    await CaseModel.findByIdAndDelete(id);

    // Adjust counts
    const decUpdate = caseDoc.status === "disposed" || caseDoc.status === "decreed"
      ? { totalCases: -1, disposedCases: -1 }
      : { totalCases: -1, activeCases: -1 };

    await InstitutionModel.findByIdAndUpdate(caseDoc.institutionId, {
      $inc: decUpdate,
    });

    return NextResponse.json({ message: "Case file deleted successfully" });
  } catch (error: unknown) {
    console.error("DELETE /api/cases/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
