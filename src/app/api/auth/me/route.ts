import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const tokenUser = getUserFromRequest(req);
    if (!tokenUser) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        className: true,
        institution: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tokenUser = getUserFromRequest(req);
    if (!tokenUser) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, phone, password, className, institution, bio, avatar } = body;

    // Check unique constraints for email and phone if they are changing
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenUser.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    
    if (email !== undefined && email !== currentUser.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "এই ইমেইলটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহার করা হয়েছে।" },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (phone !== undefined && phone !== currentUser.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: "এই ফোন নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহার করা হয়েছে।" },
          { status: 400 }
        );
      }
      updateData.phone = phone;
    }

    if (password) {
      const { hashPassword } = await import("@/lib/auth");
      updateData.passwordHash = hashPassword(password);
    }

    if (className !== undefined) updateData.className = className;
    if (institution !== undefined) updateData.institution = institution;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        className: true,
        institution: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "প্রোফাইল আপডেট করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

