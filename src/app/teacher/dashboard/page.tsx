"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
interface Enrollment { id: number; }
interface Course {
  id: number;
  title: string;
  classLevel: string;
  paper: string;
  type: string;
  status: string;
  price: number;
  discountPrice: number | null;
  slug: string;
  enrollments: Enrollment[];
  createdAt: string;
}

interface DoubtAnswer {
  id: number;
  answerText: string;
  answeredAt: string;
  answeredBy: { name: string };
}

interface Doubt {
  id: number;
  questionText: string;
  status: string;
  createdAt: string;
  student: { name: string };
  lesson: { title: string; chapter: { course: { title: string } } };
  answers: DoubtAnswer[];
}

interface Me {
  name: string;
  email: string;
  role: string;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Course creation modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    classLevel: "HSC",
    paper: "1st",
    type: "RECORDED",
    price: "",
    discountPrice: "",
  });

  // Doubt reply
  const [replyTexts, setReplyTexts] = useState<{ [id: number]: string }>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.status === 401) {
          router.push("/login?redirect=/teacher/dashboard");
          return;
        }
        const meData = await meRes.json();
        if (!meData.success || meData.user.role !== "TEACHER") {
          router.push("/login?redirect=/teacher/dashboard");
          return;
        }
        setMe(meData.user);

        // Load courses and doubts in parallel
        const [coursesRes, doubtsRes] = await Promise.all([
          fetch("/api/teacher/courses"),
          fetch("/api/teacher/doubts"),
        ]);
        const coursesData = await coursesRes.json();
        const doubtsData = await doubtsRes.json();

        if (coursesData.success) setCourses(coursesData.courses || []);
        if (doubtsData.success) setDoubts(doubtsData.doubts || []);
      } catch {
        setError("ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const slug = "course-" + Date.now();
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug,
          description: form.description,
          classLevel: form.classLevel,
          paper: form.paper,
          type: form.type,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ title: "", description: "", classLevel: "HSC", paper: "1st", type: "RECORDED", price: "", discountPrice: "" });
        // Reload courses
        const cr = await fetch("/api/teacher/courses");
        const cd = await cr.json();
        if (cd.success) setCourses(cd.courses || []);
      } else {
        alert(data.error || "কোর্স তৈরি করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setCreating(false);
    }
  };

  const handleReplyDoubt = async (doubtId: number) => {
    const text = replyTexts[doubtId]?.trim();
    if (!text) return;
    try {
      setReplyingId(doubtId);
      const res = await fetch(`/api/doubts/${doubtId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerText: text }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove this doubt from the open list
        setDoubts((prev) => prev.filter((d) => d.id !== doubtId));
        setReplyTexts((prev) => { const n = { ...prev }; delete n[doubtId]; return n; });
      } else {
        alert(data.error || "উত্তর পোস্ট করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setReplyingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      PUBLISHED: { bg: "#f0fdf4", color: "#16a34a", label: "প্রকাশিত" },
      PENDING: { bg: "#fef9c3", color: "#854d0e", label: "পর্যালোচনাধীন" },
      DRAFT: { bg: "var(--bg-tertiary)", color: "var(--text-muted)", label: "ড্রাফট" },
    };
    const s = map[status] || map.DRAFT;
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          borderRadius: "999px",
          padding: "0.2rem 0.65rem",
          fontSize: "0.72rem",
          fontWeight: 700,
        }}
      >
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ width: 56, height: 56, border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>ড্যাশবোর্ড লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
        <h2>⚠️ {error}</h2>
        <a href="/login" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>লগইন করুন</a>
      </div>
    );
  }

  const totalStudents = courses.reduce((acc, c) => acc + c.enrollments.length, 0);
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "80vh" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* ─── Hero Banner ─────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, var(--maroon) 100%)", padding: "3rem 0", color: "#fff" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.25rem" }}>Teacher Canvas</p>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                স্বাগতম, {me?.name} 👨‍🏫
              </h1>
              <p style={{ opacity: 0.75, marginTop: "0.4rem", fontSize: "0.9rem" }}>{me?.email}</p>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "মোট কোর্স", value: courses.length, icon: "📚" },
                { label: "প্রকাশিত", value: publishedCourses, icon: "✅" },
                { label: "মোট শিক্ষার্থী", value: totalStudents, icon: "👨‍🎓" },
                { label: "পেন্ডিং প্রশ্ন", value: doubts.length, icon: "❓" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1.25rem",
                    textAlign: "center",
                    minWidth: "85px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{s.icon}</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.8, marginTop: "0.25rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2.5rem" }}>

          {/* ─── LEFT: Course List ────────────────────── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.35rem" }}>📚 আমার কোর্সসমূহ ({courses.length})</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href="/teacher/students"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", border: "1px solid var(--primary)", color: "var(--primary)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: "bold" }}
                >
                  🧑‍🎓 শিক্ষার্থীদের অগ্রগতি
                </a>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + নতুন কোর্স তৈরি করুন
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎓</div>
                <p>আপনার এখনো কোনো কোর্স নেই। প্রথম কোর্সটি তৈরি করুন!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {courses.map((course) => (
                  <div key={course.id} className="card" style={{ padding: "1.5rem", transition: "box-shadow 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>{course.title}</h3>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {course.classLevel} | {course.paper} পত্র |{" "}
                          {course.type === "LIVE" ? "লাইভ ব্যাচ" : "রেকর্ডেড"}
                        </p>
                      </div>
                      {statusBadge(course.status)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "0.875rem",
                        fontSize: "0.88rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span>
                        👨‍🎓 <strong>{course.enrollments.length} জন</strong> শিক্ষার্থী
                      </span>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                        ৳{course.discountPrice ?? course.price}
                        {course.discountPrice && (
                          <s style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: "0.4rem", fontSize: "0.8rem" }}>
                            ৳{course.price}
                          </s>
                        )}
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <a href={`/teacher/courses/${course.id}/lessons`} className="btn btn-primary btn-sm">
                          ✏️ এডিট
                        </a>
                        <a href={`/courses/${course.slug}`} target="_blank" className="btn btn-secondary btn-sm">
                          👁 ভিউ
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Doubt Panel ──────────────────── */}
          <div>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
              ❓ উত্তরহীন জিজ্ঞাসা ({doubts.length})
            </h2>

            {doubts.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
                <p>সবগুলো জিজ্ঞাসার উত্তর দেওয়া হয়েছে!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "75vh", overflowY: "auto", paddingRight: "0.25rem" }}>
                {doubts.map((doubt) => (
                  <div
                    key={doubt.id}
                    className="card"
                    style={{ padding: "1.25rem", borderLeft: "4px solid var(--warning)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
                      <span>👤 {doubt.student.name}</span>
                      <span>📖 {doubt.lesson.title}</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      📚 {doubt.lesson.chapter.course.title}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem" }}>
                      প্রশ্ন: {doubt.questionText}
                    </p>

                    <div>
                      <textarea
                        className="form-input"
                        placeholder="আপনার উত্তরটি এখানে লিখুন..."
                        value={replyTexts[doubt.id] || ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [doubt.id]: e.target.value }))
                        }
                        style={{ minHeight: "70px", fontSize: "0.85rem", padding: "0.5rem", resize: "vertical" }}
                      />
                      <button
                        onClick={() => handleReplyDoubt(doubt.id)}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: "0.5rem", width: "100%" }}
                        disabled={replyingId === doubt.id || !replyTexts[doubt.id]?.trim()}
                      >
                        {replyingId === doubt.id ? "পোস্ট হচ্ছে..." : "উত্তর পোস্ট করুন ✓"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Course Creation Modal ─────────────────── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
            padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{ padding: "2.5rem", maxWidth: "520px", width: "100%", animation: "slideDown 0.3s ease", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
              <h2 style={{ fontSize: "1.35rem" }}>নতুন কোর্স তৈরি করুন</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">কোর্সের শিরোনাম *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: HSC বাংলা ১ম পত্র - গদ্যাংশ কোর্স"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">বিবরণ *</label>
                <textarea
                  className="form-input"
                  placeholder="কোর্সের বিস্তারিত তথ্য..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: "80px" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">শ্রেণী</label>
                  <select
                    className="form-select"
                    value={form.classLevel}
                    onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                  >
                    <option value="HSC">HSC (১১-১২)</option>
                    <option value="SSC">SSC (৯-১০)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">পত্র</label>
                  <select
                    className="form-select"
                    value={form.paper}
                    onChange={(e) => setForm({ ...form, paper: e.target.value })}
                  >
                    <option value="1st">১ম পত্র</option>
                    <option value="2nd">২য় পত্র</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">কোর্সের ধরন</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="RECORDED">রেকর্ডেড</option>
                    <option value="LIVE">লাইভ ব্যাচ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">কোর্স ফি (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="যেমন: 1500"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ডিসকাউন্ট মূল্য (৳) — ঐচ্ছিক</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="যেমন: 1200 (ডিসকাউন্ট না থাকলে খালি রাখুন)"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  min="0"
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={creating}
                >
                  {creating ? "তৈরি হচ্ছে..." : "কোর্স তৈরি করুন →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
