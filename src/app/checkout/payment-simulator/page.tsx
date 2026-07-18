"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const courseId = searchParams.get("courseId");
  const coupon = searchParams.get("coupon") || "";

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadDetails() {
      try {
        if (orderId) {
          // Fetch order details via a simple api or details endpoint
          // Since we don't have a direct single-order API, let's query standard endpoint or simulate details
          setDetails({
            title: `অর্ডার নং: #${orderId}`,
            amount: 0, // Will compute or show placeholder
            type: "order"
          });
        } else if (courseId) {
          const coursesRes = await fetch(`/api/courses`);
          const coursesData = await coursesRes.json();
          if (coursesData.success) {
            const course = coursesData.courses.find((c: any) => c.id === parseInt(courseId));
            if (course) {
              const basePrice = course.discountPrice || course.price;
              const finalPrice = coupon.toUpperCase() === "BANGLA20" 
                ? basePrice * 0.8 
                : coupon.toUpperCase() === "FLAT100" 
                  ? Math.max(0, basePrice - 100) 
                  : basePrice;
              setDetails({
                title: course.title,
                amount: finalPrice,
                type: "course"
              });
            }
          }
        }
      } catch (err) {
        setError("পেমেন্ট তথ্য লোড করা সম্ভব হয়নি।");
      }
    }
    loadDetails();
  }, [orderId, courseId, coupon]);

  const handlePayment = async (status: "SUCCESS" | "FAILED") => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId ? parseInt(orderId) : null,
          courseId: courseId ? parseInt(courseId) : null,
          status,
          txnId: `TXN-SIM-${Math.floor(100000 + Math.random() * 900000)}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!");
        // Redirect to dashboard after a short delay so user sees the success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(data.error || "পেমেন্ট ব্যর্থ হয়েছে।");
        setTimeout(() => {
          router.push("/store");
        }, 2000);
      }
    } catch (err) {
      setError("পেমেন্ট যাচাইয়ের সময় নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem", textAlign: "center" }}>
        {/* Mock SSLCommerz branding header */}
        <div style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", padding: "1rem", borderRadius: "var(--radius-md)", color: "#fff", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#fff" }}>SSLCommerz Sandbox Gateway</h2>
          <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)", marginTop: "0.25rem" }}>নিরাপদ পেমেন্ট গেটওয়ে সিমুলেটর</p>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            ✅ {successMsg} — ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "1rem", color: "var(--text-secondary)", display: "block" }}>পেমেন্ট বিবরণী</span>
          <h3 style={{ fontSize: "1.25rem", margin: "0.5rem 0" }}>{details ? details.title : "লোড হচ্ছে..."}</h3>
          
          {details && details.amount > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>প্রদেয় অর্থ</span>
              <h2 style={{ fontSize: "2.25rem", color: "var(--accent)", fontWeight: "800" }}>৳{details.amount}</h2>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button 
            onClick={() => handlePayment("SUCCESS")} 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.875rem", backgroundColor: "var(--success)", borderColor: "var(--success)" }}
            disabled={loading}
          >
            {loading ? "প্রসেস হচ্ছে..." : "পেমেন্ট সফল করুন (Success)"}
          </button>
          
          <button 
            onClick={() => handlePayment("FAILED")} 
            className="btn btn-secondary" 
            style={{ width: "100%", padding: "0.875rem", color: "var(--danger)" }}
            disabled={loading}
          >
            {loading ? "প্রসেস হচ্ছে..." : "পেমেন্ট বাতিল / ব্যর্থ করুন (Fail)"}
          </button>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2rem" }}>
          * এটি একটি মক পেমেন্ট গেটওয়ে ইন্টারফেস। কোনো প্রকার আসল ক্রেডিট কার্ড বা মোবাইল ব্যাংকিং ওটিপি কোড ব্যবহার করবেন না।
        </p>
      </div>
    </section>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <h3>গেটওয়ে পেজ লোড হচ্ছে...</h3>
      </div>
    }>
      <PaymentSimulatorContent />
    </Suspense>
  );
}
