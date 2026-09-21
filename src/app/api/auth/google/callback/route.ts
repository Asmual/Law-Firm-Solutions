import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { signSessionToken } from "@/lib/auth";
import { UserRole } from "@/types";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/?auth_error=Google%20OAuth%20not%20configured`);
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/?auth_error=Failed%20to%20exchange%20token`);
    }

    // Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!userRes.ok || !googleUser.email) {
      return NextResponse.redirect(`${appUrl}/?auth_error=Failed%20to%20fetch%20Google%20profile`);
    }

    await connectToDatabase();
    const normalizedEmail = googleUser.email.toLowerCase().trim();

    // Find or create user
    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      // Default role is explicitly "user" for Google OAuth per requirements
      user = await UserModel.create({
        name: googleUser.name || "Google User",
        email: normalizedEmail,
        role: "associate",
        chamberDesignation: "Associate Advocate",
        avatarUrl: googleUser.picture || "",
        authProvider: "google",
        isActive: true,
      });
    }

    const sessionToken = signSessionToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      chamberDesignation: user.chamberDesignation,
    });

    const response = NextResponse.redirect(`${appUrl}/`);
    response.cookies.set({
      name: "law_firm_session",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.redirect(`${appUrl}/?auth_error=Internal%20authentication%20error`);
  }
}
