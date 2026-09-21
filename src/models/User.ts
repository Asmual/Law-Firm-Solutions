import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "admin" | "advocate" | "associate";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: UserRole;
  chamberDesignation: string;
  barEnrollmentNo?: string;
  avatarUrl?: string;
  bio?: string;
  authProvider: "credentials" | "google";
  allowedInstitutions?: mongoose.Types.ObjectId[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "advocate", "associate"],
      default: "associate",
      index: true,
    },
    chamberDesignation: { type: String, default: "Legal Practitioner" },
    barEnrollmentNo: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    allowedInstitutions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Institution",
      },
    ],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    lastActiveAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
