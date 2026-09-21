import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CaseModel } from "@/models/Case";
import { UserModel } from "@/models/User";
import { getCurrentUserFromSession, getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromSession();
    const session = await getSessionUser();
    if (!user || !session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Only Admin can assign/reassign cases
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Case assignment is restricted to Chamber Admins." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { caseId, advocateId, associateId, remarks } = body;

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 });
    }

    const caseDoc = await CaseModel.findById(caseId);
    if (!caseDoc) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const updateFields: Record<string, unknown> = {};
    let descDetails = "";

    // Advocate assignment
    if (advocateId !== undefined) {
      if (advocateId) {
        const advUser = await UserModel.findById(advocateId).lean();
        if (advUser) {
          updateFields.assignedAdvocate = {
            advocateId: advUser._id,
            advocateName: advUser.name,
            dateAssigned: new Date().toISOString().split("T")[0],
            internalRemarks: remarks || "Assigned by Chamber Admin",
          };
          descDetails += ` Advocate: ${advUser.name};`;
        }
      } else {
        updateFields.assignedAdvocate = {
          advocateName: "Unassigned",
          dateAssigned: "",
          internalRemarks: "",
        };
        descDetails += ` Advocate unassigned;`;
      }
    }

    // Associate assignment
    if (associateId !== undefined) {
      if (associateId) {
        const ascUser = await UserModel.findById(associateId).lean();
        if (ascUser) {
          updateFields.assignedAssociate = {
            associateId: ascUser._id,
            associateName: ascUser.name,
            dateAssigned: new Date().toISOString().split("T")[0],
            internalRemarks: remarks || "Assigned by Chamber Admin",
          };
          descDetails += ` Associate: ${ascUser.name};`;
        }
      } else {
        updateFields.assignedAssociate = {
          associateName: "",
          dateAssigned: "",
          internalRemarks: "",
        };
        descDetails += ` Associate removed;`;
      }
    }

    const updatedCase = await CaseModel.findByIdAndUpdate(
      caseId,
      { $set: updateFields },
      { new: true }
    );

    // Audit log
    await logActivity({
      user: session,
      action: "case:assign",
      entityType: "case",
      entityId: caseId,
      entityTitle: caseDoc.chamberFileNo,
      description: `${user.name} (Admin) reassigned case ${caseDoc.chamberFileNo}.${descDetails}`,
    });

    return NextResponse.json({
      success: true,
      message: "Case assignment updated successfully",
      case: updatedCase,
    });
  } catch (error: unknown) {
    console.error("POST /api/cases/assign error:", error);
    const message = error instanceof Error ? error.message : "Failed to assign case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
