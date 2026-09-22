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
    let adminUser = await UserModel.findOne({ role: "admin", isActive: true });
    if (!adminUser) {
      adminUser = await UserModel.findOne({ email: "admin@chamber.com" });
    }
    if (!adminUser) {
      adminUser = await UserModel.findOne({ role: "admin" });
    }

    // 2. If no admin exists in the database, create or upsert default chamber admin
    if (!adminUser) {
      try {
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
      } catch (createErr) {
        console.warn("User create error, trying findOneAndUpdate fallback:", createErr);
        adminUser = await UserModel.findOneAndUpdate(
          { email: "admin@chamber.com" },
          {
            $set: {
              name: "Barrister Rafiqul Islam",
              role: "admin",
              isActive: true,
              chamberDesignation: "Managing Partner & Senior Counsel",
              passwordHash: hashPassword("password123"),
            },
          },
          { new: true, upsert: true }
        );
      }
    }

    // 3. Guarantee that the user is active and has admin role
    if (adminUser) {
      let needsSave = false;
      if (!adminUser.isActive) {
        adminUser.isActive = true;
        needsSave = true;
      }
      if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        needsSave = true;
      }
      if (needsSave) {
        try {
          await adminUser.save();
        } catch (saveErr) {
          console.warn("adminUser save warning:", saveErr);
        }
      }
    }

    if (!adminUser) {
      throw new Error("Unable to initialize admin account in database.");
    }

    // 4. Generate session token
    const token = signSessionToken({
      userId: adminUser._id.toString(),
      name: adminUser.name || "Barrister Rafiqul Islam",
      email: adminUser.email || "admin@chamber.com",
      role: (adminUser.role || "admin") as UserRole,
      chamberDesignation: adminUser.chamberDesignation || "Managing Partner & Senior Counsel",
    });

    // 5. Update last active timestamp (safely)
    try {
      await UserModel.findByIdAndUpdate(adminUser._id, { lastActiveAt: new Date() });
    } catch (updateErr) {
      console.warn("Failed to update lastActiveAt:", updateErr);
    }

    // 6. Activity log (safely)
    try {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const userAgent = req.headers.get("user-agent") || "unknown";
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
    } catch (logErr) {
      console.warn("Failed to log demo admin activity:", logErr);
    }

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
    console.error("Demo admin endpoint error:", error);
    const message = error instanceof Error ? error.message : "Demo admin login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
