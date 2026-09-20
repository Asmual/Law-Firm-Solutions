import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // Fetch all users so admin can view active and blocked users
    const users = await UserModel.find({})
      .select("-passwordHash")
      .sort({ role: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({ ...u, id: u._id.toString() })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
