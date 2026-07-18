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

    // 1. Bookstore Revenue (PAID orders)
    const ordersPaid = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { totalAmount: true }
    });
    const storeRevenue = ordersPaid.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Course Revenue (PAID payments linked to enrollment)
    const coursePayments = await prisma.payment.findMany({
      where: { status: "PAID", enrollmentId: { not: null } },
      select: { amount: true }
    });
    const courseRevenue = coursePayments.reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = storeRevenue + courseRevenue;

    const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
    const teacherCount = await prisma.user.count({ where: { role: "TEACHER" } });
    const enrollmentCount = await prisma.enrollment.count();
    const pendingApplications = await prisma.user.count({ where: { teacherStatus: "PENDING" } });
    const pendingCourses = await prisma.course.count({ where: { status: "PENDING" } });
    const totalOrders = await prisma.order.count();

    const stats = {
      totalRevenue,
      courseRevenue,
      storeRevenue,
      studentCount,
      teacherCount,
      enrollmentCount,
      pendingApplications,
      pendingCourses,
      totalOrders
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "পরিসংখ্যান লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
