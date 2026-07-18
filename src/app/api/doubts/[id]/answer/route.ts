import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doubtId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র শিক্ষক ও অ্যাডমিন উত্তর দিতে পারবেন।" },
        { status: 403 }
      );
    }

    const { answerText } = await req.json();

    if (!answerText) {
      return NextResponse.json(
        { error: "উত্তরপত্র ফাঁকা হতে পারবে না।" },
        { status: 400 }
      );
    }

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!doubt) {
      return NextResponse.json(
        { error: "জিজ্ঞাসাটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Verify teacher owns the course of this doubt
    if (user.role === "TEACHER" && doubt.lesson.chapter.course.teacherId !== user.id) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। আপনি শুধুমাত্র আপনার নিজের কোর্সের জিজ্ঞাসাগুলোর উত্তর দিতে পারবেন।" },
        { status: 403 }
      );
    }

    // Transaction to create reply and update parent status
    const result = await prisma.$transaction(async (tx) => {
      const answer = await tx.doubtAnswer.create({
        data: {
          doubtId,
          answeredById: user.id,
          answerText,
        }
      });

      await tx.doubt.update({
        where: { id: doubtId },
        data: { status: "ANSWERED" }
      });

      return answer;
    });

    return NextResponse.json({
      success: true,
      message: "উত্তরটি সফলভাবে পোস্ট করা হয়েছে।",
      answer: result
    });
  } catch (error) {
    console.error("Doubt answer error:", error);
    return NextResponse.json(
      { error: "উত্তর পোস্ট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
