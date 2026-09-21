import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const userRole = searchParams.get("userRole");
    const requestedUserId = searchParams.get("userId");

    const query: Record<string, unknown> = {};

    if (session.role === "admin") {
      if (requestedUserId) query.userId = requestedUserId;
      if (userRole) query.userRole = userRole;
    } else {
      // Non-admin can only inspect their own work logs
      query.userId = session.userId;
    }

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLogModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load activity logs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
