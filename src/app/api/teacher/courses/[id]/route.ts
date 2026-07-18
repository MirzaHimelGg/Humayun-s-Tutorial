import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
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
        { error: "অননুমোদিত অ্যাক্সেস। আপনি শুধুমাত্র নিজের কোর্সের তথ্য সংশোধন করতে পারেন।" },
        { status: 403 }
      );
    }

    const { promoVideoUrl, title, description, price, discountPrice, status } = await req.json();

    const updateData: any = {};
    if (promoVideoUrl !== undefined) updateData.promoVideoUrl = promoVideoUrl || null;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    // Allow teacher to submit for review (DRAFT → PENDING only)
    if (status === "PENDING" && course.status === "DRAFT") updateData.status = "PENDING";

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "কোর্সের তথ্য সফলভাবে আপডেট করা হয়েছে।",
      course: updatedCourse
    });
  } catch (error) {
    console.error("Teacher course update error:", error);
    return NextResponse.json(
      { error: "কোর্স আপডেট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
