"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */
interface StatData {
  totalRevenue: number;
  courseRevenue: number;
  storeRevenue: number;
  studentCount: number;
  teacherCount: number;
  enrollmentCount: number;
  pendingApplications: number;
  pendingCourses: number;
  totalOrders: number;
}
interface AppUser {
  id: number; name: string; email: string; phone: string;
  role: string; className?: string; institution?: string;
  status: string; teacherStatus?: string; bio?: string; createdAt: string;
  _count: { enrollments: number; coursesLed: number; orders: number };
}
interface TeacherApp {
  id: number; name: string; email: string; phone: string;
  institution?: string; bio?: string; createdAt: string;
}
interface AdminOrder {
  id: number; shippingName: string; shippingPhone: string; shippingAddr: string;
  totalAmount: number; paymentStatus: string; orderStatus: string; createdAt: string;
  items: { quantity: number; unitPrice: number; product: { title: string } }[];
  user: { name: string; phone: string };
}
interface PendingCourse {
  id: number; title: string; classLevel: string; paper: string; price: number;
  discountPrice?: number; status: string; createdAt: string;
  teacher: { name: string; institution?: string };
}

type Tab = "overview" | "users" | "applications" | "courses" | "orders" | "devices";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState<StatData | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [applications, setApplications] = useState<TeacherApp[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
  const [lockedEnrollments, setLockedEnrollments] = useState<{ id: number; deviceId: string; student: { name: string; email: string; phone: string }; course: { title: string } }[]>([]);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.status === 401) { router.push("/login"); return; }
      const meData = await meRes.json();
      if (!meData.success || meData.user.role !== "ADMIN") { router.push("/login"); return; }
      setAdminName(meData.user.name);

      const [statsRes, appsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/teacher-applications"),
        fetch("/api/admin/orders-all"),
      ]);

      if (statsRes.ok) { const d = await statsRes.json(); if (d.success) setStats(d.stats); }
      if (appsRes.ok) { const d = await appsRes.json(); if (d.success) setApplications(d.applications); }
      if (ordersRes.ok) { const d = await ordersRes.json(); if (d.success) setOrders(d.orders); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (userSearch) params.set("search", userSearch);
    if (userRoleFilter) params.set("role", userRoleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) { const d = await res.json(); if (d.success) setUsers(d.users); }
  }, [userSearch, userRoleFilter]);

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/admin/courses-pending");
    if (res.ok) { const d = await res.json(); if (d.success) setPendingCourses(d.courses); }
  }, []);

  const fetchDevices = useCallback(async () => {
    const res = await fetch("/api/admin/enrollments/locked");
    if (res.ok) { const d = await res.json(); if (d.success) setLockedEnrollments(d.enrollments); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === "courses") fetchCourses(); }, [activeTab, fetchCourses]);
  useEffect(() => { if (activeTab === "devices") fetchDevices(); }, [activeTab, fetchDevices]);

  /* ─── Actions ─── */
  const handleTeacherAction = async (userId: number, action: "approve" | "reject") => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/teacher-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const d = await res.json();
      if (d.success) {
        setApplications(prev => prev.filter(a => a.id !== userId));
        if (action === "approve") {
          alert(`✅ অনুমোদন সফল! ব্যবহারকারী এখন শিক্ষক হিসেবে অ্যাক্টিভ।`);
        }
      } else {
        alert(d.error || "সমস্যা হয়েছে।");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserRole = async (userId: number, role: string, name: string) => {
    if (!confirm(`"${name}" এর ভূমিকা "${role}" করতে চান?`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const d = await res.json();
      if (d.success) { fetchUsers(); }
      else { alert(d.error || "সমস্যা হয়েছে।"); }
    } finally { setActionLoading(null); }
  };

  const handleUserStatus = async (userId: number, status: string, name: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const d = await res.json();
      if (d.success) { fetchUsers(); }
      else { alert(d.error || "সমস্যা হয়েছে।"); }
    } finally { setActionLoading(null); }
  };

  const handleCourseApprove = async (courseId: number) => {
    setActionLoading(courseId);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      const d = await res.json();
      if (d.success) {
        setPendingCourses(prev => prev.filter(c => c.id !== courseId));
        alert("কোর্স প্রকাশিত হয়েছে ✅");
      } else { alert(d.error); }
    } finally { setActionLoading(null); }
  };

  const handleOrderStatus = async (orderId: number, orderStatus: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
  };

  const handleDeviceReset = async (enrollmentId: number) => {
    if (!confirm("ডিভাইস লক রিসেট করবেন?")) return;
    setActionLoading(enrollmentId);
    try {
      const res = await fetch("/api/admin/enrollments/reset-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      const d = await res.json();
      if (d.success) { fetchDevices(); alert("ডিভাইস লক রিসেট হয়েছে।"); }
      else { alert(d.error); }
    } finally { setActionLoading(null); }
  };

  /* ─── Colors/Labels ─── */
  const roleColor = (r: string) => ({ ADMIN: "#7c3aed", TEACHER: "#2563eb", STUDENT: "#16a34a" }[r] || "#6b7280");
  const statusColor = (s: string) => s === "active" ? "#16a34a" : "#dc2626";
  const payColor = (s: string) => ({ PAID: "#16a34a", PENDING: "#d97706", FAILED: "#dc2626" }[s] || "#6b7280");
  const orderColor = (s: string) => ({ DELIVERED: "#16a34a", CONFIRMED: "#2563eb", SHIPPED: "#0891b2", CANCELLED: "#dc2626", PROCESSING: "#d97706", PENDING: "#d97706" }[s] || "#6b7280");

  const TABS: { id: Tab; label: string; emoji: string; badge?: number }[] = [
    { id: "overview", label: "সংক্ষিপ্ত চিত্র", emoji: "📊" },
    { id: "users", label: "ব্যবহারকারী", emoji: "👥" },
    { id: "applications", label: "শিক্ষক আবেদন", emoji: "🧑‍🏫", badge: applications.length },
    { id: "courses", label: "কোর্স অনুমোদন", emoji: "📖", badge: pendingCourses.length },
    { id: "orders", label: "অর্ডার", emoji: "📦" },
    { id: "devices", label: "ডিভাইস লক", emoji: "📱" },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ width: 56, height: 56, border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <p style={{ color: "var(--text-secondary)" }}>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "80vh" }}>
      {/* ─── Header ─── */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: "2.5rem 0 0", color: "#fff" }}>
        <div className="container" style={{ paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontSize: "0.82rem", opacity: 0.65, marginBottom: "0.2rem" }}>সুপার অ্যাডমিন প্যানেল</p>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0 }}>স্বাগতম, {adminName} 🛡️</h1>
              <p style={{ opacity: 0.7, marginTop: "0.35rem", fontSize: "0.9rem" }}>প্ল্যাটফর্মের সম্পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
            </div>
            {stats && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[
                  { label: "মোট আয়", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: "💰" },
                  { label: "শিক্ষার্থী", value: stats.studentCount, icon: "🎓" },
                  { label: "শিক্ষক", value: stats.teacherCount, icon: "👨‍🏫" },
                  { label: "এনরোলমেন্ট", value: stats.enrollmentCount, icon: "📚" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", padding: "0.65rem 1rem", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", minWidth: "80px" }}>
                    <div style={{ fontSize: "1rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.65rem", opacity: 0.75, marginTop: "0.15rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "0.8rem 1.25rem", background: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
                color: activeTab === tab.id ? "#312e81" : "rgba(255,255,255,0.8)", border: "none",
                borderRadius: "var(--radius-md) var(--radius-md) 0 0", cursor: "pointer",
                fontWeight: activeTab === tab.id ? 700 : 500, fontSize: "0.88rem",
                display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.2s", position: "relative",
              }}>
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "0.05rem 0.45rem", fontSize: "0.65rem", fontWeight: 700 }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && stats && (
          <div>
            {/* Revenue Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {[
                { label: "মোট আয়", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: "💰", color: "#312e81", bg: "#ede9fe" },
                { label: "কোর্স রেভিনিউ", value: `৳${stats.courseRevenue.toLocaleString()}`, icon: "📖", color: "#1d4ed8", bg: "#dbeafe" },
                { label: "বই বিক্রি", value: `৳${stats.storeRevenue.toLocaleString()}`, icon: "🛍️", color: "#0f766e", bg: "#ccfbf1" },
                { label: "মোট শিক্ষার্থী", value: `${stats.studentCount} জন`, icon: "🎓", color: "#16a34a", bg: "#dcfce7" },
                { label: "মোট শিক্ষক", value: `${stats.teacherCount} জন`, icon: "👨‍🏫", color: "#7c3aed", bg: "#f3e8ff" },
                { label: "মোট এনরোলমেন্ট", value: stats.enrollmentCount, icon: "📚", color: "#b45309", bg: "#fef3c7" },
                { label: "মোট অর্ডার", value: stats.totalOrders, icon: "📦", color: "#0e7490", bg: "#cffafe" },
                { label: "অনুমোদন অপেক্ষায়", value: stats.pendingApplications, icon: "⏳", color: "#dc2626", bg: "#fee2e2" },
              ].map(card => (
                <div key={card.label} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", fontWeight: 700 }}>⚡ দ্রুত অ্যাকশন</h2>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {[
                  { label: `${applications.length} টি শিক্ষক আবেদন`, tab: "applications" as Tab, color: "var(--primary)", urgent: applications.length > 0 },
                  { label: `${pendingCourses.length} টি কোর্স অনুমোদন`, tab: "courses" as Tab, color: "var(--clay)", urgent: pendingCourses.length > 0 },
                  { label: "ব্যবহারকারী ব্যবস্থাপনা", tab: "users" as Tab, color: "#312e81", urgent: false },
                  { label: "অর্ডার দেখুন", tab: "orders" as Tab, color: "#0e7490", urgent: false },
                ].map(a => (
                  <button key={a.label} onClick={() => setActiveTab(a.tab)} className="btn" style={{
                    background: a.urgent ? a.color : "var(--bg-secondary)",
                    color: a.urgent ? "#fff" : a.color,
                    border: `2px solid ${a.color}`,
                    padding: "0.65rem 1.25rem",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                  }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>👥 ব্যবহারকারী ব্যবস্থাপনা</h2>
              <input type="text" className="form-input" placeholder="নাম, ইমেইল বা ফোন..." value={userSearch}
                onChange={e => setUserSearch(e.target.value)} style={{ maxWidth: 260, padding: "0.5rem 0.75rem" }} />
              <select className="form-select" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={{ width: "auto", padding: "0.5rem 0.75rem" }}>
                <option value="">সব ভূমিকা</option>
                <option value="STUDENT">শিক্ষার্থী</option>
                <option value="TEACHER">শিক্ষক</option>
                <option value="ADMIN">অ্যাডমিন</option>
              </select>
              <button className="btn btn-primary" onClick={fetchUsers} style={{ padding: "0.5rem 1rem" }}>🔍 খুঁজুন</button>
            </div>
            <div className="table-container">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>নাম</th>
                      <th>যোগাযোগ</th>
                      <th>ভূমিকা</th>
                      <th>কার্যক্রম</th>
                      <th>স্ট্যাটাস</th>
                      <th style={{ textAlign: "right" }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.name}</strong>
                          {u.institution && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.institution}</div>}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem" }}>{u.email}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.phone}</div>
                        </td>
                        <td>
                          <span style={{ background: roleColor(u.role) + "22", color: roleColor(u.role), borderRadius: "999px", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 700 }}>
                            {u.role === "ADMIN" ? "অ্যাডমিন" : u.role === "TEACHER" ? "শিক্ষক" : "শিক্ষার্থী"}
                          </span>
                          {u.teacherStatus === "PENDING" && (
                            <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: "999px", padding: "0.15rem 0.5rem", fontSize: "0.68rem", fontWeight: 600, marginLeft: "0.35rem" }}>⏳ আবেদন</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.8rem" }}>📚 {u._count.enrollments} ভর্তি</div>
                          <div style={{ fontSize: "0.8rem" }}>🎓 {u._count.coursesLed} কোর্স</div>
                          <div style={{ fontSize: "0.8rem" }}>📦 {u._count.orders} অর্ডার</div>
                        </td>
                        <td>
                          <span style={{ color: statusColor(u.status), fontWeight: 600, fontSize: "0.82rem" }}>
                            {u.status === "active" ? "● সক্রিয়" : "● স্থগিত"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            {u.role !== "ADMIN" && (
                              <select
                                defaultValue={u.role}
                                onChange={e => handleUserRole(u.id, e.target.value, u.name)}
                                style={{ fontSize: "0.78rem", padding: "0.25rem 0.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "#fff", cursor: "pointer" }}
                                disabled={actionLoading === u.id}
                              >
                                <option value="STUDENT">শিক্ষার্থী</option>
                                <option value="TEACHER">শিক্ষক</option>
                              </select>
                            )}
                            {u.role !== "ADMIN" && (
                              <button
                                onClick={() => handleUserStatus(u.id, u.status === "active" ? "suspended" : "active", u.name)}
                                disabled={actionLoading === u.id}
                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", border: `1px solid ${u.status === "active" ? "#dc2626" : "#16a34a"}`, borderRadius: "var(--radius-sm)", background: "transparent", color: u.status === "active" ? "#dc2626" : "#16a34a", cursor: "pointer" }}
                              >
                                {u.status === "active" ? "স্থগিত" : "সক্রিয়"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>কোনো ব্যবহারকারী পাওয়া যায়নি</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TEACHER APPLICATIONS ══ */}
        {activeTab === "applications" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>🧑‍🏫 শিক্ষক আবেদন ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p>কোনো পেন্ডিং আবেদন নেই।</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {applications.map(app => (
                  <div key={app.id} className="card" style={{ padding: "1.75rem", borderLeft: "4px solid var(--primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>{app.name}</h3>
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                          <span>📧 {app.email}</span>
                          <span>📞 {app.phone}</span>
                          {app.institution && <span>🏫 {app.institution}</span>}
                          <span>📅 {new Date(app.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        {app.bio && (
                          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", maxWidth: 600 }}>
                            📝 {app.bio}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => handleTeacherAction(app.id, "approve")}
                          disabled={actionLoading === app.id}
                          className="btn btn-primary"
                          style={{ padding: "0.6rem 1.25rem" }}
                        >
                          {actionLoading === app.id ? "..." : "✅ অনুমোদন"}
                        </button>
                        <button
                          onClick={() => handleTeacherAction(app.id, "reject")}
                          disabled={actionLoading === app.id}
                          className="btn btn-secondary"
                          style={{ padding: "0.6rem 1.25rem", borderColor: "#dc2626", color: "#dc2626" }}
                        >
                          {actionLoading === app.id ? "..." : "❌ প্রত্যাখ্যান"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ COURSE APPROVALS ══ */}
        {activeTab === "courses" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>📖 কোর্স অনুমোদন ({pendingCourses.length})</h2>
            {pendingCourses.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p>কোনো পেন্ডিং কোর্স নেই।</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>কোর্স</th>
                      <th>শিক্ষক</th>
                      <th>শ্রেণী</th>
                      <th>মূল্য</th>
                      <th style={{ textAlign: "right" }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCourses.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.teacher.name}<div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.teacher.institution}</div></td>
                        <td>{c.classLevel} — {c.paper} পত্র</td>
                        <td>৳{c.discountPrice || c.price}</td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleCourseApprove(c.id)} disabled={actionLoading === c.id} className="btn btn-primary" style={{ padding: "0.35rem 1rem", fontSize: "0.85rem" }}>
                            {actionLoading === c.id ? "..." : "প্রকাশ করুন ✅"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>📦 বইয়ের অর্ডার ({orders.length})</h2>
            <div className="table-container">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>অর্ডার</th>
                      <th>গ্রাহক</th>
                      <th>পণ্য</th>
                      <th>মোট</th>
                      <th>পেমেন্ট</th>
                      <th>ডেলিভারি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong><div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("bn-BD")}</div></td>
                        <td>
                          <div>{o.shippingName}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{o.shippingPhone}</div>
                        </td>
                        <td style={{ maxWidth: 180 }}>
                          {o.items.map((it, i) => <div key={i} style={{ fontSize: "0.82rem" }}>• {it.product.title} ×{it.quantity}</div>)}
                        </td>
                        <td><strong style={{ color: "var(--accent)" }}>৳{o.totalAmount}</strong></td>
                        <td>
                          <span style={{ background: payColor(o.paymentStatus) + "22", color: payColor(o.paymentStatus), borderRadius: "999px", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700 }}>
                            {o.paymentStatus === "PAID" ? "পেইড" : o.paymentStatus === "FAILED" ? "ব্যর্থ" : "বকেয়া"}
                          </span>
                        </td>
                        <td>
                          <select
                            defaultValue={o.orderStatus}
                            onChange={e => handleOrderStatus(o.id, e.target.value)}
                            style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", border: `2px solid ${orderColor(o.orderStatus)}`, borderRadius: "var(--radius-sm)", color: orderColor(o.orderStatus), fontWeight: 600, background: "#fff" }}
                          >
                            {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                              <option key={s} value={s}>{s === "PENDING" ? "পেন্ডিং" : s === "CONFIRMED" ? "নিশ্চিত" : s === "PROCESSING" ? "প্রসেসিং" : s === "SHIPPED" ? "শিপড" : s === "DELIVERED" ? "ডেলিভার্ড" : "বাতিল"}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>কোনো অর্ডার নেই</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ DEVICE LOCK ══ */}
        {activeTab === "devices" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>📱 ডিভাইস লক ম্যানেজার ({lockedEnrollments.length})</h2>
            {lockedEnrollments.length === 0 ? (
              <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔓</div>
                <p>কোনো সক্রিয় ডিভাইস লক নেই।</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>শিক্ষার্থী</th>
                      <th>কোর্স</th>
                      <th>ডিভাইস সিগনেচার</th>
                      <th style={{ textAlign: "right" }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lockedEnrollments.map(en => (
                      <tr key={en.id}>
                        <td>
                          <strong>{en.student.name}</strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{en.student.phone} | {en.student.email}</div>
                        </td>
                        <td>{en.course.title}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          {en.deviceId ? en.deviceId.substring(0, 20) + "..." : "N/A"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDeviceReset(en.id)}
                            disabled={actionLoading === en.id}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.82rem", padding: "0.35rem 0.85rem", borderColor: "var(--accent)", color: "var(--accent)" }}
                          >
                            {actionLoading === en.id ? "..." : "🔓 রিসেট"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
