import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CaseModel } from "@/models/Case";
import { InstitutionModel } from "@/models/Institution";
import { getCurrentUserFromSession, getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

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
    const session = await getSessionUser();
    if (!user || !session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await CaseModel.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Role-based Access Enforcement:
    // Admin has universal authority.
    // Advocate can edit cases where they are assigned counsel.
    // Associate can update hearing status, notes, and records for assigned/chamber matters.
    const isAssignedAdvocate =
      existing.assignedAdvocate?.advocateId?.toString() === user.userId ||
      existing.assignedAdvocate?.advocateName?.toLowerCase().trim() === user.name.toLowerCase().trim();

    const isAssignedAssociate =
      existing.assignedAssociate?.associateId?.toString() === user.userId ||
      existing.assignedAssociate?.associateName?.toLowerCase().trim() === user.name.toLowerCase().trim();

    if (user.role === "advocate" && !isAssignedAdvocate) {
      return NextResponse.json(
        {
          error:
            "Permission denied. You can only edit litigation cases assigned to you. Contact the Admin for reassignment.",
        },
        { status: 403 }
      );
    }

    if (user.role === "associate" && !isAssignedAssociate && !isAssignedAdvocate) {
      return NextResponse.json(
        {
          error:
            "Permission denied. Associates can only update records for briefs they are assigned to assist with.",
        },
        { status: 403 }
      );
    }

    // Check if File No changed and conflicts with another record
    if (body.chamberFileNo && body.chamberFileNo.trim() !== existing.chamberFileNo) {
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "Only Admin can modify Chamber File Number." },
          { status: 403 }
        );
      }
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

    // Only Admin can reassign lead advocate
    if (body.assignedAdvocate) {
      if (user.role === "admin" || isAssignedAdvocate) {
        existing.assignedAdvocate = body.assignedAdvocate;
      }
    }

    // Assign / update Associate
    if (body.assignedAssociate !== undefined) {
      if (user.role === "admin" || user.role === "advocate") {
        existing.assignedAssociate = body.assignedAssociate;
      }
    }

    // Append / replace status updates
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

    // Log Activity
    await logActivity({
      user: session,
      action: "case:update",
      entityType: "case",
      entityId: String(existing._id),
      entityTitle: existing.chamberFileNo,
      description: `${user.name} (${user.role}) updated case ${existing.chamberFileNo}`,
    });

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

    const session = await getSessionUser();
    await logActivity({
      user: session,
      action: "case:delete",
      entityType: "case",
      entityId: id,
      entityTitle: caseDoc.chamberFileNo,
      description: `${user.name} (Admin) deleted case file ${caseDoc.chamberFileNo}`,
    });

    return NextResponse.json({ message: "Case file deleted successfully" });
  } catch (error: unknown) {
    console.error("DELETE /api/cases/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
