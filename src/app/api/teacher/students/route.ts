import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const teacher = getUserFromRequest(req);
    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
    }

    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    // Find all courses by this teacher
    const whereClause = courseId
      ? { course: { teacherId: teacher.id, id: parseInt(courseId) } }
      : { course: { teacherId: teacher.id } };

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, name: true, email: true, phone: true, className: true, institution: true },
        },
        course: {
          select: {
            id: true,
            title: true,
            classLevel: true,
            _count: { select: { chapters: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Get lesson progress details for each enrollment
    const enriched = await Promise.all(
      enrollments.map(async (en) => {
        const lessonProgress = await prisma.lessonProgress.findMany({
          where: { 
            studentId: en.student.id,
            lesson: {
              chapter: {
                courseId: en.course.id
              }
            }
          },
          select: { lessonId: true },
        });

        const totalLessons = await prisma.lesson.count({
          where: { chapter: { courseId: en.courseId } },
        });

        return {
          enrollmentId: en.id,
          student: en.student,
          course: en.course,
          progressPercent: en.progressPercent,
          completedLessons: lessonProgress.length,
          totalLessons,
          enrolledAt: en.enrolledAt,
          status: en.status,
        };
      })
    );

    // Get teacher's courses for the filter dropdown
    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, title: true, classLevel: true },
    });

    return NextResponse.json({ success: true, enrollments: enriched, courses });
  } catch (error) {
    console.error("Teacher students fetch error:", error);
    return NextResponse.json({ error: "শিক্ষার্থীর তথ্য লোড করতে সমস্যা।" }, { status: 500 });
  }
}
