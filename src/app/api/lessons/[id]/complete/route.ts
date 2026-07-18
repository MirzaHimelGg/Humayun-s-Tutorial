import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে ছাত্র অ্যাকাউন্ট থেকে লগইন করুন।" },
        { status: 401 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: true
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

    const courseId = lesson.chapter.courseId;

    // Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId,
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "আপনাকে অবশ্যই এই কোর্সে ভর্তি হতে হবে।" },
        { status: 403 }
      );
    }

    // Mark as completed in LessonProgress (ignore duplicate errors)
    await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId,
        }
      },
      create: {
        studentId: user.id,
        lessonId,
      },
      update: {},
    });

    // Re-calculate progress percentage
    // Find all lesson ids in this course
    const allLessons = await prisma.lesson.findMany({
      where: {
        chapter: {
          courseId
        }
      },
      select: { id: true }
    });

    const totalLessons = allLessons.length;
    const lessonIds = allLessons.map((l) => l.id);

    // Count how many of these lessons are completed by this student
    const completedCount = await prisma.lessonProgress.count({
      where: {
        studentId: user.id,
        lessonId: { in: lessonIds }
      }
    });

    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    // Update enrollment progress
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        status: progressPercent >= 100 ? "completed" : "active"
      }
    });

    // Certificate generation if completed (100% progress)
    let certificate = null;
    if (progressPercent >= 100) {
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findFirst({
        where: {
          studentId: user.id,
          courseId
        }
      });

      if (!existingCert) {
        // Generate random unique verification code
        const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCode = `CERT-${courseId}-${user.id}-${randomHex}`;

        certificate = await prisma.certificate.create({
          data: {
            studentId: user.id,
            courseId,
            verificationCode,
          }
        });
        console.log(`[CERTIFICATE] Certificate issued: ${verificationCode} to student ${user.name}`);
      } else {
        certificate = existingCert;
      }
    }

    return NextResponse.json({
      success: true,
      progressPercent,
      completedCount,
      totalLessons,
      isCompletedNow: progressPercent >= 100,
      certificate,
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    return NextResponse.json(
      { error: "লেসন সম্পন্ন করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
