import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "সার্টিফিকেট কোড প্রদান করুন।" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        student: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true, classLevel: true }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "এই কোডের কোনো সার্টিফিকেট পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error("Certificate verify API error:", error);
    return NextResponse.json(
      { error: "সার্টিফিকেট যাচাই করার সময় সার্ভার ত্রুটি।" },
      { status: 500 }
    );
  }
}
