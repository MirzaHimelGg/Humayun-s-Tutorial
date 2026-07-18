"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
interface Lesson {
  id: number;
  title: string;
  type: string;
  contentUrl: string;
  isFreePreview: boolean;
  order: number;
}

interface Chapter {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  classLevel: string;
  paper: string;
  type: string;
  status: string;
  price: number;
  discountPrice: number | null;
  promoVideoUrl: string | null;
  chapters: Chapter[];
}

type ActiveTab = "info" | "syllabus" | "quiz" | "schedule" | "publish";

/* ─── Helpers ─────────────────────────────────────────── */
function getYoutubeEmbedUrl(url: string): string | null {
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function TeacherCourseLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  /* ─── Info Tab State ─────────────────────── */
  const [infoForm, setInfoForm] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    promoVideoUrl: "",
  });

  /* ─── Syllabus Tab State ─────────────────── */
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    chapterId: 0,
    chapterTitle: "",
    title: "",
    type: "VIDEO",
    contentUrl: "",
    isFreePreview: false,
  });

  /* ─── Quiz Tab State ────────────────────── */
  const [quizLessonId, setQuizLessonId] = useState<number | 0>(0);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizFormat, setQuizFormat] = useState<"inline" | "external">("inline");
  const [externalUrl, setExternalUrl] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    { text: "", options: ["", "", "", ""], correctOption: 0, explanation: "" },
  ]);

  /* ─── Schedule Tab State ─────────────────── */
  const [scheduleLessonId, setScheduleLessonId] = useState<number | 0>(0);
  const [scheduleForm, setScheduleForm] = useState({
    startTime: "",
    endTime: "",
    joinUrl: "",
  });

  /* ─── Load Data ──────────────────────────── */
  async function loadCourse() {
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

      const res = await fetch(`/api/teacher/courses/${courseId}/details`);
      if (!res.ok) {
        router.push("/teacher/dashboard");
        return;
      }
      const data = await res.json();
      if (data.success && data.course) {
        setCourse(data.course);
        setInfoForm({
          title: data.course.title || "",
          description: data.course.description || "",
          price: String(data.course.price || ""),
          discountPrice: data.course.discountPrice ? String(data.course.discountPrice) : "",
          promoVideoUrl: data.course.promoVideoUrl || "",
        });
      } else {
        setError("কোর্সটি খুঁজে পাওয়া যায়নি।");
      }
    } catch {
      setError("তথ্য লোড করার সময় সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  /* ─── Actions ────────────────────────────── */
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: infoForm.title,
          description: infoForm.description,
          price: parseFloat(infoForm.price),
          discountPrice: infoForm.discountPrice ? parseFloat(infoForm.discountPrice) : null,
          promoVideoUrl: infoForm.promoVideoUrl || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("কোর্সের তথ্য সফলভাবে আপডেট হয়েছে।");
        await loadCourse();
      } else {
        alert(data.error || "আপডেট করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chapterTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setShowChapterModal(false);
        setChapterTitle("");
        showSuccess("অধ্যায় যোগ করা হয়েছে।");
        await loadCourse();
      } else {
        alert(data.error || "অধ্যায় যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.contentUrl.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: lessonForm.chapterId,
          title: lessonForm.title,
          type: lessonForm.type,
          contentUrl: lessonForm.contentUrl,
          isFreePreview: lessonForm.isFreePreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLessonModal(false);
        setLessonForm({ chapterId: 0, chapterTitle: "", title: "", type: "VIDEO", contentUrl: "", isFreePreview: false });
        showSuccess("লেকচার যোগ করা হয়েছে।");
        await loadCourse();
      } else {
        alert(data.error || "লেকচার যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizLessonId || !quizTitle.trim()) return;

    let validQ: any[] = [];
    if (quizFormat === "inline") {
      validQ = quizQuestions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
      if (validQ.length === 0) {
        alert("কমপক্ষে একটি সম্পূর্ণ প্রশ্ন যোগ করুন।");
        return;
      }
    } else {
      if (!externalUrl.trim()) {
        alert("এক্সটার্নাল কুইজ লিংক (Google Form) প্রদান করুন।");
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/lessons/${quizLessonId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizTitle,
          quizType: "PRACTICE",
          timeLimit: 0,
          externalUrl: quizFormat === "external" ? externalUrl : null,
          questions: quizFormat === "inline" ? validQ.map((q) => ({
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation || null,
            marks: 1.0,
          })) : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("কুইজ সফলভাবে যোগ হয়েছে।");
        setQuizLessonId(0);
        setQuizTitle("");
        setExternalUrl("");
        setQuizQuestions([{ text: "", options: ["", "", "", ""], correctOption: 0, explanation: "" }]);
      } else {
        alert(data.error || "কুইজ যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleLessonId || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.joinUrl) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/lessons/${scheduleLessonId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(scheduleForm.startTime).toISOString(),
          endTime: new Date(scheduleForm.endTime).toISOString(),
          joinUrl: scheduleForm.joinUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("লাইভ ক্লাসের শিডিউল যোগ হয়েছে।");
        setScheduleLessonId(0);
        setScheduleForm({ startTime: "", endTime: "", joinUrl: "" });
      } else {
        alert(data.error || "শিডিউল যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!confirm("কোর্সটি অ্যাডমিনের কাছে পর্যালোচনার জন্য পাঠাবেন?")) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("কোর্সটি পর্যালোচনার জন্য পাঠানো হয়েছে।");
        await loadCourse();
      } else {
        alert(data.error || "সাবমিট করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি।");
    } finally {
      setSaving(false);
    }
  };

  // All lessons flat list (for quiz / schedule dropdowns)
  const allLessons = course?.chapters.flatMap((ch) =>
    ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title }))
  ) ?? [];
  const liveLessons = allLessons.filter((l) => l.type === "LIVE");

  /* ─── Loading / Error ─── */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ width: 56, height: 56, border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>কোর্স লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
        <h2>⚠️ {error}</h2>
        <a href="/teacher/dashboard" className="btn btn-primary" style={{ marginTop: "1rem" }}>ড্যাশবোর্ডে ফিরুন</a>
      </div>
    );
  }

  const TABS: { id: ActiveTab; label: string; emoji: string }[] = [
    { id: "info", label: "কোর্স তথ্য", emoji: "📋" },
    { id: "syllabus", label: "অধ্যায় ও লেকচার", emoji: "📂" },
    { id: "quiz", label: "কুইজ নির্মাতা", emoji: "📝" },
    { id: "schedule", label: "লাইভ শিডিউল", emoji: "⚡" },
    { id: "publish", label: "প্রকাশনা", emoji: "🚀" },
  ];

  const statusMap: Record<string, { color: string; label: string }> = {
    PUBLISHED: { color: "#16a34a", label: "প্রকাশিত ✓" },
    PENDING: { color: "#d97706", label: "পর্যালোচনাধীন ⏳" },
    DRAFT: { color: "#6b7280", label: "ড্রাফট" },
  };
  const st = statusMap[course?.status || "DRAFT"];

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "80vh" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* ─── Header ──────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, var(--maroon) 100%)", padding: "2rem 0 0", color: "#fff" }}>
        <div className="container" style={{ paddingBottom: 0 }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <a href="/teacher/dashboard" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", textDecoration: "none" }}>
              ← ড্যাশবোর্ড
            </a>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: "0.5rem 0 0.25rem" }}>
              ✏️ কোর্স নির্মাতা
            </h1>
            <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: 0 }}>
              {course?.title}
              <span
                style={{
                  marginLeft: "0.75rem",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  padding: "0.15rem 0.65rem",
                  fontSize: "0.72rem",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {st.label}
              </span>
            </p>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
                  color: activeTab === tab.id ? "var(--maroon)" : "rgba(255,255,255,0.8)",
                  border: "none",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s",
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "900px" }}>
        {/* Success banner */}
        {successMsg && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              background: "#f0fdf4",
              border: "1px solid var(--success)",
              borderRadius: "var(--radius-md)",
              color: "var(--success)",
              fontWeight: 600,
              marginBottom: "1.5rem",
              animation: "slideDown 0.3s ease",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* ══ INFO TAB ══ */}
        {activeTab === "info" && (
          <form onSubmit={handleUpdateInfo}>
            <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>📋 কোর্সের মূল তথ্য</h2>

              <div className="form-group">
                <label className="form-label">কোর্সের শিরোনাম *</label>
                <input
                  type="text"
                  className="form-input"
                  value={infoForm.title}
                  onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">বিবরণ *</label>
                <textarea
                  className="form-input"
                  value={infoForm.description}
                  onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                  style={{ minHeight: "100px" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">কোর্স ফি (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={infoForm.price}
                    onChange={(e) => setInfoForm({ ...infoForm, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ডিসকাউন্ট মূল্য (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="ঐচ্ছিক"
                    value={infoForm.discountPrice}
                    onChange={(e) => setInfoForm({ ...infoForm, discountPrice: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>🎥 প্রোমো ভিডিও</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                শিক্ষার্থীরা কোর্স কেনার আগে এই ভিডিওটি দেখতে পারবে।
                <br />
                <strong>গ্রহণযোগ্য URL:</strong> YouTube লিঙ্ক, Bunny Stream, বা সরাসরি MP4 URL
              </p>
              <input
                type="url"
                className="form-input"
                placeholder="যেমন: https://youtu.be/abcdef123 বা https://example.com/video.mp4"
                value={infoForm.promoVideoUrl}
                onChange={(e) => setInfoForm({ ...infoForm, promoVideoUrl: e.target.value })}
                style={{ marginBottom: "1rem" }}
              />

              {/* Preview */}
              {infoForm.promoVideoUrl && (
                <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  {(() => {
                    const embedUrl = getYoutubeEmbedUrl(infoForm.promoVideoUrl);
                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          allowFullScreen
                          style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                        />
                      );
                    }
                    return (
                      <video
                        src={infoForm.promoVideoUrl}
                        controls
                        style={{ width: "100%", aspectRatio: "16/9", display: "block" }}
                      />
                    );
                  })()}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "সংরক্ষণ হচ্ছে..." : "💾 তথ্য সংরক্ষণ করুন"}
            </button>
          </form>
        )}

        {/* ══ SYLLABUS TAB ══ */}
        {activeTab === "syllabus" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>
                📂 অধ্যায় ও লেকচার ({course?.chapters.length || 0} অধ্যায়)
              </h2>
              <button onClick={() => setShowChapterModal(true)} className="btn btn-secondary btn-sm">
                + নতুন অধ্যায়
              </button>
            </div>

            {course?.chapters.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
                <p>এখনো কোনো অধ্যায় নেই। প্রথম অধ্যায়টি যোগ করুন।</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {course?.chapters.map((chapter, idx) => (
                  <div key={chapter.id} className="card" style={{ padding: "1.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "2px solid var(--border-color)",
                        paddingBottom: "1rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1.1rem" }}>
                        <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>
                          ধাপ {idx + 1}:
                        </span>
                        {chapter.title}
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.75rem", fontWeight: 400 }}>
                          ({chapter.lessons.length} লেকচার)
                        </span>
                      </h3>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setLessonForm({ ...lessonForm, chapterId: chapter.id, chapterTitle: chapter.title });
                          setShowLessonModal(true);
                        }}
                      >
                        + লেকচার যোগ করুন
                      </button>
                    </div>

                    {chapter.lessons.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "1rem", fontStyle: "italic" }}>
                        এই অধ্যায়ে কোনো লেকচার যোগ করা হয়নি।
                      </p>
                    ) : (
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {chapter.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.75rem 1rem",
                              background: "var(--bg-primary)",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-color)",
                              gap: "1rem",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                              <span>
                                {lesson.type === "VIDEO" ? "🎥" : lesson.type === "PDF" ? "📄" : "⚡"}
                              </span>
                              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{lesson.title}</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                ({lesson.type === "VIDEO" ? "ভিডিও" : lesson.type === "PDF" ? "পিডিএফ" : "লাইভ"})
                              </span>
                              {lesson.isFreePreview && (
                                <span
                                  style={{
                                    background: "#f0fdf4",
                                    color: "var(--success)",
                                    borderRadius: "999px",
                                    padding: "0.1rem 0.5rem",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  ফ্রি প্রিভিউ
                                </span>
                              )}
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                              title={lesson.contentUrl}
                            >
                              {lesson.contentUrl}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Chapter modal */}
            {showChapterModal && (
              <div
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)", padding: "1rem" }}
                onClick={() => setShowChapterModal(false)}
              >
                <div className="card" style={{ padding: "2rem", maxWidth: "450px", width: "100%", animation: "slideDown 0.3s ease" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3>নতুন অধ্যায় যোগ করুন</h3>
                    <button onClick={() => setShowChapterModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--text-muted)" }}>✕</button>
                  </div>
                  <form onSubmit={handleAddChapter}>
                    <div className="form-group">
                      <label className="form-label">অধ্যায়ের নাম *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="যেমন: গদ্যাংশ বিশ্লেষণ"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
                      <button type="button" onClick={() => setShowChapterModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>বাতিল</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                        {saving ? "..." : "যোগ করুন"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Lesson modal */}
            {showLessonModal && (
              <div
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)", padding: "1rem", overflowY: "auto" }}
                onClick={() => setShowLessonModal(false)}
              >
                <div className="card" style={{ padding: "2rem", maxWidth: "550px", width: "100%", animation: "slideDown 0.3s ease", margin: "auto" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div>
                      <h3>লেকচার যোগ করুন</h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>অধ্যায়: {lessonForm.chapterTitle}</p>
                    </div>
                    <button onClick={() => setShowLessonModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--text-muted)" }}>✕</button>
                  </div>

                  <form onSubmit={handleAddLesson}>
                    <div className="form-group">
                      <label className="form-label">লেকচারের নাম *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="যেমন: সোনার তরী - মূলভাব বিশ্লেষণ"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        autoFocus
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label">কনটেন্টের ধরন *</label>
                        <select
                          className="form-select"
                          value={lessonForm.type}
                          onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                          required
                        >
                          <option value="VIDEO">🎥 রেকর্ডেড ভিডিও</option>
                          <option value="PDF">📄 পিডিএফ লেকচার শিট</option>
                          <option value="LIVE">⚡ লাইভ ক্লাস সেশন</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "0.5rem" }}>
                          <input
                            type="checkbox"
                            checked={lessonForm.isFreePreview}
                            onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                            style={{ accentColor: "var(--primary)" }}
                          />
                          <span className="form-label" style={{ marginBottom: 0 }}>ফ্রি ট্রায়াল প্রিভিউ</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {lessonForm.type === "VIDEO"
                          ? "ভিডিও URL *"
                          : lessonForm.type === "PDF"
                          ? "পিডিএফ URL *"
                          : "লাইভ ক্লাস URL (placeholder) *"}
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder={
                          lessonForm.type === "VIDEO"
                            ? "https://youtu.be/... বা https://example.com/video.mp4"
                            : lessonForm.type === "PDF"
                            ? "https://drive.google.com/... বা https://example.com/file.pdf"
                            : "https://meet.google.com/... (শিডিউল ট্যাব থেকে পরেও যোগ করতে পারবেন)"
                        }
                        value={lessonForm.contentUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                        required
                      />
                      {/* URL guide */}
                      {lessonForm.type === "VIDEO" && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                          💡 <strong>YouTube:</strong> youtu.be/ID বা youtube.com/watch?v=ID &nbsp;|&nbsp;
                          <strong>Bunny Stream:</strong> iframe.mediadelivery.net/embed/... &nbsp;|&nbsp;
                          <strong>MP4:</strong> সরাসরি .mp4 লিঙ্ক
                        </p>
                      )}
                      {lessonForm.type === "PDF" && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                          💡 <strong>Google Drive:</strong> ফাইল শেয়ার করে /view লিঙ্ক দিন &nbsp;|&nbsp;
                          <strong>সরাসরি:</strong> .pdf এক্সটেনশন সহ URL
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
                      <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>বাতিল</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                        {saving ? "..." : "সংরক্ষণ করুন"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ QUIZ TAB ══ */}
        {activeTab === "quiz" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>📝 কুইজ নির্মাতা</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.75rem" }}>
              যেকোনো ভিডিও বা পিডিএফ লেসনে MCQ কুইজ যোগ করুন। শিক্ষার্থীরা লেকচার দেখার পরে কুইজটি দিতে পারবে।
            </p>

            {allLessons.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                প্রথমে "অধ্যায় ও লেকচার" ট্যাবে গিয়ে লেকচার যোগ করুন।
              </div>
            ) : (
              <form onSubmit={handleAddQuiz}>
                <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                  <div className="form-group">
                    <label className="form-label">কোন লেসনে কুইজ যোগ করবেন? *</label>
                    <select
                      className="form-select"
                      value={quizLessonId}
                      onChange={(e) => setQuizLessonId(parseInt(e.target.value))}
                      required
                    >
                      <option value={0}>— লেসন বাছুন —</option>
                      {allLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.chapterTitle} → {l.type === "VIDEO" ? "🎥" : l.type === "PDF" ? "📄" : "⚡"} {l.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">কুইজের শিরোনাম *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="যেমন: সোনার তরী - লেসন মূল্যায়ন কুইজ"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className="card" style={{ padding: "1.75rem", borderLeft: "4px solid var(--primary)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h4 style={{ fontSize: "1rem" }}>প্রশ্ন {qi + 1}</h4>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuizQuestions((prev) => prev.filter((_, i) => i !== qi))}
                            style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.85rem" }}
                          >
                            ✕ সরান
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">প্রশ্নের টেক্সট *</label>
                        <textarea
                          className="form-input"
                          placeholder="প্রশ্নটি লিখুন..."
                          value={q.text}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qi] = { ...updated[qi], text: e.target.value };
                            setQuizQuestions(updated);
                          }}
                          style={{ minHeight: "60px" }}
                          required
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={q.correctOption === oi}
                              onChange={() => {
                                const updated = [...quizQuestions];
                                updated[qi] = { ...updated[qi], correctOption: oi };
                                setQuizQuestions(updated);
                              }}
                              style={{ accentColor: "var(--success)", flexShrink: 0 }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`${["ক", "খ", "গ", "ঘ"][oi]} বিকল্প *`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...quizQuestions];
                                updated[qi].options[oi] = e.target.value;
                                setQuizQuestions([...updated]);
                              }}
                              style={{ flex: 1, padding: "0.5rem" }}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        ☝️ রেডিও বাটনে ক্লিক করুন সঠিক উত্তর চিহ্নিত করতে (সবুজ = সঠিক)
                      </p>

                      <div className="form-group">
                        <label className="form-label">ব্যাখ্যা (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="কেন এটি সঠিক উত্তর..."
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qi] = { ...updated[qi], explanation: e.target.value };
                            setQuizQuestions(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setQuizQuestions([...quizQuestions, { text: "", options: ["", "", "", ""], correctOption: 0, explanation: "" }])
                    }
                    className="btn btn-secondary"
                  >
                    + আরো প্রশ্ন যোগ করুন
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "সংরক্ষণ হচ্ছে..." : "💾 কুইজ সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ══ SCHEDULE TAB ══ */}
        {activeTab === "schedule" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>⚡ লাইভ ক্লাসের শিডিউল</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.75rem" }}>
              "LIVE" টাইপের লেসনে শুরু/শেষের সময় এবং Zoom / Google Meet লিঙ্ক যোগ করুন।
            </p>

            {liveLessons.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚡</div>
                <p>কোনো "লাইভ" টাইপের লেসন পাওয়া যায়নি।</p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                  "অধ্যায় ও লেকচার" ট্যাবে গিয়ে লেসন টাইপ "লাইভ ক্লাস সেশন" বাছুন।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddSchedule}>
                <div className="card" style={{ padding: "2rem" }}>
                  <div className="form-group">
                    <label className="form-label">কোন লাইভ লেসন? *</label>
                    <select
                      className="form-select"
                      value={scheduleLessonId}
                      onChange={(e) => setScheduleLessonId(parseInt(e.target.value))}
                      required
                    >
                      <option value={0}>— লাইভ লেসন বাছুন —</option>
                      {liveLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.chapterTitle} → ⚡ {l.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">শুরুর সময় *</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">শেষের সময় *</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">যোগ দেওয়ার লিঙ্ক (Zoom / Google Meet) *</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://meet.google.com/... বা https://zoom.us/j/..."
                      value={scheduleForm.joinUrl}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, joinUrl: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "সংরক্ষণ হচ্ছে..." : "⚡ শিডিউল যোগ করুন"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ══ PUBLISH TAB ══ */}
        {activeTab === "publish" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.75rem" }}>🚀 প্রকাশনা ও পর্যালোচনা</h2>

            <div className="card" style={{ padding: "2.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>কোর্সের বর্তমান অবস্থা</h3>

              {/* Status overview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "মোট অধ্যায়", value: course?.chapters.length || 0, ok: (course?.chapters.length || 0) > 0 },
                  { label: "মোট লেকচার", value: allLessons.length, ok: allLessons.length > 0 },
                  { label: "প্রোমো ভিডিও", value: course?.promoVideoUrl ? "আছে" : "নেই", ok: !!course?.promoVideoUrl },
                  { label: "অবস্থা", value: st.label, ok: course?.status === "PUBLISHED" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "1.25rem",
                      background: item.ok ? "#f0fdf4" : "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${item.ok ? "var(--success)" : "var(--border-color)"}`,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: item.ok ? "var(--success)" : "var(--text-muted)",
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {course?.status === "DRAFT" && (
                <div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>
                    কোর্সটি এখনো <strong>ড্রাফট</strong> অবস্থায় আছে। অ্যাডমিনের অনুমোদনের পরে এটি পাবলিক হবে।
                    সাবমিট করার আগে নিশ্চিত করুন — সব অধ্যায় ও লেকচার যোগ করা হয়েছে।
                  </p>
                  <button onClick={handleSubmitForReview} className="btn btn-primary" disabled={saving}>
                    {saving ? "পাঠানো হচ্ছে..." : "📤 অ্যাডমিনের কাছে পর্যালোচনার জন্য পাঠান"}
                  </button>
                </div>
              )}

              {course?.status === "PENDING" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#fef9c3",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #fbbf24",
                    color: "#854d0e",
                  }}
                >
                  ⏳ কোর্সটি বর্তমানে পর্যালোচনাধীন। অ্যাডমিন অনুমোদন দিলে স্বয়ংক্রিয়ভাবে প্রকাশিত হবে।
                </div>
              )}

              {course?.status === "PUBLISHED" && (
                <div
                  style={{
                    padding: "1.25rem",
                    background: "#f0fdf4",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--success)",
                    color: "#15803d",
                  }}
                >
                  ✅ কোর্সটি সফলভাবে প্রকাশিত হয়েছে এবং শিক্ষার্থীরা ভর্তি হতে পারছে।
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3 style={{ marginBottom: "1.25rem", fontSize: "1.05rem" }}>✅ পর্যালোচনার আগে চেকলিস্ট</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { ok: !!course?.title, label: "কোর্সের শিরোনাম যোগ করা হয়েছে" },
                  { ok: !!course?.description, label: "কোর্সের বিবরণ লেখা হয়েছে" },
                  { ok: (course?.price || 0) > 0, label: "কোর্স ফি নির্ধারণ করা হয়েছে" },
                  { ok: !!course?.promoVideoUrl, label: "প্রোমো ভিডিও URL যোগ করা হয়েছে" },
                  { ok: (course?.chapters.length || 0) > 0, label: "কমপক্ষে একটি অধ্যায় যোগ করা হয়েছে" },
                  { ok: allLessons.length >= 3, label: "কমপক্ষে ৩টি লেকচার যোগ করা হয়েছে" },
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      fontSize: "0.9rem",
                      color: item.ok ? "var(--success)" : "var(--text-secondary)",
                    }}
                  >
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.ok ? "✅" : "⬜"}</span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
