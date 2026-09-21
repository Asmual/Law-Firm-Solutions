import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  "r0XX7p2nq48KRIBI8HkUa8tMVDsiv7ZQ_chamber_law_firm_default_key";

/**
 * Validates HMAC session token in Edge runtime using Web Crypto API.
 */
async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return false;

    // 1. Check expiration from payload
    const base64Standard = base64Data
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Data.length + ((4 - (base64Data.length % 4)) % 4), "=");
    const jsonStr = atob(base64Standard);
    const payload = JSON.parse(jsonStr);

    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }

    // 2. Verify HMAC SHA-256 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(AUTH_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signedBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(base64Data)
    );

    // Convert signature to base64url
    let binary = "";
    const bytes = new Uint8Array(signedBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return signature === expectedSig;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("law_firm_session")?.value;
  const authenticated = await isValidSession(sessionCookie);

  // 1. Any route other than root (/) requires authentication.
  // Unauthenticated users attempting to access ANY interface are redirected to login (/)
  if (pathname !== "/" && !authenticated) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users visiting root (/) are redirected to /dashboard
  if (pathname === "/" && authenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
