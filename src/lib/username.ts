/**
 * Generates a clean, lowercase, unique username based on the user's name and role.
 * Example: "Tanvir Ahmed" -> "tanvir102"
 */
export async function generateUniqueUsername(
  fullName: string,
  role?: string,
  isUsernameTaken?: (username: string) => Promise<boolean>
): Promise<string> {
  // Extract first word/name
  const firstWord = (fullName || "").trim().split(/\s+/)[0] || "";
  let base = firstWord.toLowerCase().replace(/[^a-z0-9]/g, "");

  // If base is too short or empty (e.g., non-Latin script or symbols), use role or "user"
  if (base.length < 2) {
    base = (role || "user").toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  }

  // Fallback if isUsernameTaken is not provided
  if (!isUsernameTaken) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${base}${randomNum}`;
  }

  // Try 3-digit random number first
  for (let i = 0; i < 15; i++) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const candidate = `${base}${randomNum}`;
    const taken = await isUsernameTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  // If collisions continue, try 4-digit numbers
  for (let i = 0; i < 15; i++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${randomNum}`;
    const taken = await isUsernameTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  // Final fallback with timestamp slice to ensure absolute uniqueness
  return `${base}${Date.now().toString().slice(-4)}`;
}
