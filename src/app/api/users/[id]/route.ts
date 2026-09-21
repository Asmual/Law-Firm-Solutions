import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Allow if user is admin OR inspecting own record
    if (session.role !== "admin" && session.userId !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load user";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
