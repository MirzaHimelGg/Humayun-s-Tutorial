import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// POST /api/teacher/lessons/[id]/schedule — Add or update live class schedule for a lesson
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস।" },
        { status: 403 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } }
    });

    if (!lesson || lesson.chapter.course.teacherId !== user.id) {
      return NextResponse.json(
        { error: "লেসনটি পাওয়া যায়নি অথবা আপনার অ্যাক্সেস নেই।" },
        { status: 404 }
      );
    }

    if (lesson.type !== "LIVE") {
      return NextResponse.json(
        { error: "শুধুমাত্র লাইভ টাইপ লেসনের জন্য শিডিউল যোগ করা যাবে।" },
        { status: 400 }
      );
    }

    const { startTime, endTime, joinUrl, recordingUrl } = await req.json();

    if (!startTime || !endTime || !joinUrl) {
      return NextResponse.json(
        { error: "শুরুর সময়, শেষের সময় এবং জয়েন লিংক প্রদান করুন।" },
        { status: 400 }
      );
    }

    const schedule = await prisma.liveClassSchedule.create({
      data: {
        lessonId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        joinUrl,
        recordingUrl: recordingUrl || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: "লাইভ ক্লাস শিডিউল সফলভাবে যোগ করা হয়েছে।",
      schedule
    });
  } catch (error) {
    console.error("Add schedule error:", error);
    return NextResponse.json(
      { error: "শিডিউল যোগ করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
