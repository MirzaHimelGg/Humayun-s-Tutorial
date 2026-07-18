export default function TermsAndConditionsPage() {
  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="section-header">
          <h2 className="section-title">ব্যবহারের শর্তাবলী (Terms & Conditions)</h2>
          <p className="section-subtitle">আমাদের প্ল্যাটফর্ম ব্যবহারে শিক্ষার্থীদের জন্য প্রয়োজনীয় নীতিমালা</p>
        </div>

        <div className="card" style={{ padding: "2.5rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>১. অ্যাকাউন্ট সিকিউরিটি</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            একটি অ্যাকাউন্ট শুধুমাত্র একজন ব্যবহারকারী (শিক্ষার্থী) ব্যবহার করতে পারবেন। একই অ্যাকাউন্ট একাধিক ডিভাইসে শেয়ার করা অথবা কমার্শিয়াল উদ্দেশ্যে ব্যবহার করা সম্পূর্ণরূপে নিষিদ্ধ।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>২. পাইরেসি এবং কপিরাইট</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            প্ল্যাটফর্মের কোনো ভিডিও ক্লাস রেকর্ড করা, ফেসবুক বা ইউটিউবে আপলোড করা, অথবা পিডিএফ ফাইল ইন্টারনেটে শেয়ার করা শাস্তিযোগ্য অপরাধ। আইনগত ব্যবস্থার পাশাপাশি অপরাধী শিক্ষার্থীর আইডি স্থায়ীভাবে ব্যান করা হবে।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৩. নম্রতা ও শালীনতা রক্ষা</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            লাইভ কমেন্ট বক্স অথবা ডাউট ইনবক্সে অশালীন শব্দ ব্যবহার অথবা অন্য শিক্ষার্থীদের হেয় প্রতিপন্ন করার চেষ্টা করলে আইনগত অ্যাকশন এবং প্ল্যাটফর্ম নিষেধাজ্ঞা জারি হতে পারে।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৪. নীতিমালা পরিবর্তন</h3>
          <p>
            হুমায়ুন'স টিউটোরিয়াল যেকোনো সময় এই ব্যবহারের শর্তাবলী পরিবর্তন করার ক্ষমতা রাখে এবং পরিবর্তনের সাথে সাথে তা ওয়েবসাইটে কার্যকর হবে।
          </p>
        </div>
      </div>
    </section>
  );
}
