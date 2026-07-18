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

    const courses = await prisma.course.findMany({
      where: { status: "PENDING" },
      include: {
        teacher: {
          select: {
            name: true,
            institution: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Admin pending courses error:", error);
    return NextResponse.json(
      { error: "কোর্সের তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
