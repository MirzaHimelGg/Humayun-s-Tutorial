import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "ফোন নম্বর এবং ওটিপি (OTP) কোড প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Verify OTP code (mocking fixed code 123456)
    if (otp !== "123456") {
      return NextResponse.json(
        { error: "ভুল ওটিপি (OTP) কোড। আবার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ফোন নম্বরের কোনো অ্যাকাউন্ট পাওয়া যায়নি।" },
        { status: 404 }
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
      message: "ওটিপি যাচাই সফল হয়েছে এবং আপনি লগইন হয়েছেন।",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        className: user.className,
        institution: user.institution,
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
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "ওটিপি কোড যাচাই করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
