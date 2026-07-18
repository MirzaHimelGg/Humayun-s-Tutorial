"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────── */
interface Course {
  id: number;
  title: string;
  classLevel: string;
  paper: string;
  type: string;
  thumbnail: string | null;
  teacher: { name: string };
}
interface Enrollment {
  id: number;
  progressPercent: number;
  status: string;
  enrolledAt: string;
  course: Course;
}
interface OrderItem {
  quantity: number;
  unitPrice: number;
  product: { title: string };
}
interface Order {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}
interface DoubtAnswer {
  answerText: string;
  answeredAt: string;
  answeredBy: { name: string };
}
interface Doubt {
  id: number;
  questionText: string;
  status: string;
  createdAt: string;
  lesson: { title: string };
  answers: DoubtAnswer[];
}
interface Certificate {
  id: number;
  verificationCode: string;
  issuedAt: string;
  course: { title: string };
}

type Tab = "courses" | "orders" | "doubts" | "certificates";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [enRes, orRes, dbRes, cRes, meRes] = await Promise.all([
          fetch("/api/enrollments"),
          fetch("/api/orders"),
          fetch("/api/doubts"),
          fetch("/api/certificates"),
          fetch("/api/auth/me"),
        ]);

        if (enRes.status === 401) {
          router.push("/login?redirect=/dashboard");
          return;
        }

        const [enData, orData, dbData, cData, meData] = await Promise.all([
          enRes.json(),
          orRes.json(),
          dbRes.json(),
          cRes.json(),
          meRes.json(),
        ]);

        // Redirect non-students to their own dashboard
        if (meData.success && meData.user.role === "TEACHER") {
          router.push("/teacher/dashboard");
          return;
        }
        if (meData.success && meData.user.role === "ADMIN") {
          router.push("/admin/dashboard");
          return;
        }

        if (enData.success) setEnrollments(enData.enrollments || []);
        if (orData.success) setOrders(orData.orders || []);
        if (dbData.success) setDoubts(dbData.doubts || []);
        if (cData.success) setCertificates(cData.certificates || []);
        if (meData.success) setUserName(meData.user.name);
      } catch {
        setError("ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const paymentStatusColor = (s: string) =>
    ({
      PAID: "#16a34a",
      PENDING: "#d97706",
      FAILED: "#dc2626",
      REFUNDED: "#7c3aed",
    }[s] || "#6b7280");

  const orderStatusColor = (s: string) =>
    ({
      DELIVERED: "#16a34a",
      CONFIRMED: "#2563eb",
      SHIPPED: "#0891b2",
      CANCELLED: "#dc2626",
      PROCESSING: "#d97706",
      PENDING: "#d97706",
    }[s] || "#6b7280");

  const paymentLabel = (s: string) =>
    ({
      PAID: "পেইড ✓",
      PENDING: "অপেক্ষমাণ",
      FAILED: "ব্যর্থ",
      REFUNDED: "ফেরত",
    }[s] || s);

  const orderLabel = (s: string) =>
    ({
      DELIVERED: "ডেলিভার্ড ✓",
      CONFIRMED: "নিশ্চিত",
      SHIPPED: "শিপড",
      CANCELLED: "বাতিল",
      PROCESSING: "প্রক্রিয়াধীন",
      PENDING: "অপেক্ষমাণ",
    }[s] || s);

  const TABS: { id: Tab; label: string; emoji: string; count: number }[] = [
    { id: "courses", label: "আমার কোর্স", emoji: "📚", count: enrollments.length },
    { id: "orders", label: "অর্ডারসমূহ", emoji: "🛒", count: orders.length },
    { id: "doubts", label: "জিজ্ঞাসা ও উত্তর", emoji: "❓", count: doubts.length },
    { id: "certificates", label: "সার্টিফিকেট", emoji: "🎖️", count: certificates.length },
  ];

  const completedCourses = enrollments.filter((e) => e.progressPercent >= 100).length;
  const pendingDoubts = doubts.filter((d) => d.status === "OPEN").length;

  if (loading)
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
        <p style={{ color: "var(--text-secondary)" }}>ড্যাশবোর্ড লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (error)
    return (
      <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2>{error}</h2>
        <a href="/login" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          লগইন করুন
        </a>
      </div>
    );

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "80vh" }}>
      {/* ─── Hero Header ─────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--maroon) 0%, var(--clay) 100%)",
          padding: "3rem 0 0",
          color: "#fff",
        }}
      >
        <div className="container" style={{ paddingBottom: "0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>
                স্বাগতম ফিরে আসায়,
              </p>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                {userName || "শিক্ষার্থী"} 👋
              </h1>
              <p style={{ opacity: 0.75, marginTop: "0.5rem", fontSize: "0.95rem" }}>
                আপনার শিক্ষা যাত্রা চালিয়ে যান 🚀
              </p>
            </div>

            {/* Stats chips */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "ভর্তি কোর্স", value: enrollments.length, icon: "📚" },
                { label: "সম্পন্ন কোর্স", value: completedCourses, icon: "✅" },
                { label: "সার্টিফিকেট", value: certificates.length, icon: "🎓" },
                { label: "পেন্ডিং প্রশ্ন", value: pendingDoubts, icon: "❓" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1.25rem",
                    textAlign: "center",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    minWidth: "90px",
                  }}
                >
                  <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{stat.icon}</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "0.25rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.875rem 1.5rem",
                  background: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
                  color: activeTab === tab.id ? "var(--maroon)" : "rgba(255,255,255,0.8)",
                  border: "none",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                  borderBottom: activeTab === tab.id ? "none" : "2px solid transparent",
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  style={{
                    background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.25)",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "0.1rem 0.5rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─────────────────────────────── */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

        {/* ══ COURSES TAB ══ */}
        {activeTab === "courses" && (
          <div>
            {enrollments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>📚</div>
                <h3 style={{ marginBottom: "0.75rem" }}>আপনি এখনো কোনো কোর্সে ভর্তি হননি</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                  HSC ও SSC বাংলা কোর্স ব্রাউজ করুন এবং আজই শুরু করুন!
                </p>
                <a href="/courses" className="btn btn-primary">
                  কোর্স দেখুন →
                </a>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {enrollments.map((en) => {
                  const pct = Math.round(en.progressPercent);
                  const isComplete = pct >= 100;
                  return (
                    <div
                      key={en.id}
                      className="card"
                      style={{ padding: 0, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          height: "150px",
                          background: en.course.thumbnail
                            ? `url(${en.course.thumbnail}) center/cover`
                            : "linear-gradient(135deg, var(--primary) 0%, var(--clay) 100%)",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.38)",
                            display: "flex",
                            alignItems: "flex-end",
                            padding: "1rem",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(255,255,255,0.2)",
                              color: "#fff",
                              borderRadius: "999px",
                              padding: "0.2rem 0.65rem",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            {en.course.classLevel} • {en.course.paper} পত্র •{" "}
                            {en.course.type === "LIVE" ? "লাইভ" : "রেকর্ডেড"}
                          </span>
                        </div>
                        {isComplete && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0.75rem",
                              right: "0.75rem",
                              background: "var(--success)",
                              color: "#fff",
                              borderRadius: "999px",
                              padding: "0.25rem 0.65rem",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                            }}
                          >
                            ✓ সম্পন্ন
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem", lineHeight: 1.4 }}>
                          {en.course.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "1rem",
                          }}
                        >
                          শিক্ষক: {en.course.teacher?.name || ""}
                        </p>

                        {/* Progress bar */}
                        <div style={{ marginBottom: "1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.78rem",
                              marginBottom: "0.35rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <span>অগ্রগতি</span>
                            <strong
                              style={{ color: isComplete ? "var(--success)" : "var(--primary)" }}
                            >
                              {pct}%
                            </strong>
                          </div>
                          <div
                            style={{
                              height: "8px",
                              background: "var(--bg-tertiary)",
                              borderRadius: "999px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: isComplete
                                  ? "linear-gradient(90deg, #16a34a, #4ade80)"
                                  : "linear-gradient(90deg, var(--primary), var(--clay))",
                                borderRadius: "999px",
                                transition: "width 0.8s ease",
                              }}
                            />
                          </div>
                        </div>

                        <a
                          href={`/dashboard/course/${en.course.id}/learn`}
                          className="btn btn-primary"
                          style={{ width: "100%", textAlign: "center", display: "block", padding: "0.65rem" }}
                        >
                          {pct === 0
                            ? "🚀 কোর্স শুরু করুন"
                            : isComplete
                            ? "🔄 পুনরায় দেখুন"
                            : "▶ চালিয়ে যান"}
                        </a>

                        <a
                          href={`/dashboard/progress?courseId=${en.course.id}`}
                          className="btn btn-outline"
                          style={{ width: "100%", textAlign: "center", display: "block", padding: "0.5rem", marginTop: "0.5rem", fontSize: "0.82rem", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                        >
                          📈 বিষদ অগ্রগতি বিশ্লেষণ
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {activeTab === "orders" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🛒</div>
                <h3 style={{ marginBottom: "0.75rem" }}>কোনো অর্ডার নেই</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                  বইয়ের দোকান থেকে বই অর্ডার করুন।
                </p>
                <a href="/store" className="btn btn-primary">
                  বইয়ের দোকান →
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {orders.map((order) => (
                  <div key={order.id} className="card" style={{ padding: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                          অর্ডার #{order.id}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            marginLeft: "0.75rem",
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            background: paymentStatusColor(order.paymentStatus) + "22",
                            color: paymentStatusColor(order.paymentStatus),
                            borderRadius: "999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          💳 {paymentLabel(order.paymentStatus)}
                        </span>
                        <span
                          style={{
                            background: orderStatusColor(order.orderStatus) + "22",
                            color: orderStatusColor(order.orderStatus),
                            borderRadius: "999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          📦 {orderLabel(order.orderStatus)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "1rem",
                      }}
                    >
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.9rem",
                            padding: "0.35rem 0",
                          }}
                        >
                          <span>
                            • {item.product.title}{" "}
                            <span style={{ color: "var(--text-muted)" }}>(x{item.quantity})</span>
                          </span>
                          <span style={{ fontWeight: 600 }}>৳{item.unitPrice * item.quantity}</span>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "0.75rem",
                          paddingTop: "0.75rem",
                          borderTop: "1px solid var(--border-color)",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                        }}
                      >
                        <span>মোট</span>
                        <span style={{ color: "var(--accent)" }}>৳{order.totalAmount}</span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        পেমেন্ট পদ্ধতি:{" "}
                        {order.paymentMethod === "COD" ? "ক্যাশ অন ডেলিভারি" : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DOUBTS TAB ══ */}
        {activeTab === "doubts" && (
          <div style={{ maxWidth: "750px", margin: "0 auto" }}>
            {doubts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>💬</div>
                <h3>কোনো জিজ্ঞাসা নেই</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  লেকচার পেজ থেকে শিক্ষককে প্রশ্ন করুন।
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {doubts.map((doubt) => (
                  <div
                    key={doubt.id}
                    className="card"
                    style={{
                      padding: "1.5rem",
                      borderLeft: `4px solid ${
                        doubt.status === "ANSWERED" ? "var(--success)" : "var(--warning)"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        📖 {doubt.lesson.title}
                      </span>
                      <span
                        style={{
                          borderRadius: "999px",
                          padding: "0.2rem 0.65rem",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background:
                            doubt.status === "ANSWERED" ? "var(--success-light)" : "#fef9c3",
                          color:
                            doubt.status === "ANSWERED" ? "var(--success)" : "#854d0e",
                        }}
                      >
                        {doubt.status === "ANSWERED" ? "✓ উত্তর দেওয়া হয়েছে" : "⏳ অপেক্ষমাণ"}
                      </span>
                    </div>

                    <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                      প্রশ্ন: {doubt.questionText}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginBottom: doubt.answers.length ? "1rem" : 0,
                      }}
                    >
                      {new Date(doubt.createdAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {doubt.answers.map((ans, i) => (
                      <div
                        key={i}
                        style={{
                          background: "var(--bg-primary)",
                          borderRadius: "var(--radius-sm)",
                          padding: "1rem",
                          borderLeft: "3px solid var(--primary)",
                          marginTop: "0.5rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.35rem",
                          }}
                        >
                          <strong>{ans.answeredBy.name}</strong> এর উত্তর ·{" "}
                          {new Date(ans.answeredAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <p style={{ fontSize: "0.95rem" }}>{ans.answerText}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ CERTIFICATES TAB ══ */}
        {activeTab === "certificates" && (
          <div style={{ maxWidth: "750px", margin: "0 auto" }}>
            {certificates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎖️</div>
                <h3>কোনো সার্টিফিকেট নেই</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  কোর্সের সব লেকচার সম্পন্ন করলে স্বয়ংক্রিয়ভাবে সার্টিফিকেট পাবেন।
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="card"
                    style={{
                      padding: "2rem",
                      borderLeft: "5px solid var(--success)",
                      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
                        <h3 style={{ fontSize: "1.2rem", color: "var(--maroon)", marginBottom: "0.35rem" }}>
                          {cert.course.title}
                        </h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          প্রদান করা হয়েছে:{" "}
                          {new Date(cert.issuedAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <div
                          style={{
                            marginTop: "0.75rem",
                            background: "rgba(0,0,0,0.06)",
                            borderRadius: "var(--radius-sm)",
                            padding: "0.5rem 0.75rem",
                            display: "inline-block",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            ভেরিফিকেশন কোড:{" "}
                          </span>
                          <code
                            style={{
                              fontWeight: 700,
                              letterSpacing: "1px",
                              color: "var(--maroon)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {cert.verificationCode}
                          </code>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <a
                          href={`/certificate?code=${cert.verificationCode}`}
                          target="_blank"
                          className="btn btn-primary"
                          style={{ whiteSpace: "nowrap", textAlign: "center" }}
                        >
                          🎖️ সার্টিফিকেট দেখুন
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
