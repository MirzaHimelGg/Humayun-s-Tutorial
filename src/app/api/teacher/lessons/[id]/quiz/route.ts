import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// POST /api/teacher/lessons/[id]/quiz — Add a quiz question to a lesson
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

    const { quizTitle, quizType, timeLimit, questions, externalUrl } = await req.json();

    if (!quizTitle) {
      return NextResponse.json(
        { error: "কুইজের শিরোনাম প্রদান করুন।" },
        { status: 400 }
      );
    }

    if (!externalUrl && (!questions || !Array.isArray(questions) || questions.length === 0)) {
      return NextResponse.json(
        { error: "কুইজের জন্য কমপক্ষে একটি প্রশ্ন অথবা এক্সটার্নাল কুইজ লিংক (Google Form) প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Create quiz for the lesson
    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title: quizTitle,
        type: quizType || "PRACTICE",
        timeLimit: timeLimit || 0,
        externalUrl: externalUrl || null,
        questions: (!externalUrl && questions && Array.isArray(questions)) ? {
          create: questions.map((q: any) => ({
            text: q.text,
            optionsJson: JSON.stringify(q.options),
            correctOption: q.correctOption,
            explanation: q.explanation || null,
            marks: q.marks || 1.0,
          }))
        } : undefined
      },
      include: { questions: true }
    });

    return NextResponse.json({
      success: true,
      message: "কুইজ সফলভাবে যোগ করা হয়েছে।",
      quiz
    });
  } catch (error) {
    console.error("Add quiz error:", error);
    return NextResponse.json(
      { error: "কুইজ যোগ করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

// GET /api/teacher/lessons/[id]/quiz — Get quizzes for a lesson
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস।" }, { status: 403 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: { questions: true }
    });

    return NextResponse.json({ success: true, quizzes });
  } catch (error) {
    return NextResponse.json({ error: "কুইজ লোড করা সম্ভব হয়নি।" }, { status: 500 });
  }
}
