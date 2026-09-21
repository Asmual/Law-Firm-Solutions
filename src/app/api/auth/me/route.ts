import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      const res = NextResponse.json({ authenticated: false, user: null });
      res.cookies.delete("law_firm_session");
      return res;
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) {
      const res = NextResponse.json({ authenticated: false, user: null });
      res.cookies.delete("law_firm_session");
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        chamberDesignation: user.chamberDesignation,
        barEnrollmentNo: user.barEnrollmentNo,
        phone: user.phone,
        avatarUrl: user.avatarUrl || "",
        bio: user.bio || "",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get user";
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 });
  }
}
