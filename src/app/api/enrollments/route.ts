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

    if (user.role === "STUDENT") {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id },
        include: {
          course: {
            include: {
              teacher: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { enrolledAt: "desc" }
      });
      return NextResponse.json({ success: true, enrollments });
    } else if (user.role === "TEACHER") {
      // Teachers view student enrollments for their courses
      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: { teacherId: user.id }
        },
        include: {
          course: true,
          student: {
            select: { name: true, email: true, phone: true }
          }
        },
        orderBy: { enrolledAt: "desc" }
      });
      return NextResponse.json({ success: true, enrollments });
    } else {
      // Admin sees everything
      const enrollments = await prisma.enrollment.findMany({
        include: {
          course: true,
          student: {
            select: { name: true, email: true, phone: true }
          }
        },
        orderBy: { enrolledAt: "desc" }
      });
      return NextResponse.json({ success: true, enrollments });
    }
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json(
      { error: "এনরোলমেন্ট তথ্য লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র ছাত্ররা কোর্সে ভর্তি হতে পারবেন।" },
        { status: 401 }
      );
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "কোর্স আইডি প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: "কোর্সটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: courseId,
      }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "আপনি ইতিমধ্যে এই কোর্সে ভর্তি হয়েছেন।",
        enrollment: existing
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: user.id,
        courseId: course.id,
        progressPercent: 0,
        status: "active"
      }
    });

    return NextResponse.json({
      success: true,
      message: "কোর্সে ভর্তি সফল হয়েছে!",
      enrollment
    });
  } catch (error) {
    console.error("Create enrollment error:", error);
    return NextResponse.json(
      { error: "কোর্সে ভর্তি হওয়ার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
