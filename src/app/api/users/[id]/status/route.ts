import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getSessionUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only admin or managing partner can block/unblock users
    if (session.role !== "admin" && session.role !== "partner") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Chamber Admin or Managing Partner can modify user status." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid status value. 'isActive' must be boolean." },
        { status: 400 }
      );
    }

    // Protect admin from blocking themselves
    if (id === session.userId && !isActive) {
      return NextResponse.json(
        { success: false, error: "Security restriction: You cannot block your own admin account." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const actionText = isActive ? "unblocked and activated" : "blocked and deactivated";
    return NextResponse.json({
      success: true,
      message: `User "${updatedUser.name}" has been ${actionText}.`,
      data: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
