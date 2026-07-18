export default function RefundPolicyPage() {
  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="section-header">
          <h2 className="section-title">রিফান্ড পলিসি (Refund Policy)</h2>
          <p className="section-subtitle">আমাদের রিফান্ড এবং রিটার্ন সংক্রান্ত নিয়মনীতি</p>
        </div>

        <div className="card" style={{ padding: "2.5rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>১. অনলাইন কোর্সের ক্ষেত্রে</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            ভর্তি সম্পন্ন হওয়ার ২৪ ঘণ্টার মধ্যে কোনো উপযুক্ত কারণ দর্শিয়ে রিফান্ড দাবি করলে আমরা ১০০% পেমেন্ট ফেরত দিয়ে থাকি। ২৪ ঘণ্টা অতিক্রান্ত হওয়ার পর কোনো রিফান্ড আবেদন গ্রহণযোগ্য হবে না।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>২. বই ও সহায়ক পাঠ্যসামগ্রীর ক্ষেত্রে</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            যদি কোনো বই ছেঁড়া বা প্রিন্টিং মিসটেক যুক্ত অবস্থায় পৌঁছায়, তবে ডেলিভারি পাওয়ার ৩ দিনের মধ্যে জানালে আমরা সম্পূর্ণ ফ্রিতে নতুন বই পাঠিয়ে দেব অথবা বইয়ের সমপরিমাণ টাকা রিফান্ড করব।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৩. ডিজিটাল বই (PDF) এর ক্ষেত্রে</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            ডিজিটাল ডাউনলোডেবল প্রোডাক্ট বা পিডিএফ বইয়ের ক্ষেত্রে একবার ফাইল ডাউনলোড সচল হয়ে গেলে কোনো প্রকার রিফান্ড দেওয়া সম্ভব নয়।
          </p>

          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>৪. প্রসেসিং টাইম</h3>
          <p>
            রিফান্ড অনুমোদন হওয়ার পর ৩ থেকে ৭ কার্যদিবসের মধ্যে আপনার বিকাশ বা ব্যাংক একাউন্টে টাকা পাঠিয়ে দেওয়া হবে।
          </p>
        </div>
      </div>
    </section>
  );
}
