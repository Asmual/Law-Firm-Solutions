import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLogModel, ActivityAction } from "@/models/ActivityLog";
import { SessionPayload } from "@/lib/auth";

export interface LogActivityParams {
  user?: SessionPayload | null;
  action: ActivityAction;
  entityType: "case" | "institution" | "user" | "auth" | "setting" | "report";
  entityId?: string;
  entityTitle?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

/**
 * Persists an auditable activity log event into MongoDB.
 * Never throws an unhandled error so it does not block the primary operation.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectToDatabase();
    await ActivityLogModel.create({
      userId: params.user?.userId || undefined,
      userName: params.user?.name || "System",
      userEmail: params.user?.email || "system@chamber.local",
      userRole: params.user?.role || "system",
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      description: params.description,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      beforeState: params.beforeState,
      afterState: params.afterState,
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
  }
}
