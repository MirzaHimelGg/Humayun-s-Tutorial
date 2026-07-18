import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);
    const user = getUserFromRequest(req);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: true
          }
        },
        liveClasses: true,
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "লেসনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const course = lesson.chapter.course;

    // Check permissions:
    // 1. If it's a free preview, anyone can access.
    // 2. Otherwise, user must be logged in.
    // 3. And user must be ADMIN, TEACHER of the course, or STUDENT enrolled in the course.
    if (!lesson.isFreePreview) {
      if (!user) {
        return NextResponse.json(
          { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
          { status: 401 }
        );
      }

      let hasAccess = false;
      if (user.role === "ADMIN" || (user.role === "TEACHER" && course.teacherId === user.id)) {
        hasAccess = true;
      } else if (user.role === "STUDENT") {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: user.id,
            courseId: course.id,
          }
        });
        if (enrollment) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "এই লেসনটি দেখার জন্য আপনাকে কোর্সে ভর্তি হতে হবে।" },
          { status: 403 }
        );
      }
    }

    // Check if student completed this lesson
    let isCompleted = false;
    if (user && user.role === "STUDENT") {
      const progress = await prisma.lessonProgress.findUnique({
        where: {
          studentId_lessonId: {
            studentId: user.id,
            lessonId,
          }
        }
      });
      if (progress) {
        isCompleted = true;
      }
    }

    return NextResponse.json({
      success: true,
      lesson,
      isCompleted
    });
  } catch (error) {
    console.error("Fetch lesson details error:", error);
    return NextResponse.json(
      { error: "লেসন লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
