export interface BrandingConfig {
  brandName: string;
  tagline: string;
  chamberName: string;
  chamberAddress: string;
  logoUrl?: string;
  faviconUrl?: string;
  poweredByEnabled: boolean;
  poweredByName: string;
}

export const BRANDING: BrandingConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Case Database",
  tagline: process.env.NEXT_PUBLIC_TAGLINE || "The Legal Solutions",
  chamberName: process.env.NEXT_PUBLIC_CHAMBER_NAME || "Law Firm Solutions Chamber",
  chamberAddress:
    process.env.NEXT_PUBLIC_CHAMBER_ADDRESS ||
    "Supreme Court Bar Association Building, Ramna, Dhaka-1000",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "/favicon.ico",
  poweredByEnabled: process.env.NEXT_PUBLIC_POWERED_BY_ENABLED !== "false",
  poweredByName: process.env.NEXT_PUBLIC_POWERED_BY_NAME || "The Legal Solutions",
};

/**
 * Standard legal date formatter for the entire application (DD.MM.YYYY).
 */
export function formatLegalDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      // If already formatted like DD.MM.YYYY or YYYY-MM-DD
      if (typeof dateInput === "string" && dateInput.includes(".")) return dateInput;
      if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [yyyy, mm, dd] = dateInput.split("-");
        return `${dd}.${mm}.${yyyy}`;
      }
      return dateInput as string;
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return String(dateInput);
  }
}
