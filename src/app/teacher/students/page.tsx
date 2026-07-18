"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  title: string;
  classLevel: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  className?: string;
  institution?: string;
}

interface Enrollment {
  enrollmentId: number;
  student: Student;
  course: Course;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  status: string;
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.status === 401) {
          router.push("/login?redirect=/teacher/students");
          return;
        }
        const meData = await meRes.json();
        if (!meData.success || meData.user.role !== "TEACHER") {
          router.push("/login?redirect=/teacher/students");
          return;
        }
        setTeacherName(meData.user.name);

        const url = new URL("/api/teacher/students", window.location.origin);
        if (selectedCourseId) {
          url.searchParams.set("courseId", selectedCourseId);
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error("শিক্ষার্থীদের অগ্রগতি লোড করতে ব্যর্থ হয়েছে।");
        }
        const data = await res.json();
        if (data.success) {
          setEnrollments(data.enrollments || []);
          if (courses.length === 0) {
            setCourses(data.courses || []);
          }
        } else {
          setError(data.error || "সমস্যা হয়েছে।");
        }
      } catch (err) {
        setError("সংযোগ বিচ্ছিন্ন হয়েছে। পুনরায় চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, selectedCourseId, courses.length]);

  if (loading && enrollments.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ width: 56, height: 56, border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>অগ্রগতি তালিকা লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "85vh", padding: "2.5rem 0" }}>
      <div className="container">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push("/teacher/dashboard")} 
          style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.95rem" }}
        >
          ← ড্যাশবোর্ডে ফিরুন
        </button>

        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", color: "var(--maroon)", fontWeight: "800", margin: 0 }}>
              🧑‍🎓 শিক্ষার্থীদের অগ্রগতি ট্র্যাকার
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              আপনার কোর্সের শিক্ষার্থীদের অগ্রগতি পর্যবেক্ষণ করুন (শিক্ষক: {teacherName})
            </p>
          </div>

          {/* Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              ফিল্টার করুন:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setLoading(true);
              }}
              className="form-select"
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", width: "auto", minWidth: "220px" }}
            >
              <option value="">সকল কোর্স</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.classLevel}] {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "2rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Students Table Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          {enrollments.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
              <p>কোনো শিক্ষার্থী ভর্তি নেই অথবা এই ফিল্টারে কোনো তথ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-responsive">
                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-color)" }}>
                      <th style={{ padding: "0.85rem" }}>শিক্ষার্থী</th>
                      <th style={{ padding: "0.85rem" }}>কোর্স</th>
                      <th style={{ padding: "0.85rem" }}>অগ্রগতি</th>
                      <th style={{ padding: "0.85rem" }}>ভর্তির তারিখ</th>
                      <th style={{ padding: "0.85rem", textAlign: "right" }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((en) => {
                      const pct = Math.round(en.progressPercent);
                      const isComplete = pct >= 100;
                      
                      return (
                        <tr key={en.enrollmentId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "1rem 0.85rem" }}>
                            <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                              {en.student.name}
                            </strong>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              📞 {en.student.phone} | {en.student.email}
                            </div>
                            {en.student.institution && (
                              <div style={{ fontSize: "0.78rem", color: "var(--clay)", marginTop: "0.1rem" }}>
                                🏫 {en.student.institution}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "1rem 0.85rem" }}>
                            <span style={{ fontSize: "0.9rem" }}>{en.course.title}</span>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              {en.course.classLevel}
                            </div>
                          </td>
                          <td style={{ padding: "1rem 0.85rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: isComplete ? "var(--success)" : "var(--primary)" }}>
                                {pct}%
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                ({en.completedLessons}/{en.totalLessons})
                              </span>
                            </div>
                            <div style={{ width: "120px", height: "6px", background: "var(--bg-tertiary)", borderRadius: "999px", overflow: "hidden", marginTop: "0.35rem" }}>
                              <div 
                                style={{ 
                                  height: "100%", 
                                  width: `${pct}%`, 
                                  background: isComplete ? "#16a34a" : "var(--primary)", 
                                  borderRadius: "999px" 
                                }} 
                              />
                            </div>
                          </td>
                          <td style={{ padding: "1rem 0.85rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {new Date(en.enrolledAt).toLocaleDateString("bn-BD", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td style={{ padding: "1rem 0.85rem", textAlign: "right" }}>
                            <a
                              href={`/dashboard/progress?courseId=${en.course.id}&studentId=${en.student.id}`}
                              className="btn btn-outline btn-sm"
                              style={{ 
                                textDecoration: "none", 
                                display: "inline-block", 
                                fontSize: "0.8rem", 
                                padding: "0.35rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--primary)",
                                color: "var(--primary)",
                                fontWeight: "bold"
                              }}
                            >
                              বিশদ বিবরণ 🔍
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
