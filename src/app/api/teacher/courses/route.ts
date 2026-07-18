import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/teacher/courses — List all courses for the logged-in teacher
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস।" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: user.id },
      include: {
        enrollments: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Teacher courses list error:", error);
    return NextResponse.json({ error: "কোর্স তালিকা লোড করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
