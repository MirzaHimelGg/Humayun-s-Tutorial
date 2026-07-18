import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল আপলোড করা হয়নি।" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Clean extension and generate unique filename
    const origExt = file.name.split(".").pop() || "png";
    const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(origExt.toLowerCase()) 
      ? origExt.toLowerCase() 
      : "png";

    const filename = `avatar-${user.id}-${Date.now()}.${cleanExt}`;
    const filePath = join(uploadDir, filename);

    // Write file locally
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;

    // Save database record
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: fileUrl }
    });

    return NextResponse.json({
      success: true,
      message: "প্রোফাইল ছবি সফলভাবে আপলোড করা হয়েছে।",
      avatar: fileUrl
    });
  } catch (error) {
    console.error("Profile upload error:", error);
    return NextResponse.json(
      { error: "ছবি আপলোড করার সময় কোনো সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
