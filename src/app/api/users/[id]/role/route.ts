import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { UserRole } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only admin or managing partner can change roles
    if (session.role !== "admin" && session.role !== "partner") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Chamber Admin or Managing Partner can change user roles." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const { role, chamberDesignation } = body;

    const allowedRoles: UserRole[] = ["admin", "advocate", "associate"];
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Only 'admin', 'advocate', or 'associate' are permitted." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          role,
          ...(chamberDesignation ? { chamberDesignation } : {}),
        },
      },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to "${role}".`,
      data: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
