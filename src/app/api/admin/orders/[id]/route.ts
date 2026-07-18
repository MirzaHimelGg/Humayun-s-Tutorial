import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const user = getUserFromRequest(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন অর্ডারের তথ্য পরিবর্তন করতে পারবেন।" },
        { status: 403 }
      );
    }

    const { orderStatus, paymentStatus } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "অর্ডার আপডেট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
