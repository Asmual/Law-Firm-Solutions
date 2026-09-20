import crypto from "crypto";
import { cookies } from "next/headers";
import { UserRole } from "@/types";

const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  "r0XX7p2nq48KRIBI8HkUa8tMVDsiv7ZQ_chamber_law_firm_default_key";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  chamberDesignation?: string;
  exp: number;
}

// 1. Password Security
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === originalHash;
}

// 2. Token Signing & Verification
export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data: SessionPayload = { ...payload, exp };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const hmac = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${hmac}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return null;

    const expectedHmac = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(base64Data)
      .digest("base64url");

    if (signature !== expectedHmac) return null;

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) return null; // Expired

    return payload;
  } catch {
    return null;
  }
}

// 3. Server-side session accessor
export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("law_firm_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const getCurrentUserFromSession = getSessionUser;
