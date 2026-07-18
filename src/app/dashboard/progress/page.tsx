"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Lesson {
  id: number;
  title: string;
  type: string;
  completed: boolean;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseProgress {
  id: number;
  title: string;
  classLevel: string;
  paper: string;
  chapters: Chapter[];
}

interface StudentDetails {
  name: string;
  email: string;
  phone: string;
}

function ProgressTrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId"); // Optional (for teacher/admin view)

  const [progress, setProgress] = useState<{
    course: CourseProgress;
    completedCount: number;
    totalCount: number;
    progressPercent: number;
    studentDetails: StudentDetails | null;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      setError("কোর্স আইডি পাওয়া যায়নি।");
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        const url = new URL("/api/dashboard/progress", window.location.origin);
        url.searchParams.set("courseId", courseId!);
        if (studentId) {
          url.searchParams.set("studentId", studentId);
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error("অগ্রগতি তথ্য লোড করতে ব্যর্থ হয়েছে।");
        }
        const data = await res.json();
        if (data.success) {
          setProgress(data);
        } else {
          setError(data.error || "একটি সমস্যা হয়েছে।");
        }
      } catch (err) {
        setError("সংযোগ বিচ্ছিন্ন হয়েছে। পুনরায় চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [courseId, studentId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 45, height: 45, border: "3px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>অগ্রগতি বিশ্লেষণ লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="container" style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2>{error || "তথ্য পাওয়া যায়নি"}</h2>
        <button onClick={() => router.back()} className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          ফিরে যান
        </button>
      </div>
    );
  }

  const { course, completedCount, totalCount, progressPercent, studentDetails } = progress;
  const isComplete = progressPercent >= 100;

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "85vh", padding: "2rem 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.95rem" }}
        >
          ← পূর্ববর্তী পৃষ্ঠায় ফিরুন
        </button>

        {/* Header Summary Card */}
        <div className="card" style={{ padding: "2.25rem", position: "relative", overflow: "hidden", marginBottom: "2rem" }}>
          {/* Decorative background accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: "linear-gradient(135deg, rgba(188, 75, 47, 0.1) 0%, rgba(227, 167, 48, 0.1) 100%)", borderRadius: "0 0 0 100%", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: "bold", textTransform: "uppercase" }}>
                {course.classLevel} • {course.paper} পত্র
              </span>
              <h1 style={{ fontSize: "1.8rem", color: "var(--maroon)", marginTop: "0.75rem", marginBottom: "0.5rem", fontWeight: "800" }}>
                {course.title}
              </h1>
              {studentDetails ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  👨‍🎓 শিক্ষার্থী: <strong>{studentDetails.name}</strong> ({studentDetails.phone})
                </p>
              ) : (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  আপনার বাংলা বিষয়ের সামগ্রিক অগ্রগতি ট্র্যাক করুন
                </p>
              )}
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: isComplete ? "var(--success)" : "var(--primary)", lineHeight: 1 }}>
                {Math.round(progressPercent)}%
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                সম্পন্ন হয়েছে ({completedCount}/{totalCount} লেকচার)
              </div>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div style={{ marginTop: "2rem" }}>
            <div style={{ height: "12px", background: "var(--bg-tertiary)", borderRadius: "999px", overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${progressPercent}%`, 
                  background: isComplete ? "linear-gradient(90deg, #16a34a, #4ade80)" : "linear-gradient(90deg, var(--primary), var(--clay))", 
                  borderRadius: "999px",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                }} 
              />
            </div>
          </div>

          {isComplete && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderRadius: "var(--radius-md)", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏆</span>
              <div>
                <strong style={{ color: "#15803d", display: "block" }}>অভিনন্দন! আপনি পুরো কোর্স সম্পন্ন করেছেন।</strong>
                <span style={{ fontSize: "0.8rem", color: "#166534" }}>এখন ড্যাশবোর্ড থেকে আপনার সার্টিফিকেট ডাউনলোড করতে পারবেন।</span>
              </div>
            </div>
          )}
        </div>

        {/* Chapter & Lesson Breakdown */}
        <h2 style={{ fontSize: "1.25rem", color: "var(--maroon)", marginBottom: "1.25rem", fontWeight: "700" }}>
          📖 অধ্যায় ও লেকচার সমূহের অগ্রগতি
        </h2>

        {course.chapters.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            এই কোর্সে কোনো অধ্যায় যুক্ত করা হয়নি।
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {course.chapters.map((chapter) => {
              const chapterTotal = chapter.lessons.length;
              const chapterCompleted = chapter.lessons.filter(l => l.completed).length;
              const chapterPct = chapterTotal > 0 ? (chapterCompleted / chapterTotal) * 100 : 0;
              
              return (
                <div key={chapter.id} className="card" style={{ padding: "1.5rem 1.75rem" }}>
                  {/* Chapter Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: "700", color: "var(--maroon)" }}>
                        {chapter.title}
                      </h3>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        লেকচার সম্পন্ন: {chapterCompleted}/{chapterTotal}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>
                        {Math.round(chapterPct)}%
                      </span>
                      <div style={{ width: "80px", height: "6px", background: "var(--bg-tertiary)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${chapterPct}%`, background: "var(--primary)", borderRadius: "999px" }} />
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {chapter.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "0.6rem 0.85rem", 
                          background: lesson.completed ? "rgba(22, 163, 74, 0.04)" : "var(--bg-secondary)", 
                          borderRadius: "var(--radius-sm)",
                          border: lesson.completed ? "1px solid rgba(22, 163, 74, 0.15)" : "1px solid transparent"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                          <span style={{ fontSize: "1.1rem" }}>
                            {lesson.type === "VIDEO" ? "🎥" : lesson.type === "PDF" ? "📄" : "⚡"}
                          </span>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: lesson.completed ? "600" : "normal" }}>
                            {lesson.title}
                          </span>
                        </div>
                        
                        <div>
                          {lesson.completed ? (
                            <span style={{ background: "rgba(22, 163, 74, 0.15)", color: "#16a34a", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "bold" }}>
                              ✅ সম্পন্ন
                            </span>
                          ) : (
                            <span style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-muted)", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.72rem" }}>
                              ⏳ অধীত নয়
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgressTrackerPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <h3>অগ্রগতি বিশ্লেষক লোড হচ্ছে...</h3>
      </div>
    }>
      <ProgressTrackerContent />
    </Suspense>
  );
}
