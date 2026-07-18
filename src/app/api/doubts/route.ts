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

    let doubts = [];

    if (user.role === "STUDENT") {
      doubts = await prisma.doubt.findMany({
        where: { studentId: user.id },
        include: {
          lesson: {
            select: { title: true, chapter: { select: { course: { select: { title: true } } } } }
          },
          answers: {
            include: {
              answeredBy: { select: { name: true, role: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (user.role === "TEACHER") {
      doubts = await prisma.doubt.findMany({
        where: {
          lesson: {
            chapter: {
              course: {
                teacherId: user.id
              }
            }
          }
        },
        include: {
          student: { select: { name: true, className: true } },
          lesson: {
            select: { title: true, chapter: { select: { course: { select: { title: true } } } } }
          },
          answers: {
            include: {
              answeredBy: { select: { name: true, role: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      // ADMIN
      doubts = await prisma.doubt.findMany({
        include: {
          student: { select: { name: true, className: true } },
          lesson: {
            select: { title: true, chapter: { select: { course: { select: { title: true } } } } }
          },
          answers: {
            include: {
              answeredBy: { select: { name: true, role: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json({ success: true, doubts });
  } catch (error) {
    console.error("Fetch doubts error:", error);
    return NextResponse.json(
      { error: "জিজ্ঞাসার তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র ছাত্ররা প্রশ্ন করতে পারবে।" },
        { status: 401 }
      );
    }

    const { lessonId, questionText, imageUrl } = await req.json();

    if (!lessonId || !questionText) {
      return NextResponse.json(
        { error: "প্রশ্ন এবং লেসন আইডি প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    // Verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: true }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "লেসনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: lesson.chapter.courseId,
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "এই লেসনে প্রশ্ন করার জন্য আপনাকে অবশ্যই কোর্সে ভর্তি হতে হবে।" },
        { status: 403 }
      );
    }

    const doubt = await prisma.doubt.create({
      data: {
        studentId: user.id,
        lessonId,
        questionText,
        imageUrl: imageUrl || null,
        status: "OPEN"
      }
    });

    return NextResponse.json({
      success: true,
      message: "আপনার জিজ্ঞাসাটি সফলভাবে পোস্ট করা হয়েছে। শিক্ষক শীঘ্রই উত্তর দিবেন।",
      doubt
    });
  } catch (error) {
    console.error("Create doubt error:", error);
    return NextResponse.json(
      { error: "জিজ্ঞাসা পোস্ট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
