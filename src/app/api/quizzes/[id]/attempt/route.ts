import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র ছাত্ররা কুইজ দিতে পারবে।" },
        { status: 401 }
      );
    }

    const { answers } = await req.json(); // Map of { questionId: selectedIndex }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "উত্তরপত্র প্রদান করুন।" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "কুইজটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Evaluate answers
    let score = 0;
    let totalMarks = 0;
    const results = [];

    for (const question of quiz.questions) {
      totalMarks += question.marks;
      const selectedIndex = answers[question.id];
      const isCorrect = selectedIndex !== undefined && selectedIndex === question.correctOption;

      if (isCorrect) {
        score += question.marks;
      }

      results.push({
        questionId: question.id,
        text: question.text,
        options: JSON.parse(question.optionsJson),
        correctOption: question.correctOption,
        selectedOption: selectedIndex !== undefined ? selectedIndex : null,
        isCorrect,
        explanation: question.explanation,
      });
    }

    // Save QuizAttempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: user.id,
        quizId,
        score,
        answersJson: JSON.stringify(answers),
      }
    });

    return NextResponse.json({
      success: true,
      score,
      totalMarks,
      attemptId: attempt.id,
      results,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { error: "কুইজ সাবমিট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
