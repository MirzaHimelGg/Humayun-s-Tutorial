import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = getUserFromRequest(req);

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatar: true,
            institution: true,
          }
        },
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                liveClasses: true,
                quizzes: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    timeLimit: true,
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

    // Check if the user is enrolled in this course
    let isEnrolled = false;
    let progressPercent = 0;
    if (user && user.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          courseId: course.id,
        }
      });
      if (enrollment) {
        isEnrolled = true;
        progressPercent = enrollment.progressPercent;
      }
    } else if (user && (user.role === "ADMIN" || (user.role === "TEACHER" && course.teacherId === user.id))) {
      isEnrolled = true; // Admins and owning teachers are treated as enrolled (can view content)
    }

    return NextResponse.json({
      success: true,
      course,
      isEnrolled,
      progressPercent
    });
  } catch (error) {
    console.error("Fetch course detail error:", error);
    return NextResponse.json(
      { error: "কোর্সের তথ্য লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
