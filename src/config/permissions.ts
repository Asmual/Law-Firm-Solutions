export type Role = "admin" | "advocate" | "associate" | "viewer";

export type Permission =
  | "users:manage"
  | "institutions:manage"
  | "cases:view_all"
  | "cases:view_assigned"
  | "cases:create"
  | "cases:edit"
  | "cases:assign"
  | "cases:delete"
  | "cases:restore"
  | "cases:view_confidential"
  | "cases:view_internal_remarks"
  | "cases:add_status"
  | "cases:upload_documents"
  | "reports:firm_wide"
  | "reports:own_cases"
  | "activity_logs:view"
  | "settings:manage"
  | "monitoring:view";

export interface PermissionMatrix {
  admin: Permission[];
  advocate: Permission[];
  associate: Permission[];
  viewer: Permission[];
}

export interface SystemSettingsConfig {
  associateCanCreateCase: boolean;
  inactivityTimeoutMinutes: number;
  twoFactorAuthEnabled: boolean;
  viewerRoleEnabled: boolean;
  maxUploadSizeMb: number;
}

export const DEFAULT_SETTINGS: SystemSettingsConfig = {
  associateCanCreateCase: false, // Default: off per client rules
  inactivityTimeoutMinutes: 30,  // Default: 30 minutes
  twoFactorAuthEnabled: false,   // Scaffold, off by default
  viewerRoleEnabled: false,      // Disabled by default
  maxUploadSizeMb: 10,           // Max 10MB per document
};

export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  admin: [
    "users:manage",
    "institutions:manage",
    "cases:view_all",
    "cases:view_assigned",
    "cases:create",
    "cases:edit",
    "cases:assign",
    "cases:delete",
    "cases:restore",
    "cases:view_confidential",
    "cases:view_internal_remarks",
    "cases:add_status",
    "cases:upload_documents",
    "reports:firm_wide",
    "reports:own_cases",
    "activity_logs:view",
    "settings:manage",
    "monitoring:view",
  ],
  advocate: [
    "cases:view_assigned",
    "cases:edit",
    "cases:view_internal_remarks",
    "cases:add_status",
    "cases:upload_documents",
    "reports:own_cases",
  ],
  associate: [
    "cases:view_assigned",
    "cases:add_status",
    "cases:upload_documents",
  ],
  viewer: [
    "cases:view_assigned",
    "reports:own_cases",
  ],
};

/**
 * Checks whether a given role has the specified permission, considering dynamic flags.
 */
export function hasPermission(
  role: Role,
  permission: Permission,
  settings: Partial<SystemSettingsConfig> = {}
): boolean {
  if (role === "admin") return true;

  // Check dynamic flag for associate case creation / editing
  if (role === "associate") {
    const canCreate = settings.associateCanCreateCase ?? DEFAULT_SETTINGS.associateCanCreateCase;
    if (permission === "cases:create" || permission === "cases:edit") {
      return canCreate;
    }
  }

  const rolePermissions = DEFAULT_PERMISSION_MATRIX[role] || [];
  return rolePermissions.includes(permission);
}
