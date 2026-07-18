import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন এই তথ্য দেখতে পারবেন।" },
        { status: 403 }
      );
    }

    // 1. Total revenue from orders
    const ordersPaid = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { totalAmount: true }
    });
    const bookstoreRevenue = ordersPaid.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Total revenue from course payments
    const coursePayments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        enrollmentId: { not: null }
      },
      select: { amount: true }
    });
    const courseRevenue = coursePayments.reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = bookstoreRevenue + courseRevenue;

    // 3. User counts
    const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
    const teacherCount = await prisma.user.count({ where: { role: "TEACHER" } });

    // 4. Course counts
    const publishedCourses = await prisma.course.count({ where: { status: "PUBLISHED" } });
    const pendingCourses = await prisma.course.count({ where: { status: "PENDING" } });

    // 5. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } }
      }
    });

    // 6. Recent courses
    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        totalRevenue,
        bookstoreRevenue,
        courseRevenue,
        studentCount,
        teacherCount,
        publishedCourses,
        pendingCourses,
        recentOrders,
        recentEnrollments
      }
    });
  } catch (error) {
    console.error("Fetch sales reports error:", error);
    return NextResponse.json(
      { error: "রিপোর্ট ও অ্যানালিটিক্স লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
