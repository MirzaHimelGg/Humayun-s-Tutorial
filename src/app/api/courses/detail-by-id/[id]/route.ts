import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: { name: true, avatar: true, institution: true }
        },
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                liveClasses: true,
                quizzes: {
                  include: {
                    questions: true
                  }
                }
              }
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

    // Check enrollment
    let isEnrolled = false;
    if (user.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          courseId: course.id,
        }
      });
      if (enrollment) {
        isEnrolled = true;
        
        // Device Gating
        const clientDeviceId = req.headers.get("x-device-id");
        if (!clientDeviceId) {
          return NextResponse.json(
            { error: "ডিভাইস আইডেন্টিফায়ার প্রয়োজন (Device ID is required)।" },
            { status: 400 }
          );
        }

        if (!enrollment.deviceId) {
          // Lock course to this device ID
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { deviceId: clientDeviceId }
          });
        } else if (enrollment.deviceId !== clientDeviceId) {
          return NextResponse.json(
            { error: "এই কোর্সটি অন্য একটি ডিভাইসে লক করা আছে। অনুগ্রহ করে অ্যাক্সেস পুনরুদ্ধারের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।" },
            { status: 403 }
          );
        }
      }
    } else if (user.role === "ADMIN" || (user.role === "TEACHER" && course.teacherId === user.id)) {
      isEnrolled = true;
    }

    if (!isEnrolled) {
      return NextResponse.json(
        { error: "এই কোর্সে আপনার কোনো সাবস্ক্রিপশন নেই।" },
        { status: 403 }
      );
    }

    // Get list of completed lesson IDs for this student
    const progress = await prisma.lessonProgress.findMany({
      where: { studentId: user.id },
      select: { lessonId: true }
    });
    const completedLessonIds = progress.map((p) => p.lessonId);

    return NextResponse.json({
      success: true,
      course,
      completedLessonIds
    });
  } catch (error) {
    console.error("Fetch course by ID error:", error);
    return NextResponse.json(
      { error: "কোর্সের সিলেবাস লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
