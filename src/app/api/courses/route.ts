import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const classLevel = url.searchParams.get("classLevel"); // "SSC", "HSC"
    const paper = url.searchParams.get("paper"); // "1st", "2nd"
    const subject = url.searchParams.get("subject") || "Bangla";

    const user = getUserFromRequest(req);

    // Build filter
    let whereClause: any = { subject };

    // Standard public filter is only published
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      whereClause.status = "PUBLISHED";
    } else if (user.role === "TEACHER") {
      // Teachers can see published courses, or their own draft/pending ones
      whereClause.OR = [
        { status: "PUBLISHED" },
        { teacherId: user.id }
      ];
    }

    if (classLevel) {
      whereClause.classLevel = classLevel;
    }
    if (paper) {
      whereClause.paper = paper;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatar: true,
            institution: true,
          }
        },
        chapters: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                isFreePreview: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { error: "কোর্স তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র শিক্ষকেরা কোর্স তৈরি করতে পারবেন।" },
        { status: 403 }
      );
    }

    // Verify user exists in DB to prevent foreign key errors (e.g. after database reseed)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "ব্যবহারকারী সেশনটি সচল নয়। অনুগ্রহ করে পুনরায় লগইন করুন।" },
        { status: 401 }
      );
    }

    const { title, slug, description, classLevel, paper, type, price, discountPrice, thumbnail } = await req.json();

    if (!title || !slug || !description || !classLevel || !paper || !type || price === undefined) {
      return NextResponse.json(
        { error: "দয়া করে প্রয়োজনীয় সব তথ্য প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "এই কোর্স ইউআরএল (Slug) ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    // Create course (default status is PENDING for teachers, PUBLISHED for admin)
    const status = user.role === "ADMIN" ? "PUBLISHED" : "PENDING";
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        classLevel,
        subject: "Bangla",
        paper,
        type,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        teacherId: user.role === "TEACHER" ? user.id : user.id, // defaults to creating user
        status,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500",
      }
    });

    return NextResponse.json({
      success: true,
      message: user.role === "ADMIN" ? "কোর্সটি সফলভাবে তৈরি ও প্রকাশিত হয়েছে।" : "কোর্সটি সফলভাবে তৈরি হয়েছে এবং অনুমোদনের জন্য অপেক্ষমাণ রয়েছে।",
      course
    });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: "কোর্স তৈরি করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
