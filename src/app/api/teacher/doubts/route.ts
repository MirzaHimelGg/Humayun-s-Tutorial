import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/teacher/doubts — List open (unanswered) doubts for teacher's courses
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস।" }, { status: 403 });
    }

    const doubts = await prisma.doubt.findMany({
      where: {
        status: "OPEN",
        lesson: {
          chapter: {
            course: { teacherId: user.id },
          },
        },
      },
      include: {
        student: { select: { name: true } },
        lesson: {
          select: {
            title: true,
            chapter: { select: { course: { select: { title: true } } } },
          },
        },
        answers: {
          include: { answeredBy: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, doubts });
  } catch (error) {
    console.error("Teacher doubts error:", error);
    return NextResponse.json({ error: "জিজ্ঞাসা লোড করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
