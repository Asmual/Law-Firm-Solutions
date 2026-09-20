import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: "admin" | "partner" | "advocate" | "associate" | "user";
  chamberDesignation: string;
  barEnrollmentNo?: string;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
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
      enum: ["admin", "partner", "advocate", "associate", "user"],
      default: "user",
    },
    chamberDesignation: { type: String, default: "Legal Practitioner" },
    barEnrollmentNo: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
