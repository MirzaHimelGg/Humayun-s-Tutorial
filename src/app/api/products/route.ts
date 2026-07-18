import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category"); // "SSC", "HSC", "Guide"

    let whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { id: "desc" }
    });

    // Parse JSON arrays for display convenience
    const formattedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.imagesJson)
    }));

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "বইয়ের তালিকা লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন বই যোগ করতে পারেন।" },
        { status: 403 }
      );
    }

    const { title, slug, description, author, category, price, discountPrice, stockQty, type, images, digitalFileUrl } = await req.json();

    if (!title || !slug || !description || !author || !category || price === undefined || stockQty === undefined || !type) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় সব তথ্য প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "এই বইয়ের ইউআরএল (Slug) ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        author,
        category,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stockQty: parseInt(stockQty),
        type,
        imagesJson: JSON.stringify(images || ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"]),
        digitalFileUrl: type === "DIGITAL" ? (digitalFileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf") : null
      }
    });

    return NextResponse.json({
      success: true,
      message: "বইটি সফলভাবে যোগ করা হয়েছে।",
      product: {
        ...product,
        images: JSON.parse(product.imagesJson)
      }
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "বই যোগ করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
