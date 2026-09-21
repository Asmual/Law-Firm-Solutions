import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "@/lib/auth";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "dkdzglho1",
  api_key: process.env.CLOUDINARY_API_KEY || "696346492797251",
  api_secret: process.env.CLOUDINARY_API_SECRET || "ddnHZwxPXJtNlXY9c5BiXUK_Y8I",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image (JPEG, PNG, WebP, etc.)." },
        { status: 400 }
      );
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image size must be less than 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "law-firm-solutions/avatars",
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
