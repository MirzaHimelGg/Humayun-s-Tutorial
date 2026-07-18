import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const certificates = await prisma.certificate.findMany({
      where: { studentId: user.id },
      include: {
        course: {
          select: { title: true, classLevel: true, subject: true },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json(
      { error: "সার্টিফিকেট লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
