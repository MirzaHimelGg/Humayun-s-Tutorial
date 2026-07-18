import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে শিক্ষক অ্যাকাউন্ট থেকে লগইন করুন।" },
        { status: 403 }
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

    if (course.teacherId !== user.id) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। আপনি শুধুমাত্র নিজের কোর্সে লেসন যোগ করতে পারেন।" },
        { status: 403 }
      );
    }

    const { chapterId, title, type, contentUrl, isFreePreview } = await req.json();

    if (!chapterId || !title || !type || !contentUrl) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় সব তথ্য প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    // Verify the chapter belongs to this course
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(chapterId) }
    });

    if (!chapter || chapter.courseId !== courseId) {
      return NextResponse.json(
        { error: "চ্যাপ্টারটি এই কোর্সের অন্তর্ভুক্ত নয়।" },
        { status: 400 }
      );
    }

    // Calculate lesson order
    const lastLesson = await prisma.lesson.findFirst({
      where: { chapterId: chapter.id },
      orderBy: { order: "desc" }
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        chapterId: chapter.id,
        title,
        type,
        contentUrl,
        isFreePreview: !!isFreePreview,
        order
      }
    });

    return NextResponse.json({
      success: true,
      message: "লেসনটি সফলভাবে তৈরি করা হয়েছে।",
      lesson
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { error: "লেসন তৈরি করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
