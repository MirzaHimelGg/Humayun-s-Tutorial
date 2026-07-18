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
        { error: "অননুমোদিত অ্যাক্সেস। আপনি শুধুমাত্র নিজের কোর্সে চ্যাপ্টার যোগ করতে পারেন।" },
        { status: 403 }
      );
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "চ্যাপ্টারের নাম প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    // Find the highest order currently
    const lastChapter = await prisma.chapter.findFirst({
      where: { courseId },
      orderBy: { order: "desc" }
    });
    const order = lastChapter ? lastChapter.order + 1 : 1;

    const chapter = await prisma.chapter.create({
      data: {
        courseId,
        title,
        order
      }
    });

    return NextResponse.json({
      success: true,
      message: "চ্যাপ্টার সফলভাবে তৈরি করা হয়েছে।",
      chapter
    });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      { error: "চ্যাপ্টার তৈরি করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
