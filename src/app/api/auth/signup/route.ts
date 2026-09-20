import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { hashPassword, signSessionToken } from "@/lib/auth";
import { UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, role, chamberDesignation, barEnrollmentNo, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Only Advocate and Associate can self-register
    // Admin accounts must be created manually or promoted by an administrator
    const allowedSignupRoles: UserRole[] = ["advocate", "associate"];
    const assignedRole: UserRole = allowedSignupRoles.includes(role)
      ? role
      : "associate";

    const passwordHash = hashPassword(password);

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone?.trim() || "",
      role: assignedRole,
      chamberDesignation: chamberDesignation?.trim() || "Legal Practitioner",
      barEnrollmentNo: barEnrollmentNo?.trim() || "",
      authProvider: "credentials",
      isActive: true,
    });

    const token = signSessionToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      chamberDesignation: user.chamberDesignation,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        chamberDesignation: user.chamberDesignation,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: "law_firm_session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
