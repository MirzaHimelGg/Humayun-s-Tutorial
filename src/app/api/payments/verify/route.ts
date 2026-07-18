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

    const { orderId, courseId, status, txnId } = await req.json();

    if (!status || (!orderId && !courseId)) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় পেমেন্ট তথ্য প্রদান করুন।" },
        { status: 400 }
      );
    }

    const transactionId = txnId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: { include: { product: true } } }
      });

      if (!order) {
        return NextResponse.json(
          { error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      if (status === "SUCCESS") {
        // Update order and payment status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED"
          }
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            gateway: order.paymentMethod,
            gatewayTxnId: transactionId,
            amount: order.totalAmount,
            status: "PAID"
          }
        });

        // Decrement product stocks for online orders
        for (const item of order.items) {
          if (item.product.type === "PHYSICAL") {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stockQty: Math.max(0, item.product.stockQty - item.quantity) }
            });
          }
        }

        console.log(`[ONLINE PAYMENT] Payment successful for Order #${order.id}. Txn ID: ${transactionId}`);
        return NextResponse.json({
          success: true,
          message: "অর্ডারের পেমেন্ট সফলভাবে যাচাই করা হয়েছে।"
        });
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            orderStatus: "CANCELLED"
          }
        });
        return NextResponse.json({
          success: false,
          error: "পেমেন্ট ব্যর্থ হয়েছে।"
        });
      }
    }

    if (courseId) {
      if (user.role !== "STUDENT") {
        return NextResponse.json(
          { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র ছাত্ররা কোর্সে ভর্তি হতে পারবেন।" },
          { status: 403 }
        );
      }

      const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) }
      });

      if (!course) {
        return NextResponse.json(
          { error: "কোর্সটি খুঁজে পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      if (status === "SUCCESS") {
        // Create enrollment if not exists
        
        let enrollmentRecord = await prisma.enrollment.findFirst({
          where: { studentId: user.id, courseId: course.id }
        });

        if (!enrollmentRecord) {
          enrollmentRecord = await prisma.enrollment.create({
            data: {
              studentId: user.id,
              courseId: course.id,
              progressPercent: 0,
              status: "active"
            }
          });
        }

        // Log payment
        await prisma.payment.create({
          data: {
            enrollmentId: enrollmentRecord.id,
            gateway: "SSLCommerz-Sim",
            gatewayTxnId: transactionId,
            amount: course.discountPrice !== null ? course.discountPrice : course.price,
            status: "PAID"
          }
        });

        console.log(`[ONLINE PAYMENT] Payment successful for Course ${course.title} enrollment. Txn ID: ${transactionId}`);
        return NextResponse.json({
          success: true,
          message: "কোর্সের পেমেন্ট সফলভাবে যাচাই করা হয়েছে এবং এনরোলমেন্ট সম্পূর্ণ হয়েছে।"
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "পেমেন্ট ব্যর্থ হয়েছে।"
        });
      }
    }

    return NextResponse.json({ error: "অনুরোধটি সঠিক নয়।" }, { status: 400 });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "পেমেন্ট যাচাই করার সময় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
