import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: {
          where: { studentId: user.id },
          orderBy: { attemptedAt: "desc" }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "কুইজটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Format options from JSON string
    const formattedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      options: JSON.parse(q.optionsJson),
      marks: q.marks,
      // We still include correctOption and explanation, but in a real test we might omit it until submitted
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        timeLimit: quiz.timeLimit,
        questions: formattedQuestions,
        attempts: quiz.attempts
      }
    });
  } catch (error) {
    console.error("Fetch quiz error:", error);
    return NextResponse.json(
      { error: "কুইজের প্রশ্ন লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
