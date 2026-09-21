import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (session) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await logActivity({
      user: session,
      action: "auth:logout",
      entityType: "auth",
      entityId: session.userId,
      entityTitle: session.name,
      description: `User ${session.name} logged out from chamber portal.`,
      ipAddress: ip,
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear cookie
  response.cookies.set({
    name: "law_firm_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
