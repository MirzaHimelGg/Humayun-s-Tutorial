import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/admin/users — list all users with optional filters
export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";

    const users = await prisma.user.findMany({
      where: {
        AND: [
          role ? { role } : {},
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                  { phone: { contains: search } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        className: true,
        institution: true,
        status: true,
        teacherStatus: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            coursesLed: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "ব্যবহারকারীর তালিকা লোড করতে সমস্যা।" }, { status: 500 });
  }
}

// PATCH /api/admin/users — update a user's role or status
export async function PATCH(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
    }

    const { userId, role, status } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "ব্যবহারকারীর আইডি প্রয়োজন।" }, { status: 400 });
    }

    const updateData: { role?: string; status?: string } = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
