import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/teacher/courses/[id]/details — Full course data for the teacher's course builder
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস।" }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        enrollments: { select: { id: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "কোর্সটি খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    }

    if (course.teacherId !== user.id) {
      return NextResponse.json({ error: "আপনার এই কোর্সে অ্যাক্সেস নেই।" }, { status: 403 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Teacher course details error:", error);
    return NextResponse.json({ error: "কোর্স লোড করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
