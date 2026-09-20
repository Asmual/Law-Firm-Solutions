import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InstitutionModel } from "@/models/Institution";
import { CaseModel } from "@/models/Case";

// GET /api/institutions - Fetch all institutions with search & filters
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const query: Record<string, unknown> = { isActive: true };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortCode: { $regex: search, $options: "i" } },
        { branch: { $regex: search, $options: "i" } },
        { "focalPerson.name": { $regex: search, $options: "i" } },
      ];
    }

    const institutions = await InstitutionModel.find(query)
      .sort({ name: 1 })
      .lean();

    // Attach case count for each institution
    const institutionsWithStats = await Promise.all(
      institutions.map(async (inst) => {
        const totalCases = await CaseModel.countDocuments({
          institutionId: inst._id,
        });
        const activeCases = await CaseModel.countDocuments({
          institutionId: inst._id,
          status: { $in: ["running", "stay_granted", "adjourned"] },
        });
        const disposedCases = await CaseModel.countDocuments({
          institutionId: inst._id,
          status: { $in: ["disposed", "decreed"] },
        });

        return {
          ...inst,
          id: inst._id.toString(),
          totalCases,
          activeCases,
          disposedCases,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: institutionsWithStats,
      count: institutionsWithStats.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch institutions";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/institutions - Create a new institution
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.shortCode) {
      return NextResponse.json(
        { success: false, error: "Name and Short Code are required" },
        { status: 400 }
      );
    }

    // Check if short code already exists
    const existing = await InstitutionModel.findOne({
      shortCode: body.shortCode.toUpperCase().trim(),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `An institution with code "${body.shortCode}" already exists.`,
        },
        { status: 409 }
      );
    }

    const institution = await InstitutionModel.create({
      name: body.name.trim(),
      shortCode: body.shortCode.toUpperCase().trim(),
      category: body.category || "Private Commercial Bank",
      branch: body.branch || "",
      address: body.address || "",
      focalPerson: {
        name: body.focalPerson?.name || "",
        designation: body.focalPerson?.designation || "",
        phone: body.focalPerson?.phone || "",
        email: body.focalPerson?.email || "",
      },
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Institution created successfully",
        data: institution,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create institution";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
