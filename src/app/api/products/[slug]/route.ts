import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return NextResponse.json(
        { error: "বইটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const formattedProduct = {
      ...product,
      images: JSON.parse(product.imagesJson)
    };

    return NextResponse.json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    console.error("Fetch product detail error:", error);
    return NextResponse.json(
      { error: "বইয়ের তথ্য লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
