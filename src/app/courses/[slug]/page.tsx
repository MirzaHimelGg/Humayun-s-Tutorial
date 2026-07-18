import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Retrieve user auth info
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          avatar: true,
          institution: true,
        }
      },
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!course) {
    return (
      <div className="container" style={{ padding: "10rem 2rem", textAlign: "center" }}>
        <h2>দুঃখিত, কোর্সটি খুঁজে পাওয়া যায়নি!</h2>
        <a href="/courses" className="btn btn-primary" style={{ marginTop: "1rem" }}>সকল কোর্সে ফিরে যান</a>
      </div>
    );
  }

  // Check enrollment
  let isEnrolled = false;
  if (user) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: course.id
      }
    });
    if (enrollment || user.role === "ADMIN" || (user.role === "TEACHER" && course.teacherId === user.id)) {
      isEnrolled = true;
    }
  }

  const lessonsCount = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* Course Banner Header */}
      <section className="section-bg" style={{ padding: "4rem 0", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="status-badge status-success" style={{ textTransform: "uppercase" }}>{course.classLevel}</span>
              <span className="status-badge status-pending" style={{ textTransform: "uppercase" }}>{course.paper} পত্র</span>
              <span className="status-badge status-success">{course.type === "LIVE" ? "লাইভ ক্লাস" : "রেকর্ডেড"}</span>
            </div>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: "1.25" }}>{course.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "2rem", maxWidth: "700px" }}>
              {course.description}
            </p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img 
                  src={course.teacher.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                  alt={course.teacher.name} 
                  style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} 
                />
                <div>
                  <h4 style={{ fontSize: "1rem" }}>{course.teacher.name}</h4>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{course.teacher.institution}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Purchase Widget */}
          <div className="card" style={{ padding: "2rem", alignSelf: "start", position: "sticky", top: "100px" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>কোর্স ফি</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--accent)" }}>৳{course.discountPrice || course.price}</span>
              {course.discountPrice && (
                <span style={{ fontSize: "1.125rem", textDecoration: "line-through", color: "var(--text-muted)" }}>৳{course.price}</span>
              )}
            </div>

            <ul style={{ listStyle: "none", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              <li>✔️ {course.chapters.length}টি অধ্যায়ের সিলেবাস কভার</li>
              <li>✔️ {lessonsCount}টি লেকচার ও ভিডিও রিসোর্স</li>
              <li>✔️ সমাধানমূলক পিডিএফ লেকচার শিট</li>
              <li>✔️ সেলফ অ্যাসেসমেন্ট এমসিকিউ কুইজ</li>
              <li>✔️ লাইফ-টাইম অ্যাক্সেস ও সাপোর্ট</li>
            </ul>

            {isEnrolled ? (
              <a 
                href={user && user.role === "TEACHER" ? `/teacher/courses/${course.id}/lessons` : user && user.role === "ADMIN" ? `/teacher/courses/${course.id}/lessons` : `/dashboard/course/${course.id}/learn`} 
                className="btn btn-primary" 
                style={{ width: "100%", textAlign: "center" }}
              >
                {user && (user.role === "TEACHER" || user.role === "ADMIN") ? "সিলেবাস এডিট করুন" : "পড়া শুরু করুন (কোর্সে যান)"}
              </a>
            ) : user && user.role === "STUDENT" ? (
              <a 
                href={`/checkout?courseId=${course.id}`} 
                className="btn btn-primary" 
                style={{ width: "100%", textAlign: "center", fontSize: "1.125rem" }}
              >
                আজই ভর্তি হোন
              </a>
            ) : user ? (
              <div style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                শুধুমাত্র শিক্ষার্থীরা কোর্সে ভর্তি হতে পারবেন।
              </div>
            ) : (
              <a 
                href={`/login?redirect=/courses/${course.slug}`} 
                className="btn btn-primary" 
                style={{ width: "100%", textAlign: "center", fontSize: "1.125rem" }}
              >
                ভর্তি হতে লগইন করুন
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Syllabus Course Structure Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "2rem", textAlign: "center" }}>কোর্স সিলেবাস ও সূচিপত্র</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--primary)" }}>ধাপ {index + 1}:</span> {chapter.title}
                </h3>
                
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>{lesson.type === "VIDEO" ? "🎥" : lesson.type === "PDF" ? "📄" : "⚡"}</span>
                        <span>{lesson.title}</span>
                      </span>
                      {lesson.isFreePreview ? (
                        <span className="status-badge status-success" style={{ fontSize: "0.7rem" }}>ফ্রি প্রিভিউ</span>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🔒 লকড</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
