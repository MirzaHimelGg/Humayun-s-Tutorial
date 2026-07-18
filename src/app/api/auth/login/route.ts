import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json(); // identifier can be email or phone

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।" },
        { status: 401 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।" },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।" },
        { status: 401 }
      );
    }

    // Sign token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে।",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        className: user.className,
        institution: user.institution,
        avatar: user.avatar,
      },
      token,
    });

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "লগইন করার সময় কোনো একটি সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
