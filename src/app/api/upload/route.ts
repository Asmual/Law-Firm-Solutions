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

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    const isImage = file.type.startsWith("image/");
    const isDocument = allowedTypes.includes(file.type) || file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc");

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { success: false, error: "File must be a PDF, DOC, DOCX, spreadsheet, or image." },
        { status: 400 }
      );
    }

    // 15MB limit for legal documents and evidence
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let secureUrl = "";
    let publicId = "";

    try {
      const uploadOptions: Record<string, unknown> = {
        folder: isImage ? "law-firm-solutions/avatars" : "law-firm-solutions/documents",
        resource_type: isImage ? "image" : "auto",
      };

      if (isImage) {
        uploadOptions.transformation = [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ];
      }

      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
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
      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (cloudinaryErr) {
      console.warn("Cloudinary direct upload failed, fallback to base64 data url:", cloudinaryErr);
      const base64Data = buffer.toString("base64");
      secureUrl = `data:${file.type || "application/pdf"};base64,${base64Data}`;
      publicId = `local_${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      url: secureUrl,
      publicId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
