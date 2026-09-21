import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, signSessionToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        chamberDesignation: user.chamberDesignation || "",
        barEnrollmentNo: user.barEnrollmentNo || "",
        avatarUrl: user.avatarUrl || "",
        bio: user.bio || "",
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, chamberDesignation, barEnrollmentNo, avatarUrl, bio } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Legal name is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // Update allowed profile fields
    user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (chamberDesignation !== undefined) user.chamberDesignation = chamberDesignation.trim();
    if (barEnrollmentNo !== undefined) user.barEnrollmentNo = barEnrollmentNo.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    // Log Activity
    await logActivity({
      user: session,
      action: "user:update",
      entityType: "user",
      entityId: user._id.toString(),
      entityTitle: user.name,
      description: `Updated profile details and credentials (${user.chamberDesignation})`,
    });

    // Generate refreshed token with updated designation & name
    const newToken = signSessionToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      chamberDesignation: user.chamberDesignation,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        chamberDesignation: user.chamberDesignation,
        barEnrollmentNo: user.barEnrollmentNo,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });

    // Set updated cookie
    response.cookies.set({
      name: "law_firm_session",
      value: newToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
