import { connectToDatabase } from "@/lib/mongodb";
import { SettingModel } from "@/models/Setting";
import {
  Role,
  Permission,
  DEFAULT_SETTINGS,
  hasPermission as checkBasePermission,
  SystemSettingsConfig,
} from "@/config/permissions";
import { SessionPayload } from "@/lib/auth";

/**
 * Retrieves the current system settings from DB or returns default config.
 */
export async function getSystemSettings(): Promise<SystemSettingsConfig> {
  try {
    await connectToDatabase();
    const settingsDoc = await SettingModel.findOne({ key: "system_config" }).lean();
    if (settingsDoc && typeof settingsDoc.value === "object") {
      return {
        ...DEFAULT_SETTINGS,
        ...(settingsDoc.value as Partial<SystemSettingsConfig>),
      };
    }
  } catch (error) {
    console.error("Failed to load system settings from DB, using defaults:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Checks whether an authenticated user has the specified permission.
 */
export async function checkUserPermission(
  user: SessionPayload | null | undefined,
  permission: Permission
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "admin") return true;

  const settings = await getSystemSettings();
  return checkBasePermission(user.role as Role, permission, settings);
}
