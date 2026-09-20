import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InstitutionModel } from "@/models/Institution";
import { CaseModel } from "@/models/Case";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const institution = await InstitutionModel.findById(id).lean();
    if (!institution) {
      return NextResponse.json(
        { success: false, error: "Institution not found" },
        { status: 404 }
      );
    }

    // Fetch related cases
    const cases = await CaseModel.find({ institutionId: id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...institution,
        id: institution._id.toString(),
        cases: cases.map((c) => ({ ...c, id: c._id.toString() })),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch institution";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await InstitutionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: body.name,
          shortCode: body.shortCode?.toUpperCase(),
          category: body.category,
          branch: body.branch,
          address: body.address,
          focalPerson: body.focalPerson,
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Institution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Institution updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update institution";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    // Soft delete
    const updated = await InstitutionModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Institution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Institution deactivated successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete institution";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
