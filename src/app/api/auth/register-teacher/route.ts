import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, institution, bio, subject } = await req.json();

    if (!name || !email || !phone || !password || !institution || !bio) {
      return NextResponse.json(
        { error: "সবগুলো ফিল্ড পূরণ করা আবশ্যক।" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: "এই ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Create as STUDENT role with PENDING teacherStatus — admin will upgrade to TEACHER
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "STUDENT",
        institution,
        bio: `[${subject || "বাংলা"}] ${bio}`,
        teacherStatus: "PENDING",
        status: "active",
      },
    });

    console.log(`[TEACHER APPLICATION] New application from ${name} (${email}) — awaiting admin approval`);

    return NextResponse.json({
      success: true,
      message: "শিক্ষক আবেদন সফলভাবে জমা হয়েছে। অ্যাডমিন অনুমোদনের পর সক্রিয় হবে।",
    });
  } catch (error) {
    console.error("Teacher registration error:", error);
    return NextResponse.json(
      { error: "আবেদন জমা দেওয়ার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
