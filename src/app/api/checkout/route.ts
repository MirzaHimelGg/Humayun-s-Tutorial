import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const { items, paymentMethod, shippingName, shippingPhone, shippingAddr, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "কার্ট খালি। অর্ডার করতে কমপক্ষে একটি আইটেম যোগ করুন।" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !shippingName || !shippingPhone || !shippingAddr) {
      return NextResponse.json(
        { error: "দয়া করে ডেলিভারি ও পেমেন্ট সংক্রান্ত সকল তথ্য প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Validate products and check stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: "কোনো একটি প্রোডাক্ট খুঁজে পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `দুঃখিত, '${product.title}' এর পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product.stockQty}` },
          { status: 400 }
        );
      }

      const activePrice = product.discountPrice !== null ? product.discountPrice : product.price;
      subtotal += activePrice * item.quantity;

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: activePrice,
        product,
      });
    }

    // Apply Coupon if present
    let totalAmount = subtotal;
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if (coupon) {
        const now = new Date();
        if (coupon.expiryDate > now && coupon.usageLimit > 0) {
          if (coupon.discountType === "PERCENTAGE") {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
          } else if (coupon.discountType === "FIXED") {
            couponDiscount = coupon.discountValue;
          }
          totalAmount = Math.max(0, subtotal - couponDiscount);
          
          // Decrement coupon limit
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageLimit: coupon.usageLimit - 1 }
          });
        }
      }
    }

    // Create Order
    // Set payment status based on payment method
    const paymentStatus = paymentMethod === "COD" ? "PENDING" : "PENDING";
    const orderStatus = paymentMethod === "COD" ? "PENDING" : "PENDING";

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        paymentMethod,
        paymentStatus,
        orderStatus,
        shippingName,
        shippingPhone,
        shippingAddr,
        couponCode: couponCode || null,
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        }
      },
      include: {
        items: true
      }
    });

    // If COD, decrement stock immediately. For online payment, we decrement stock after payment succeeds.
    if (paymentMethod === "COD") {
      for (const item of validatedItems) {
        if (item.product.type === "PHYSICAL") {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQty: item.product.stockQty - item.quantity }
          });
        }
      }
    }

    // Return order details. If online payment, return simulated payment url
    const isOnlinePayment = paymentMethod !== "COD";
    const paymentUrl = isOnlinePayment ? `/checkout/payment-simulator?orderId=${order.id}` : null;

    return NextResponse.json({
      success: true,
      message: paymentMethod === "COD" ? "অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!" : "পেমেন্ট সম্পন্ন করার জন্য গেটওয়েতে রিডাইরেক্ট করা হচ্ছে।",
      order,
      paymentUrl,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "চেকআউট সম্পন্ন করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
