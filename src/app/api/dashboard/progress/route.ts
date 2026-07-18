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

    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "কোর্স আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: parseInt(courseId)
      }
    });

    if (!enrollment && user.role !== "ADMIN" && user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "আপনি এই কোর্সে ভর্তি নন।" },
        { status: 403 }
      );
    }

    // Get course details, chapters and lessons
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "কোর্সটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Get completed lesson progress for this student
    // If request has studentId parameter, let Admin or Teacher see that student's progress
    let targetStudentId = user.id;
    const targetStudentIdParam = url.searchParams.get("studentId");
    if (targetStudentIdParam && (user.role === "ADMIN" || user.role === "TEACHER")) {
      targetStudentId = parseInt(targetStudentIdParam);
    }

    const progressList = await prisma.lessonProgress.findMany({
      where: { studentId: targetStudentId },
      select: { lessonId: true }
    });

    const completedLessonIds = new Set(progressList.map((p) => p.lessonId));

    let totalLessonsCount = 0;
    let completedLessonsCount = 0;

    const chaptersWithProgress = course.chapters.map((chapter) => {
      const lessonsWithProgress = chapter.lessons.map((lesson) => {
        const completed = completedLessonIds.has(lesson.id);
        totalLessonsCount++;
        if (completed) {
          completedLessonsCount++;
        }
        return {
          ...lesson,
          completed
        };
      });

      return {
        ...chapter,
        lessons: lessonsWithProgress
      };
    });

    // Get student details if viewed by teacher/admin
    let studentDetails = null;
    if (targetStudentId !== user.id) {
      studentDetails = await prisma.user.findUnique({
        where: { id: targetStudentId },
        select: { name: true, email: true, phone: true }
      });
    }

    const progressPercent = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0;

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        chapters: chaptersWithProgress
      },
      completedCount: completedLessonsCount,
      totalCount: totalLessonsCount,
      progressPercent,
      studentDetails
    });
  } catch (error) {
    console.error("Dashboard course progress error:", error);
    return NextResponse.json(
      { error: "কোর্স অগ্রগতি লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
