import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন দেখতে পারবেন।" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // "PENDING", "PUBLISHED", etc.

    let whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        teacher: { select: { name: true, institution: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Admin fetch courses error:", error);
    return NextResponse.json(
      { error: "কোর্স তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
