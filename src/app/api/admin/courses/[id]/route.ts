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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন কোর্স সংশোধন করতে পারবেন।" },
        { status: 403 }
      );
    }

    const { status, price, discountPrice, title, description } = await req.json();

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: "কোর্সটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (title) updateData.title = title;
    if (description) updateData.description = description;

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
    console.error("Admin course update error:", error);
    return NextResponse.json(
      { error: "কোর্স আপডেট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন কোর্স ডিলিট করতে পারবেন।" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: "কোর্সটি সফলভাবে ডিলিট করা হয়েছে।"
    });
  } catch (error) {
    console.error("Admin course delete error:", error);
    return NextResponse.json(
      { error: "কোর্স ডিলিট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
