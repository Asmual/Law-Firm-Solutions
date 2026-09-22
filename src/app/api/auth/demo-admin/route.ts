import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { signSessionToken, hashPassword } from "@/lib/auth";
import { UserRole } from "@/types";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Locate an active admin user or admin@chamber.com
    let adminUser = await UserModel.findOne({
      $or: [{ role: "admin", isActive: true }, { email: "admin@chamber.com" }],
    });

    // 2. If no admin exists in the database, create the default chamber admin
    if (!adminUser) {
      adminUser = await UserModel.create({
        name: "Barrister Rafiqul Islam",
        email: "admin@chamber.com",
        phone: "+8801711000001",
        passwordHash: hashPassword("password123"),
        role: "admin",
        chamberDesignation: "Managing Partner & Senior Counsel",
        barEnrollmentNo: "SC-4521/1998",
        isActive: true,
      });
    }

    if (!adminUser.isActive) {
      adminUser.isActive = true;
      await adminUser.save();
    }

    // 3. Generate session token
    const token = signSessionToken({
      userId: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role as UserRole,
      chamberDesignation: adminUser.chamberDesignation,
    });

    // 4. Update last active timestamp
    await UserModel.findByIdAndUpdate(adminUser._id, { lastActiveAt: new Date() });

    // 5. Activity log
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";
    await logActivity({
      user: {
        userId: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role as UserRole,
        chamberDesignation: adminUser.chamberDesignation,
        exp: 0,
      },
      action: "auth:login",
      entityType: "auth",
      entityId: adminUser._id.toString(),
      entityTitle: adminUser.name,
      description: `Instant Demo Admin Access utilized by ${adminUser.name}.`,
      ipAddress: ip,
      userAgent: userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: `Logged in as Admin (${adminUser.name})`,
      user: {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        chamberDesignation: adminUser.chamberDesignation,
      },
    });

    response.cookies.set({
      name: "law_firm_session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Demo admin login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
