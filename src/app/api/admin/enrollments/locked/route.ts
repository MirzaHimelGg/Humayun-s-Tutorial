import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস।" },
        { status: 403 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { deviceId: { not: null } },
      include: {
        student: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { enrolledAt: "desc" }
    });

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error("Admin locked enrollments error:", error);
    return NextResponse.json(
      { error: "লকড এনরোলমেন্ট তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
