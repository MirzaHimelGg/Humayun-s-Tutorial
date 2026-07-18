import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন করতে পারবেন।" },
        { status: 403 }
      );
    }

    const { enrollmentId } = await req.json();
    if (!enrollmentId) {
      return NextResponse.json(
        { error: "এনরোলমেন্ট আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    const updated = await prisma.enrollment.update({
      where: { id: Number(enrollmentId) },
      data: { deviceId: null }
    });

    return NextResponse.json({ success: true, message: "ডিভাইস লক সফলভাবে রিসেট করা হয়েছে।" });
  } catch (error: any) {
    console.error("Admin reset device lock error:", error);
    return NextResponse.json(
      { error: "ডিভাইস লক রিসেট করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
