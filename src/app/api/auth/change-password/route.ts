import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getSessionUser, verifyPassword, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId).select("+passwordHash");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (!user.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await logActivity({
      user: session,
      action: "auth:password_change",
      entityType: "auth",
      entityId: session.userId,
      entityTitle: session.name,
      description: `User ${session.name} changed their chamber password.`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Password update failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
