"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductDetails {
  id: number;
  title: string;
  price: number;
  discountPrice?: number | null;
}

function CheckoutFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Checkout targets
  const productIdParam = searchParams.get("productId");
  const courseIdParam = searchParams.get("courseId");
  const qtyParam = searchParams.get("qty") || "1";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Form Fields
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddr, setShippingAddr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        if (productIdParam) {
          // Direct checkout for single bookstore item
          const res = await fetch(`/api/products/${productIdParam}`);
          const data = await res.json();
          if (data.success) {
            const product = data.product;
            const price = product.discountPrice || product.price;
            const quantity = parseInt(qtyParam);
            setItems([{
              productId: product.id,
              title: product.title,
              price,
              quantity
            }]);
            setSubtotal(price * quantity);
            setTotal(price * quantity);
          } else {
            setError("প্রোডাক্ট তথ্য লোড করতে সমস্যা হয়েছে।");
          }
        } else if (courseIdParam) {
          // Direct checkout for course enrollment
          const res = await fetch(`/api/courses/detail-by-id?id=${courseIdParam}`); // We can fetch by details directly or just get course details by standard slug
          // Let's call /api/courses and filter locally to find the course details, or do a fetch
          const coursesRes = await fetch(`/api/courses`);
          const coursesData = await coursesRes.json();
          if (coursesData.success) {
            const course = coursesData.courses.find((c: any) => c.id === parseInt(courseIdParam));
            if (course) {
              const price = course.discountPrice || course.price;
              setItems([{
                courseId: course.id,
                title: course.title,
                price,
                quantity: 1
              }]);
              setSubtotal(price);
              setTotal(price);
            } else {
              setError("কোর্স তথ্য লোড করতে সমস্যা হয়েছে।");
            }
          } else {
            setError("কোর্স তথ্য লোড করতে সমস্যা হয়েছে।");
          }
        } else {
          // Load items from cart (localStorage)
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");
          if (cart.length === 0) {
            setError("আপনার কার্ট খালি রয়েছে।");
          } else {
            setItems(cart);
            const sum = cart.reduce((s: number, item: any) => s + item.price * item.quantity, 0);
            setSubtotal(sum);
            setTotal(sum);
          }
        }
      } catch (err) {
        console.error(err);
        setError("তথ্য লোড করার সময় সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [productIdParam, courseIdParam, qtyParam]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      // Validate coupon with simple fetch or simulated response
      // For sandbox simplicity, check for codes BANGLA20 and FLAT100
      if (couponCode.toUpperCase() === "BANGLA20") {
        const discount = (subtotal * 20) / 100;
        setCouponDiscount(discount);
        setTotal(Math.max(0, subtotal - discount));
        setCouponApplied(true);
        setError("");
      } else if (couponCode.toUpperCase() === "FLAT100") {
        const discount = 100;
        setCouponDiscount(discount);
        setTotal(Math.max(0, subtotal - discount));
        setCouponApplied(true);
        setError("");
      } else {
        setError("ভুল কুপন কোড! আবার চেষ্টা করুন।");
      }
    } catch (err) {
      setError("কুপন যাচাই করতে সমস্যা হয়েছে।");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingPhone || !shippingAddr) {
      setError("ডেলিভারি সংক্রান্ত সকল তথ্য প্রদান করুন।");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (courseIdParam) {
        // Enrolling in a course
        if (paymentMethod === "COD") {
          setError("কোর্স ক্রয়ের ক্ষেত্রে ক্যাশ অন ডেলিভারি (COD) প্রযোজ্য নয়।");
          setLoading(false);
          return;
        }

        // Redirect directly to payment simulator for course
        router.push(`/checkout/payment-simulator?courseId=${courseIdParam}&coupon=${couponCode}`);
      } else {
        // Checkout bookstore items
        const checkoutItems = items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }));

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: checkoutItems,
            paymentMethod,
            shippingName,
            shippingPhone,
            shippingAddr,
            couponCode: couponApplied ? couponCode : null,
          }),
        });

        const data = await res.json();
        if (data.success) {
          // Clear cart on success
          if (!productIdParam) {
            localStorage.removeItem("cart");
          }

          if (data.paymentUrl) {
            router.push(data.paymentUrl);
          } else {
            alert("অর্ডার সফল হয়েছে! আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে।");
            router.push("/dashboard/my-orders");
          }
        } else {
          setError(data.error || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।");
        }
      }
    } catch (err) {
      setError("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <h3>অর্ডার প্রসেস হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।</h3>
      </div>
    );
  }

  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">চেকআউট ও পেমেন্ট</h2>
          <p className="section-subtitle">আপনার অর্ডার চূড়ান্ত করতে ডেলিভারি তথ্য প্রদান করুন</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ maxWidth: "800px", margin: "0 auto 2rem" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem", maxWidth: "1000px", margin: "0 auto", alignItems: "start" }}>
          {/* Shipping Form */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>ডেলিভারি ঠিকানা ও তথ্য</h3>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">গ্রাহকের নাম (Name)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="আপনার নাম লিখুন" 
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">মোবাইল নম্বর (Phone)</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="মোবাইল নম্বর প্রদান করুন (যেমন: 017xxxxxxxx)" 
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">পূর্ণাঙ্গ ঠিকানা (Shipping Address)</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: "80px" }}
                  placeholder="গ্রাম/রোড নম্বর, ইউনিয়ন/ওয়ার্ড, জেলা, ডাককোড সহ বিস্তারিত ঠিকানা লিখুন" 
                  value={shippingAddr}
                  onChange={(e) => setShippingAddr(e.target.value)}
                  required
                />
              </div>

              <h3 style={{ margin: "2rem 0 1rem" }}>পেমেন্ট পদ্ধতি</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {!courseIdParam && (
                  <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                  </label>
                )}

                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="BKASH" 
                    checked={paymentMethod === "BKASH"}
                    onChange={() => setPaymentMethod("BKASH")}
                  />
                  <span>বিকাশ (bKash) — অনলাইন পেমেন্ট</span>
                </label>

                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="NAGAD" 
                    checked={paymentMethod === "NAGAD"}
                    onChange={() => setPaymentMethod("NAGAD")}
                  />
                  <span>নগদ (Nagad) — অনলাইন পেমেন্ট</span>
                </label>

                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="ROCKET" 
                    checked={paymentMethod === "ROCKET"}
                    onChange={() => setPaymentMethod("ROCKET")}
                  />
                  <span>রকেট (Rocket) — অনলাইন পেমেন্ট</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "0.875rem" }}
                disabled={loading}
              >
                {loading ? "অর্ডার সাবমিট হচ্ছে..." : paymentMethod === "COD" ? "অর্ডার সম্পন্ন করুন" : "পেমেন্ট করতে এগিয়ে যান"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: "2rem", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>অর্ডারের বিবরণ</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--text-secondary)", maxWidth: "200px" }}>
                    {item.title} {item.quantity > 1 && `(x${item.quantity})`}
                  </span>
                  <strong>৳{item.price * item.quantity}</strong>
                </div>
              ))}
            </div>

            {/* Coupon field */}
            <div style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "1.25rem 0", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="কুপন কোড (যেমন BANGLA20)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                >
                  প্রয়োগ করুন
                </button>
              </div>
              {couponApplied && (
                <p style={{ color: "var(--success)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  🎉 কুপন সফলভাবে প্রয়োগ করা হয়েছে!
                </p>
              )}
            </div>

            {/* Calculation summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>সাবটোটাল:</span>
                <span>৳{subtotal}</span>
              </div>
              
              {couponApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
                  <span>কুপন ডিসকাউন্ট:</span>
                  <span>-৳{couponDiscount}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>ডেলিভারি চার্জ:</span>
                <span>{courseIdParam ? "৳০ (ফ্রি)" : "৳৬০ (সমতল)"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "bold", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <span>সর্বমোট:</span>
                <span style={{ color: "var(--accent)" }}>৳{total + (courseIdParam ? 0 : 60)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <h3>চেকআউট পাতা লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।</h3>
      </div>
    }>
      <CheckoutFormContent />
    </Suspense>
  );
}
