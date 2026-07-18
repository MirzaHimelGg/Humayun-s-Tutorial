export default function PrivacyPolicyPage() {
  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="section-header">
          <h2 className="section-title">গোপনীয়তা নীতি (Privacy Policy)</h2>
          <p className="section-subtitle">আমাদের প্ল্যাটফর্ম আপনার ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ</p>
        </div>

        <div className="card" style={{ padding: "2.5rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>১. তথ্য সংগ্রহ ও ব্যবহার</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            আমরা আপনার নাম, ইমেইল এড্রেস, ফোন নম্বর, শিক্ষা প্রতিষ্ঠান এবং শ্রেণীর তথ্য সংগ্রহ করি যখন আপনি আমাদের সাইটে নিবন্ধন করেন। এই তথ্য আপনার অ্যাকাউন্টের নিরাপত্তা এবং লার্নিং ড্যাশবোর্ড কাস্টমাইজ করতে ব্যবহার করা হয়।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>২. পেমেন্ট তথ্যের গোপনীয়তা</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            আমাদের সাইটে বিকাশের বা অন্যান্য কার্ডের পেমেন্ট প্রক্রিয়াকরণ নিরাপদ পেমেন্ট গেটওয়ে (SSLCommerz) দ্বারা নিয়ন্ত্রিত হয়। আমরা কোনো কার্ড নম্বর বা পিন নম্বর আমাদের ডাটাবেজে সংরক্ষণ করি না।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৩. কুকিজ (Cookies)</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            ব্যবহারকারী হিসেবে আপনার লগইন সেশন সচল রাখতে এবং ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করা হয়।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৪. তৃতীয় পক্ষের সাথে তথ্য শেয়ার</h3>
          <p>
            আমরা কোনো শিক্ষার্থীর ব্যক্তিগত তথ্য কোনো বিজ্ঞাপন বা ব্যবসায়িক উদ্দেশ্যে তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।
          </p>
        </div>
      </div>
    </section>
  );
}
