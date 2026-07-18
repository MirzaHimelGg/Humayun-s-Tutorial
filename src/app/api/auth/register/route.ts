import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, className, institution } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "সবগুলো ফিল্ড পূরণ করা আবশ্যক।" },
        { status: 400 }
      );
    }

    // Check if email or phone already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: "এই ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "STUDENT",
        className,
        institution,
        status: "active",
      },
    });

    // Simulate OTP sending
    console.log(`[SMS OTP] Verification code 123456 sent to ${phone}`);

    return NextResponse.json({
      success: true,
      message: "নিবন্ধন সফল হয়েছে। ওটিপি (OTP) কোড পাঠানো হয়েছে।",
      phone: user.phone,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "নিবন্ধন করার সময় কোনো একটি সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
