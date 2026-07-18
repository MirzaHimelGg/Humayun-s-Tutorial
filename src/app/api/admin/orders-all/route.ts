import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস।" },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin all orders error:", error);
    return NextResponse.json(
      { error: "অর্ডারের তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
