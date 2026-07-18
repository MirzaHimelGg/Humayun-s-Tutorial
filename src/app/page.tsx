import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Fetch courses and books for homepage highlights
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    take: 3,
    include: {
      teacher: { select: { name: true, avatar: true } }
    }
  });

  const books = await prisma.product.findMany({
    take: 4
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero container" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "50px", alignItems: "center", padding: "70px 1.5rem 40px" }}>
        <div>
          <div className="eyebrow">SSC · HSC · বাংলা ১ম ও ২য় পত্র</div>
          <h1 style={{ fontSize: "3.2rem", lineHeight: "1.28", color: "var(--maroon)", margin: "0 0 22px" }}>
            বাংলা শিখো <span className="accent" style={{ color: "var(--clay)" }}>গল্পের মতো</span>,<br />পরীক্ষায় লিখো তারার মতো
          </h1>
          <p className="lede" style={{ fontSize: "1.12rem", lineHeight: "1.8", color: "#453023", maxWidth: "520px", margin: "0 0 32px" }}>
            গদ্য, পদ্য, ব্যাকরণ ও নির্মিতি — হুমায়ুন স্যারের হাত ধরে সাজানো লাইভ ক্লাস, রেকর্ডেড লেকচার, স্পেশাল নোট আর পরীক্ষা ক্যানভাস।
          </p>
          <div className="hero-ctas" style={{ display: "flex", gap: "16px", marginBottom: "38px", flexWrap: "wrap" }}>
            <a className="btn btn-clay btn-lg" href="/courses">কোর্স দেখুন</a>
            <a className="btn btn-outline btn-lg" href="/store">বইঘর দেখুন</a>
          </div>
          <div className="hero-stats" style={{ display: "flex", gap: "34px" }}>
            <div className="stat">
              <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--teal)", fontWeight: "600" }}>৮০,০০০+</div>
              <div className="label" style={{ fontSize: "0.82rem", color: "#5c4633", marginTop: "2px" }}>শিক্ষার্থী</div>
            </div>
            <div className="stat">
              <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--teal)", fontWeight: "600" }}>৪.৮</div>
              <div className="label" style={{ fontSize: "0.82rem", color: "#5c4633", marginTop: "2px" }}>রেটিং</div>
            </div>
            <div className="stat">
              <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--teal)", fontWeight: "600" }}>১২০+</div>
              <div className="label" style={{ fontSize: "0.82rem", color: "#5c4633", marginTop: "2px" }}>লাইভ ক্লাস</div>
            </div>
          </div>
        </div>

        <div className="roundel-wrap">
          <div className="roundel-ring"></div>
          <div className="badge b1">📖 ১ম পত্র</div>
          <div className="badge b2">✍️ ২য় পত্র</div>
          <div className="badge b3">🎓 সার্টিফিকেট</div>
          <div className="roundel">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="108" fill="none" stroke="#6E1423" strokeWidth="1" />
              <path d="M20 150 Q110 190 200 150 L200 165 Q110 205 20 165 Z" fill="#4C7A3D" opacity="0.85" />
              <ellipse cx="110" cy="150" rx="60" ry="10" fill="#1B4348" opacity="0.5" />
              <path d="M55 150 L165 150 L150 128 L70 128 Z" fill="#BC4B2F" />
              <rect x="95" y="95" width="8" height="35" fill="#98371F" />
              <path d="M103 95 L103 60 L140 95 Z" fill="#E3A730" />
              <circle cx="70" cy="70" r="4" fill="#2B1810" />
              <path d="M60 75 Q70 65 80 75" fill="none" stroke="#2B1810" strokeWidth="2" />
              <circle cx="150" cy="60" r="4" fill="#2B1810" />
              <path d="M140 65 Q150 55 160 65" fill="none" stroke="#2B1810" strokeWidth="2" />
              <g opacity="0.7">
                <circle cx="45" cy="140" r="6" fill="#6E1423" />
                <circle cx="175" cy="135" r="5" fill="#E3A730" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Alpona Divider Signature Element */}
      <div className="alpona-divider">
        <svg viewBox="0 0 1100 34" preserveAspectRatio="none">
          <path d="M0 17 Q 27.5 2, 55 17 T 110 17 T 165 17 T 220 17 T 275 17 T 330 17 T 385 17 T 440 17 T 495 17 T 550 17 T 605 17 T 660 17 T 715 17 T 770 17 T 825 17 T 880 17 T 935 17 T 990 17 T 1045 17 T 1100 17"
            fill="none" stroke="#1B4348" strokeWidth="2"/>
        </svg>
      </div>

      {/* Batch Selection Grid */}
      <section className="section container">
        <div className="section-head" style={{ textAlign: "center", marginBottom: "44px" }}>
          <div className="eyebrow">শ্রেণী বাছাই করুন</div>
          <h2 style={{ fontSize: "2.15rem", color: "var(--maroon)", margin: "0 0 10px" }}>তোমার ব্যাচ খুঁজে নাও</h2>
          <p style={{ color: "#5c4633", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
            SSC থেকে HSC — প্রতিটি ব্যাচেই থাকছে লাইভ ক্লাস, প্রিন্টেড নোট আর আনলিমিটেড MCQ প্র্যাকটিস।
          </p>
        </div>
        <div className="class-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <a href="/courses?classLevel=SSC" className="class-card">
            <div className="tag" style={{ background: "var(--clay)" }}>৯-১০</div>
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 6px", color: "var(--ink)" }}>SSC ব্যাচ</h3>
            <p style={{ fontSize: "0.85rem", color: "#6b5744", margin: 0 }}>বাংলা ১ম ও ২য় পত্র</p>
          </a>
          <a href="/courses?classLevel=HSC&paper=2nd" className="class-card">
            <div className="tag" style={{ background: "var(--teal)" }}>HSC</div>
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 6px", color: "var(--ink)" }}>HSC ২৬</h3>
            <p style={{ fontSize: "0.85rem", color: "#6b5744", margin: 0 }}>চূড়ান্ত পরীক্ষা প্রস্তুতি</p>
          </a>
          <a href="/courses?classLevel=HSC&paper=1st" className="class-card">
            <div className="tag" style={{ background: "var(--maroon)" }}>HSC</div>
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 6px", color: "var(--ink)" }}>HSC ২৭</h3>
            <p style={{ fontSize: "0.85rem", color: "#6b5744", margin: 0 }}>নিয়মিত ব্যাচ</p>
          </a>
          <a href="/courses?classLevel=HSC" className="class-card">
            <div className="tag" style={{ background: "var(--leaf)" }}>HSC</div>
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 6px", color: "var(--ink)" }}>HSC ২৮</h3>
            <p style={{ fontSize: "0.85rem", color: "#6b5744", margin: 0 }}>ফাউন্ডেশন ব্যাচ</p>
          </a>
        </div>
      </section>

      {/* Courses Highlights */}
      <section className="section container">
        <div className="section-head" style={{ textAlign: "center", marginBottom: "44px" }}>
          <div className="eyebrow">জনপ্রিয় কোর্স</div>
          <h2 style={{ fontSize: "2.15rem", color: "var(--maroon)", margin: "0 0 10px" }}>বাংলা ১ম ও ২য় পত্র সম্পূর্ণ কোর্স</h2>
          <p style={{ color: "#5c4633", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
            অভিজ্ঞ হুমায়ুন স্যারের লাইভ ক্লাস, রেকর্ডেড লেকচার আর মডেল টেস্ট দিয়ে সাজানো প্রিমিয়াম কোর্সসমূহ।
          </p>
        </div>
        <div className="course-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "26px" }}>
          {courses.map((course, idx) => {
            const bannerBg = idx % 3 === 0 
              ? "linear-gradient(135deg,var(--clay),var(--clay-dark))" 
              : idx % 3 === 1 
                ? "linear-gradient(135deg,var(--teal),var(--teal-2))" 
                : "linear-gradient(135deg,var(--maroon),#4a0f1a)";
            
            return (
              <div key={course.id} className="card-rickshaw" style={{ display: "flex", flexDirection: "column" }}>
                <div className="course-banner" style={{ background: bannerBg }}>
                  {course.paper === "1st" ? "১ম পত্র" : course.paper === "2nd" ? "২য় পত্র" : "১ম ও ২য় পত্র"}
                </div>
                <div className="course-body">
                  <span className="paper-tag">{course.classLevel} ব্যাচ</span>
                  <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px", color: "var(--ink)" }}>{course.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#6b5744", lineHeight: "1.6", margin: "0 0 16px" }}>{course.description}</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div className="avatar" style={{ width: "24px", height: "24px", fontSize: "0.6rem" }}>🎓</div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>{course.teacher.name}</span>
                  </div>

                  <div className="course-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="price" style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--teal)" }}>
                      {course.discountPrice ? (
                        <>
                          <span className="old">৳{course.price}</span>
                          ৳{course.discountPrice}
                        </>
                      ) : (
                        `৳${course.price}`
                      )}
                    </div>
                    <a className="mini-btn" href={`/courses/${course.slug}`}>বিস্তারিত দেখুন</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alpona Divider signature element */}
      <div className="alpona-divider">
        <svg viewBox="0 0 1100 34" preserveAspectRatio="none">
          <path d="M0 17 Q 27.5 32, 55 17 T 110 17 T 165 17 T 220 17 T 275 17 T 330 17 T 385 17 T 440 17 T 495 17 T 550 17 T 605 17 T 660 17 T 715 17 T 770 17 T 825 17 T 880 17 T 935 17 T 990 17 T 1045 17 T 1100 17"
            fill="none" stroke="#E3A730" strokeWidth="2"/>
        </svg>
      </div>

      {/* Bookstore Section */}
      <section className="section" style={{ background: "var(--teal)", color: "var(--paper)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: "center", marginBottom: "44px" }}>
            <div className="eyebrow" style={{ borderColor: "var(--turmeric)", color: "var(--turmeric)", background: "rgba(227,167,48,0.1)" }}>বইঘর</div>
            <h2 style={{ fontSize: "2.15rem", color: "var(--turmeric)", margin: "0 0 10px" }}>নিজের সংগ্রহে রাখো প্রিয় বইগুলো</h2>
            <p style={{ color: "#cfe0df", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
              গাইড বই, সাহিত্য ক্লাসিক আর প্র্যাকটিস বুক — সরাসরি বাড়িতে পৌঁছে যাবে।
            </p>
          </div>
          
          <div className="store-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {books.map((book, idx) => {
              const images = JSON.parse(book.imagesJson);
              const coverBg = idx % 4 === 0 
                ? "linear-gradient(160deg,var(--clay),var(--maroon))"
                : idx % 4 === 1
                  ? "linear-gradient(160deg,var(--turmeric),var(--clay-dark))"
                  : idx % 4 === 2
                    ? "linear-gradient(160deg,var(--leaf),#2f4f26)"
                    : "linear-gradient(160deg,#8a5ba0,var(--maroon))";
              
              return (
                <div key={book.id} className="book-card">
                  <div className="book-cover" style={{ background: coverBg }}>
                    {book.title}
                  </div>
                  <h4 style={{ fontSize: "0.95rem", margin: "0 0 4px", color: "var(--ink)", fontWeight: "bold" }}>{book.title}</h4>
                  <p style={{ fontSize: "0.8rem", color: "#6b5744", marginBottom: "8px" }}>লেখক: {book.author}</p>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                    <span className="price" style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--teal)", fontWeight: "600" }}>
                      {book.discountPrice ? (
                        <>
                          <span className="old" style={{ textDecoration: "line-through", color: "#a99", fontSize: "0.75rem", marginRight: "6px" }}>৳{book.price}</span>
                          ৳{book.discountPrice}
                        </>
                      ) : (
                        `৳${book.price}`
                      )}
                    </span>
                    <a className="mini-btn" href={`/store/${book.slug}`} style={{ background: "var(--ink)", color: "var(--paper)", fontSize: "0.75rem", padding: "6px 12px", borderRadius: "999px" }}>
                      কিনুন
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Collage */}
      <section className="section container">
        <div className="section-head" style={{ textAlign: "center", marginBottom: "44px" }}>
          <div className="eyebrow">শিক্ষার্থীদের মতামত</div>
          <h2 style={{ fontSize: "2.15rem", color: "var(--maroon)", margin: "0 0 10px" }}>তাদের কথায় আমাদের গল্প</h2>
        </div>
        
        <div className="testi-strip">
          <div className="testi-card">
            <div className="quote-mark">"</div>
            <p>বাংলা ২য় পত্রে সবসময় ভয় পেতাম। হুমায়ুন স্যারের কোর্সের পর ব্যাকরণটা এখন সবচেয়ে সহজ লাগে।</p>
            <div className="testi-name">
              <div className="avatar">নু</div>
              <div>
                <div className="who">নুসরাত জাহান</div>
                <div className="sub">HSC ২৬ ব্যাচ</div>
              </div>
            </div>
          </div>
          
          <div className="testi-card">
            <div className="quote-mark">"</div>
            <p>লাইভ ক্লাস মিস করলেও রেকর্ডিং থেকে দেখে নিতে পারি। MCQ ব্যাংকটা পরীক্ষার আগে দারুণ কাজে দিয়েছে।</p>
            <div className="testi-name">
              <div className="avatar">তা</div>
              <div>
                <div className="who">তানভীর আহমেদ</div>
                <div className="sub">SSC ২৫ ব্যাচ</div>
              </div>
            </div>
          </div>
          
          <div className="testi-card">
            <div className="quote-mark">"</div>
            <p>শিক্ষক নিজে সরাসরি প্রতিটি জটিল বানানের ও উচ্চারণের সমাধান দেন, এটা আমার কাছে সবচেয়ে ভালো লেগেছে।</p>
            <div className="testi-name">
              <div className="avatar">রা</div>
              <div>
                <div className="who">রাফিয়া ইসলাম</div>
                <div className="sub">HSC ২৭ ব্যাচ</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
