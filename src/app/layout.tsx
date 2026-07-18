import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "হুমায়ুন'স টিউটোরিয়াল - অনলাইন বাংলা লার্নিং প্ল্যাটফর্ম",
  description: "এইচএসসি এবং এসএসসি শিক্ষার্থীদের বাংলা ১ম ও ২য় পত্রের পূর্ণাঙ্গ প্রস্তুতি এবং বইয়ের বিশ্বস্ত অনলাইন লাইব্রেরি।",
  keywords: "Bangla learning, HSC Bangla, SSC Bangla, Bookstore, Bangla 1st Paper, Bangla 2nd Paper",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check auth state on server side for header navigation
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        {/* Top Strip Alert Banner */}
        <div className="top-strip">১৭ জুলাই থেকে HSC ২৭ ব্যাচ শুরু &nbsp;•&nbsp; ভর্তি চলছে &nbsp;•&nbsp; ০১৭০০০০০০০০</div>

        {/* Navigation Header */}
        <header className="header" style={{ background: "var(--paper)", borderBottom: "1px solid var(--cream-line)" }}>
          <div className="container nav-container">
            <a href="/" className="logo" style={{ textDecoration: "none", color: "var(--maroon)", display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="mark" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--clay)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper)", fontSize: "1.1rem", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)", fontFamily: "var(--font-serif)" }}>হ</span>
              हুমায়ুন'স টিউটোরিয়াল
            </a>
            
            <nav>
              <ul className="nav-links">
                <li><a href="/courses?classLevel=HSC" className="nav-link">HSC প্রস্তুতি</a></li>
                <li><a href="/courses?classLevel=SSC" className="nav-link">SSC প্রস্তুতি</a></li>
                <li><a href="/store" className="nav-link">বইয়ের দোকান</a></li>
                <li><a href="/certificate" className="nav-link">সার্টিফিকেট যাচাই</a></li>
              </ul>
            </nav>

            <div className="nav-actions">
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <a 
                    href={user.role === "ADMIN" ? "/admin/dashboard" : user.role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"} 
                    className="btn btn-outline btn-sm"
                  >
                    ড্যাশবোর্ড ({user.name})
                  </a>
                  <a 
                    href="/settings" 
                    title="প্রোফাইল সেটিংস" 
                    style={{ textDecoration: "none", fontSize: "1.1rem", display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                  >
                    ⚙️
                  </a>
                  <form action="/api/auth/logout" method="POST" style={{ display: "inline" }}>
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                      লগআউট
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <a href="/login" className="btn btn-outline btn-sm">লগইন</a>
                  <a href="/register" className="btn btn-clay btn-sm">রেজিস্ট্রেশন</a>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Alpona Divider Signature Element */}
        <div className="alpona-divider" style={{ margin: "0 auto 1.5rem auto" }}>
          <svg viewBox="0 0 1100 34" preserveAspectRatio="none">
            <path d="M0 17 Q 27.5 2, 55 17 T 110 17 T 165 17 T 220 17 T 275 17 T 330 17 T 385 17 T 440 17 T 495 17 T 550 17 T 605 17 T 660 17 T 715 17 T 770 17 T 825 17 T 880 17 T 935 17 T 990 17 T 1045 17 T 1100 17"
              fill="none" stroke="#BC4B2F" strokeWidth="2"/>
            <path d="M0 17 Q 27.5 32, 55 17 T 110 17 T 165 17 T 220 17 T 275 17 T 330 17 T 385 17 T 440 17 T 495 17 T 550 17 T 605 17 T 660 17 T 715 17 T 770 17 T 825 17 T 880 17 T 935 17 T 990 17 T 1045 17 T 1100 17"
              fill="none" stroke="#E3A730" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Main Content Page */}
        <main style={{ minHeight: "calc(100vh - var(--header-height) - 300px)" }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <h3>🎓 হুমায়ুন'স টিউটোরিয়াল</h3>
                <p style={{ marginTop: "1rem", lineHeight: "1.7" }}>
                  বাংলাদেশি শিক্ষার্থীদের বাংলা ভাষার ব্যাকরণ, সাহিত্য ও লেখার দক্ষতা সহজ ও আনন্দদায়ক উপায়ে শেখানোর জন্য একটি নিবেদিত ই-লার্নিং প্ল্যাটফর্ম।
                </p>
              </div>
              <div className="footer-col">
                <h4>কোর্সসমূহ</h4>
                <ul className="footer-links">
                  <li><a href="/courses?classLevel=HSC&paper=1st">HSC ১ম পত্র</a></li>
                  <li><a href="/courses?classLevel=HSC&paper=2nd">HSC ২য় পত্র</a></li>
                  <li><a href="/courses?classLevel=SSC">SSC বাংলা কোর্স</a></li>
                  <li><a href="/store">সহায়ক পাঠ্যবই</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>নীতিমালা</h4>
                <ul className="footer-links">
                  <li><a href="/privacy-policy">গোপনীয়তা নীতি</a></li>
                  <li><a href="/refund-policy">রিফান্ড পলিসি</a></li>
                  <li><a href="/terms-and-conditions">ব্যবহারের শর্তাবলী</a></li>
                  <li><a href="/faq">সাধারণ জিজ্ঞাসা (FAQ)</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>যোগাযোগ</h4>
                <ul className="footer-links" style={{ color: "#94a3b8" }}>
                  <li>📍 ঢাকা, বাংলাদেশ</li>
                  <li>📞 +৮৮০ ১৭০০০০০০০০</li>
                  <li>✉️ support@bangla.edu.bd</li>
                  <li>💬 হোয়াটসঅ্যাপ: +৮৮০ ১৮০০০০০০০০</li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2026 হুমায়ুন'স টিউটোরিয়াল. সর্বস্বত্ব সংরক্ষিত।</p>
              <p>Developed with ❤️ for Bangla Learners</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
