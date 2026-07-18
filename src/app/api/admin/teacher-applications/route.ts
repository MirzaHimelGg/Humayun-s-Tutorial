import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET — list pending teacher applications
export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
    }

    const applications = await prisma.user.findMany({
      where: { teacherStatus: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        bio: true,
        teacherStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error("Teacher applications fetch error:", error);
    return NextResponse.json({ error: "আবেদন তালিকা লোড করতে সমস্যা।" }, { status: 500 });
  }
}

// POST — approve or reject a teacher application
export async function POST(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
    }

    const { userId, action } = await req.json(); // action: "approve" | "reject"
    if (!userId || !action) {
      return NextResponse.json({ error: "userId ও action প্রয়োজন।" }, { status: 400 });
    }

    if (action === "approve") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: "TEACHER",
          teacherStatus: "APPROVED",
        },
      });
      return NextResponse.json({ success: true, message: "শিক্ষক হিসেবে অনুমোদন দেওয়া হয়েছে।" });
    }

    if (action === "reject") {
      await prisma.user.update({
        where: { id: userId },
        data: { teacherStatus: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "আবেদন প্রত্যাখ্যান করা হয়েছে।" });
    }

    return NextResponse.json({ error: "অবৈধ action।" }, { status: 400 });
  } catch (error) {
    console.error("Teacher application action error:", error);
    return NextResponse.json({ error: "অ্যাকশন সম্পন্ন করতে সমস্যা।" }, { status: 500 });
  }
}
