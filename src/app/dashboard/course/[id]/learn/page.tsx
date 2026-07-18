"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
interface LiveClass {
  id: number;
  startTime: string;
  endTime: string;
  joinUrl: string;
  recordingUrl: string | null;
}

interface Question {
  id: number;
  text: string;
  optionsJson: string;
  correctOption: number;
  explanation: string | null;
  marks: number;
}

interface Quiz {
  id: number;
  title: string;
  type: string;
  timeLimit: number;
  questions: Question[];
}

interface Lesson {
  id: number;
  title: string;
  type: string;
  contentUrl: string;
  isFreePreview: boolean;
  order: number;
  liveClasses: LiveClass[];
  quizzes: Quiz[];
}

interface Chapter {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetails {
  id: number;
  title: string;
  chapters: Chapter[];
}

/* ─── Live Countdown Component ────────────────────── */
function LiveCountdown({ startTime, endTime }: { startTime: string; endTime: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diff = start - now;
  const isLive = now >= start && now <= end;
  const isOver = now > end;

  if (isOver) {
    return (
      <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", fontSize: "0.9rem" }}>
        ⏹️ এই ক্লাসটি শেষ হয়ে গেছে।
      </p>
    );
  }

  if (isLive) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#dc2626",
          color: "#fff",
          borderRadius: "999px",
          padding: "0.35rem 1rem",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginTop: "0.75rem",
          animation: "pulse 1.5s infinite",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#fff",
            display: "inline-block",
            animation: "blink 1s infinite",
          }}
        />
        এখন লাইভ চলছে!
      </div>
    );
  }

  // Countdown
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return (
    <div style={{ marginTop: "1rem" }}>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
        ক্লাস শুরু হবে:
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { val: d, label: "দিন" },
          { val: h, label: "ঘণ্টা" },
          { val: m, label: "মিনিট" },
          { val: s, label: "সেকেন্ড" },
        ].map((unit) => (
          <div
            key={unit.label}
            style={{
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              textAlign: "center",
              minWidth: "64px",
            }}
          >
            <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
              {String(unit.val).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.65rem", opacity: 0.85, marginTop: "0.2rem" }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function LessonPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Doubt states
  const [doubtText, setDoubtText] = useState("");
  const [doubtStatusMsg, setDoubtStatusMsg] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);

  // Mark complete states
  const [markLoading, setMarkLoading] = useState(false);
  const [completionBanner, setCompletionBanner] = useState(false);

  useEffect(() => {
    async function loadSyllabus() {
      try {
        setLoading(true);

        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId =
            typeof window !== "undefined" && window.crypto?.randomUUID
              ? window.crypto.randomUUID()
              : Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem("device_id", deviceId);
        }

        const res = await fetch(`/api/courses/detail-by-id/${courseId}`, {
          headers: { "x-device-id": deviceId },
        });
        const data = await res.json();

        if (res.status === 403) {
          setError(data.error || "এই কোর্সটি অন্য একটি ডিভাইসে লক করা আছে।");
          return;
        }
        if (res.status === 401) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        if (data.success) {
          setCourse(data.course);
          setCompletedLessonIds(data.completedLessonIds || []);
          if (data.course.chapters.length > 0 && data.course.chapters[0].lessons.length > 0) {
            setActiveLesson(data.course.chapters[0].lessons[0]);
          }
        } else {
          setError(data.error || "সিলেবাস লোড করতে ব্যর্থ হয়েছে।");
        }
      } catch {
        setError("তথ্য লোড করার সময় সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    loadSyllabus();
  }, [courseId, router]);

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizSubmitted(false);
    setDoubtText("");
    setDoubtStatusMsg("");
    setCompletionBanner(false);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const handleQuizSubmit = async (quizId: number) => {
    if (Object.keys(quizAnswers).length === 0) {
      alert("কমপক্ষে একটি উত্তর দিন।");
      return;
    }
    try {
      setQuizLoading(true);
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data);
        setQuizSubmitted(true);
      } else {
        alert(data.error || "কুইজ মূল্যায়ন করা সম্ভব হয়নি।");
      }
    } catch {
      alert("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || completedLessonIds.includes(activeLesson.id)) return;
    try {
      setMarkLoading(true);
      const res = await fetch(`/api/lessons/${activeLesson.id}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
        if (data.isCompletedNow) {
          setCompletionBanner(true);
        }
      } else {
        alert(data.error || "লেসন সম্পন্ন মার্ক করা যায়নি।");
      }
    } catch {
      alert("সংযোগ ত্রুটি। পুনরায় চেষ্টা করুন।");
    } finally {
      setMarkLoading(false);
    }
  };

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !doubtText.trim()) return;
    try {
      setDoubtLoading(true);
      const res = await fetch(`/api/doubts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id, questionText: doubtText }),
      });
      const data = await res.json();
      if (data.success) {
        setDoubtStatusMsg("✓ আপনার জিজ্ঞাসাটি সফলভাবে শিক্ষকের কাছে পাঠানো হয়েছে।");
        setDoubtText("");
        setTimeout(() => setDoubtStatusMsg(""), 5000);
      } else {
        alert(data.error || "জিজ্ঞাসা পোস্ট করতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("নেটওয়ার্ক ত্রুটি।");
    } finally {
      setDoubtLoading(false);
    }
  };

  // Total lessons for progress
  const totalLessons = course?.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0) ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

  /* ─── Loading / Error States ────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            border: "4px solid var(--primary-light)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-secondary)" }}>কোর্স লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2>{error}</h2>
        <a href="/dashboard" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          ড্যাশবোর্ডে ফিরে যান
        </a>
      </div>
    );
  }

  /* ─── Render ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .lesson-item:hover { background: var(--primary-light) !important; }
      `}</style>

      {/* Completion Banner */}
      {completionBanner && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setCompletionBanner(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              padding: "3rem",
              textAlign: "center",
              maxWidth: "500px",
              animation: "slideDown 0.4s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "var(--maroon)", marginBottom: "0.75rem" }}>
              অভিনন্দন! কোর্স সম্পন্ন!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              আপনি সফলভাবে ১০০% কোর্স সম্পন্ন করেছেন। আপনার সার্টিফিকেট ড্যাশবোর্ডে পাওয়া যাবে।
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <a href="/dashboard?tab=certificates" className="btn btn-primary">
                🎓 সার্টিফিকেট দেখুন
              </a>
              <button className="btn btn-secondary" onClick={() => setCompletionBanner(false)}>
                কোর্সে থাকুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", height: "calc(100vh - 72px)", overflow: "hidden" }}>
        {/* ─── Sidebar ──────────────────────────────── */}
        <div
          style={{
            width: sidebarOpen ? "300px" : "0px",
            minWidth: sidebarOpen ? "300px" : "0px",
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-color)",
            transition: "width 0.3s ease, min-width 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div
                style={{
                  padding: "1.25rem 1.25rem 0",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "1rem",
                  position: "sticky",
                  top: 0,
                  background: "var(--bg-secondary)",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>📖 সূচিপত্র</h3>
                  <a
                    href="/dashboard"
                    style={{ fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none" }}
                  >
                    ← ড্যাশবোর্ড
                  </a>
                </div>

                {/* Overall progress */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span>মোট অগ্রগতি</span>
                    <strong
                      style={{ color: progressPct >= 100 ? "var(--success)" : "var(--primary)" }}
                    >
                      {completedLessonIds.length}/{totalLessons} ({progressPct}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background:
                          progressPct >= 100
                            ? "linear-gradient(90deg, #16a34a, #4ade80)"
                            : "linear-gradient(90deg, var(--primary), var(--clay))",
                        borderRadius: "999px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Chapters & Lessons */}
              <div style={{ padding: "1rem", flex: 1 }}>
                {course?.chapters.map((chapter, chIdx) => (
                  <div key={chapter.id} style={{ marginBottom: "1.25rem" }}>
                    <h4
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        padding: "0 0.5rem",
                      }}
                    >
                      ধাপ {chIdx + 1}: {chapter.title}
                    </h4>

                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
                      {chapter.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                          <li
                            key={lesson.id}
                            className="lesson-item"
                            onClick={() => handleSelectLesson(lesson)}
                            style={{
                              padding: "0.6rem 0.75rem",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.83rem",
                              transition: "all 0.15s",
                              background: isActive ? "var(--primary-light)" : "transparent",
                              color: isActive ? "var(--primary)" : "inherit",
                              fontWeight: isActive ? 700 : 400,
                              borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span>
                                {lesson.type === "VIDEO" ? "🎥" : lesson.type === "PDF" ? "📄" : "⚡"}
                              </span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                {lesson.title}
                              </span>
                            </span>
                            <span style={{ flexShrink: 0, fontSize: "0.85rem" }}>
                              {isCompleted ? "✅" : ""}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── Main Content Panel ────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Top Bar */}
          <div
            style={{
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              background: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.4rem 0.65rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
                title={sidebarOpen ? "সাইডবার লুকান" : "সাইডবার দেখুন"}
              >
                {sidebarOpen ? "☰" : "☰"}
              </button>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {course?.title}
              </span>
            </div>

            {activeLesson && (
              <button
                onClick={handleMarkComplete}
                className="btn btn-sm"
                disabled={completedLessonIds.includes(activeLesson.id) || markLoading}
                style={{
                  background: completedLessonIds.includes(activeLesson.id)
                    ? "var(--success-light)"
                    : "var(--primary)",
                  color: completedLessonIds.includes(activeLesson.id) ? "var(--success)" : "#fff",
                  border: "none",
                  opacity: markLoading ? 0.6 : 1,
                }}
              >
                {markLoading
                  ? "..."
                  : completedLessonIds.includes(activeLesson.id)
                  ? "✓ সম্পন্ন হয়েছে"
                  : "✓ সম্পন্ন মার্ক করুন"}
              </button>
            )}
          </div>

          {/* Content Area */}
          <div style={{ padding: "2rem", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
            {activeLesson ? (
              <div>
                {/* Lesson type badge */}
                <div style={{ marginBottom: "1rem" }}>
                  <span
                    style={{
                      background:
                        activeLesson.type === "VIDEO"
                          ? "var(--primary-light)"
                          : activeLesson.type === "PDF"
                          ? "#fef9c3"
                          : "#fce7f3",
                      color:
                        activeLesson.type === "VIDEO"
                          ? "var(--primary)"
                          : activeLesson.type === "PDF"
                          ? "#854d0e"
                          : "#9d174d",
                      borderRadius: "999px",
                      padding: "0.3rem 0.9rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeLesson.type === "VIDEO"
                      ? "🎥 ভিডিও লেকচার"
                      : activeLesson.type === "PDF"
                      ? "📄 পিডিএফ লেকচার"
                      : "⚡ লাইভ ক্লাস"}
                  </span>
                </div>

                <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", lineHeight: 1.3 }}>
                  {activeLesson.title}
                </h1>

                {/* ── Content Player ── */}
                <div
                  style={{
                    marginBottom: "2.5rem",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    background: "#000",
                  }}
                >
                  {activeLesson.type === "VIDEO" ? (
                    // VIDEO: try iframe for YouTube, fallback to <video>
                    (() => {
                      const url = activeLesson.contentUrl;
                      const ytMatch =
                        url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/) ||
                        url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/);
                      if (ytMatch) {
                        const videoId = ytMatch[1];
                        return (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                          />
                        );
                      }
                      // Direct MP4 / Bunny Stream etc.
                      return (
                        <video
                          src={url}
                          controls
                          controlsList="nodownload"
                          style={{ width: "100%", aspectRatio: "16/9", display: "block" }}
                        />
                      );
                    })()
                  ) : activeLesson.type === "PDF" ? (
                    // PDF: iframe viewer + fallback download link
                    <div style={{ background: "#f8f8f8" }}>
                      <iframe
                        src={
                          activeLesson.contentUrl.includes("drive.google.com")
                            ? activeLesson.contentUrl.replace("/view", "/preview")
                            : activeLesson.contentUrl
                        }
                        style={{ width: "100%", height: "600px", border: "none", display: "block" }}
                        title="PDF Viewer"
                      />
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "0.75rem",
                          background: "var(--bg-secondary)",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <a
                          href={activeLesson.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          ↗ নতুন ট্যাবে খুলুন
                        </a>
                        <a
                          href={activeLesson.contentUrl}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          ⬇ পিডিএফ ডাউনলোড
                        </a>
                      </div>
                    </div>
                  ) : (
                    // LIVE CLASS
                    <div
                      style={{
                        padding: "4rem 2rem",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
                        color: "#fff",
                      }}
                    >
                      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚡</div>
                      <h3 style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                        লাইভ ক্লাস সেশন
                      </h3>

                      {activeLesson.liveClasses && activeLesson.liveClasses.length > 0 ? (
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
                            সময়: {new Date(activeLesson.liveClasses[0].startTime).toLocaleString("bn-BD")}{" "}
                            — {new Date(activeLesson.liveClasses[0].endTime).toLocaleTimeString("bn-BD")}
                          </p>

                          <LiveCountdown
                            startTime={activeLesson.liveClasses[0].startTime}
                            endTime={activeLesson.liveClasses[0].endTime}
                          />

                          <a
                            href={activeLesson.liveClasses[0].joinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{
                              display: "inline-block",
                              marginTop: "1.5rem",
                              background: "#fff",
                              color: "#3730a3",
                              fontWeight: 700,
                              padding: "0.75rem 2rem",
                              borderRadius: "var(--radius-md)",
                              textDecoration: "none",
                            }}
                          >
                            ক্লাসে যোগ দিন →
                          </a>

                          {activeLesson.liveClasses[0].recordingUrl && (
                            <div style={{ marginTop: "1.5rem" }}>
                              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                                রেকর্ডিং উপলব্ধ:
                              </p>
                              <a
                                href={activeLesson.liveClasses[0].recordingUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#a5b4fc", fontSize: "0.85rem" }}
                              >
                                ▶ রেকর্ডিং দেখুন
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "1rem" }}>
                          এই লাইভ ক্লাসের কোনো শিডিউল এখনো যোগ করা হয়নি।
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Quiz Section ── */}
                {activeLesson.quizzes && activeLesson.quizzes.length > 0 && (
                  <div
                    className="card"
                    style={{ padding: "2rem", marginBottom: "2.5rem", borderLeft: "5px solid var(--primary)" }}
                  >
                    <h2 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>
                      📝 লেসন মূল্যায়ন কুইজ
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                      {activeLesson.quizzes[0].title} •{" "}
                      {activeLesson.quizzes[0].questions.length} টি প্রশ্ন
                      {activeLesson.quizzes[0].timeLimit > 0
                        ? ` • সময়সীমা: ${activeLesson.quizzes[0].timeLimit} মিনিট`
                        : ""}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                      {activeLesson.quizzes[0].questions.map((question, qIdx) => {
                        const options = JSON.parse(question.optionsJson);
                        const qResult = quizResult?.results?.find(
                          (r: any) => r.questionId === question.id
                        );

                        return (
                          <div
                            key={question.id}
                            style={{
                              borderBottom: "1px solid var(--border-color)",
                              paddingBottom: "1.5rem",
                            }}
                          >
                            <h4 style={{ marginBottom: "1rem", fontSize: "1rem", lineHeight: 1.5 }}>
                              <span
                                style={{
                                  color: "var(--primary)",
                                  fontWeight: 700,
                                  marginRight: "0.5rem",
                                }}
                              >
                                প্র{qIdx + 1}.
                              </span>
                              {question.text}
                            </h4>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {options.map((option: string, idx: number) => {
                                const isSelected = quizAnswers[question.id] === idx;
                                const isCorrectAnswer =
                                  quizSubmitted && idx === qResult?.correctOption;
                                const isWrongSelection =
                                  isSelected && quizSubmitted && !qResult?.isCorrect;

                                let bg = "var(--bg-secondary)";
                                let border = "1px solid var(--border-color)";
                                let color = "inherit";

                                if (quizSubmitted) {
                                  if (isCorrectAnswer) {
                                    bg = "#f0fdf4";
                                    border = "1px solid var(--success)";
                                    color = "#15803d";
                                  } else if (isWrongSelection) {
                                    bg = "#fef2f2";
                                    border = "1px solid #dc2626";
                                    color = "#b91c1c";
                                  }
                                } else if (isSelected) {
                                  bg = "var(--primary-light)";
                                  border = "1px solid var(--primary)";
                                  color = "var(--primary)";
                                }

                                return (
                                  <label
                                    key={idx}
                                    style={{
                                      padding: "0.75rem 1rem",
                                      border,
                                      borderRadius: "var(--radius-sm)",
                                      cursor: quizSubmitted ? "default" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.75rem",
                                      background: bg,
                                      color,
                                      transition: "all 0.15s",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${question.id}`}
                                      value={idx}
                                      checked={isSelected}
                                      onChange={() =>
                                        !quizSubmitted &&
                                        setQuizAnswers({ ...quizAnswers, [question.id]: idx })
                                      }
                                      disabled={quizSubmitted}
                                      style={{ accentColor: "var(--primary)" }}
                                    />
                                    <span>
                                      <strong style={{ marginRight: "0.5rem" }}>
                                        {["ক", "খ", "গ", "ঘ"][idx]}.
                                      </strong>
                                      {option}
                                    </span>
                                    {quizSubmitted && isCorrectAnswer && (
                                      <span style={{ marginLeft: "auto", fontWeight: 700 }}>✓</span>
                                    )}
                                    {quizSubmitted && isWrongSelection && (
                                      <span style={{ marginLeft: "auto", fontWeight: 700 }}>✗</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {quizSubmitted && qResult?.explanation && (
                              <div
                                style={{
                                  marginTop: "0.75rem",
                                  padding: "0.75rem 1rem",
                                  background: "#f0f9ff",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "0.88rem",
                                  borderLeft: "3px solid var(--primary)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                💡 <strong>ব্যাখ্যা:</strong> {qResult.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz submit / result */}
                    {!quizSubmitted ? (
                      <button
                        onClick={() => handleQuizSubmit(activeLesson.quizzes[0].id)}
                        className="btn btn-primary"
                        style={{ marginTop: "2rem" }}
                        disabled={quizLoading}
                      >
                        {quizLoading ? "মূল্যায়ন হচ্ছে..." : "কুইজ সাবমিট করুন →"}
                      </button>
                    ) : (
                      <div
                        style={{
                          marginTop: "2rem",
                          padding: "1.5rem",
                          background:
                            quizResult?.score >= quizResult?.totalMarks * 0.6
                              ? "#f0fdf4"
                              : "#fef9c3",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            ফলাফল
                          </div>
                          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>
                            <span
                              style={{
                                color:
                                  quizResult?.score >= quizResult?.totalMarks * 0.6
                                    ? "var(--success)"
                                    : "#d97706",
                              }}
                            >
                              {quizResult?.score}
                            </span>{" "}
                            / {quizResult?.totalMarks}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {quizResult?.score >= quizResult?.totalMarks * 0.6
                              ? "🎉 চমৎকার!"
                              : "আরো অনুশীলন করুন।"}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizResult(null);
                            setQuizSubmitted(false);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          🔄 আবার কুইজ দিন
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Ask a Doubt ── */}
                <div className="card" style={{ padding: "2rem" }}>
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "1.15rem" }}>
                    ❓ এই লেকচার সম্পর্কে জিজ্ঞাসা করুন
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    আপনার প্রশ্নটি শিক্ষক শীঘ্রই উত্তর দেবেন। উত্তর "জিজ্ঞাসা ও উত্তর" ট্যাবে দেখুন।
                  </p>

                  {doubtStatusMsg && (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        background: "#f0fdf4",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--success)",
                        fontSize: "0.88rem",
                        marginBottom: "1rem",
                        fontWeight: 600,
                        border: "1px solid var(--success)",
                      }}
                    >
                      {doubtStatusMsg}
                    </div>
                  )}

                  <form onSubmit={handlePostDoubt}>
                    <div className="form-group">
                      <textarea
                        className="form-input"
                        placeholder="আপনার প্রশ্নটি বিস্তারিত লিখুন (যেমন: এই লাইনের অর্থ কী?)"
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        style={{ minHeight: "90px", resize: "vertical" }}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      disabled={doubtLoading || !doubtText.trim()}
                    >
                      {doubtLoading ? "পাঠানো হচ্ছে..." : "প্রশ্ন পাঠান ✉"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "8rem 2rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
                <h3 style={{ color: "var(--text-secondary)" }}>
                  বাম পাশের সূচিপত্র থেকে একটি লেকচার বাছুন
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
