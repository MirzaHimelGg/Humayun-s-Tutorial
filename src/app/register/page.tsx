"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationType = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const [regType, setRegType] = useState<RegistrationType>("student");

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  
  // Student-only
  const [className, setClassName] = useState("HSC");

  // Teacher-only
  const [bio, setBio] = useState("");
  const [subject, setSubject] = useState("বাংলা");

  // UI states
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherApplied, setTeacherApplied] = useState(false);

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError("সবগুলো ফিল্ড পূরণ করা আবশ্যক।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, className, institution }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("নিবন্ধন সফল হয়েছে! ওটিপি (OTP) পাঠানো হয়েছে।");
        setStep(2);
      } else {
        setError(data.error || "নিবন্ধন ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !institution || !bio) {
      setError("সবগুলো ফিল্ড পূরণ করা আবশ্যক।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, institution, bio, subject }),
      });
      const data = await res.json();
      if (data.success) {
        setTeacherApplied(true);
      } else {
        setError(data.error || "আবেদন ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) { setError("ওটিপি কোড প্রবেশ করান।"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("ওটিপি যাচাই সফল! লগইন করা হচ্ছে...");
        setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
      } else {
        setError(data.error || "ভুল ওটিপি কোড।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // ─── Teacher Applied Success Screen ───
  if (teacherApplied) {
    return (
      <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontSize: "1.6rem", color: "var(--maroon)", marginBottom: "1rem" }}>আবেদন সফলভাবে জমা হয়েছে!</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            আপনার শিক্ষক নিবন্ধন আবেদনটি অ্যাডমিনের কাছে পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে আপনি শিক্ষক হিসেবে সক্রিয় হবেন এবং ইমেইলে জানানো হবে।
          </p>
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            ⏳ সাধারণত ২৪ ঘন্টার মধ্যে অনুমোদন দেওয়া হয়
          </div>
          <a href="/login" className="btn btn-primary" style={{ display: "block", padding: "0.75rem" }}>
            লগইন পেজে যান
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "2.5rem" }}>

        {/* ─── Type Toggle ─── */}
        {step === 1 && (
          <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.25rem", marginBottom: "2rem", gap: "0.25rem" }}>
            {([["student", "🎓 আমি শিক্ষার্থী"], ["teacher", "🧑‍🏫 শিক্ষক হিসেবে আবেদন"]] as [RegistrationType, string][]).map(([type, label]) => (
              <button
                key={type}
                onClick={() => { setRegType(type); setError(""); }}
                style={{
                  flex: 1,
                  padding: "0.6rem 0.75rem",
                  border: "none",
                  borderRadius: "calc(var(--radius-md) - 2px)",
                  background: regType === type ? "#fff" : "transparent",
                  color: regType === type ? "var(--maroon)" : "var(--text-secondary)",
                  fontWeight: regType === type ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: regType === type ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <h2 style={{ textAlign: "center", fontSize: "1.6rem", marginBottom: "0.4rem" }}>
          {step === 2 ? "ফোন যাচাইকরণ" : regType === "teacher" ? "শিক্ষক আবেদন ফর্ম" : "ছাত্র নিবন্ধন"}
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
          {step === 2
            ? "আপনার ফোন নম্বর যাচাই করতে ওটিপি দিন"
            : regType === "teacher"
            ? "আপনার তথ্য দিন — অ্যাডমিন রিভিউ করে অনুমোদন দেবেন"
            : "নতুন শিক্ষার্থীবৃন্দের জন্য সাইন আপ ফর্ম"}
        </p>

        {error && (
          <div className="alert alert-error" style={{ fontSize: "0.85rem", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ fontSize: "0.85rem", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            {success}
          </div>
        )}

        {/* ─── OTP Step ─── */}
        {step === 2 ? (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                মোবাইল নম্বর <strong>{phone}</strong> এ একটি ওটিপি পাঠানো হয়েছে।
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                💡 সিমুলেশন কোড: <strong>123456</strong>
              </p>
            </div>
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label" style={{ textAlign: "center", display: "block" }}>ওটিপি কোড (OTP)</label>
              <input
                type="text"
                className="form-input"
                placeholder="১২৩৪৫৬"
                maxLength={6}
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", padding: "0.75rem" }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }} disabled={loading}>
              {loading ? "কোড যাচাই হচ্ছে..." : "ওটিপি যাচাই করুন"}
            </button>
            <button type="button" className="btn btn-secondary" style={{ width: "100%", padding: "0.75rem", marginTop: "0.75rem" }} onClick={() => setStep(1)} disabled={loading}>
              পিছনে ফিরে যান
            </button>
          </form>

        ) : regType === "student" ? (
          // ─── Student Form ───
          <form onSubmit={handleStudentRegister}>
            <div className="form-group">
              <label className="form-label">পুরো নাম</label>
              <input type="text" className="form-input" placeholder="যেমন: তানভীর রহমান" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">ইমেইল</label>
              <input type="email" className="form-input" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">মোবাইল নম্বর</label>
              <input type="tel" className="form-input" placeholder="017xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">শ্রেণী</label>
                <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
                  <option value="HSC">HSC (১১-১২)</option>
                  <option value="SSC">SSC (৯-১০)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">শিক্ষা প্রতিষ্ঠান</label>
                <input type="text" className="form-input" placeholder="যেমন: ঢাকা কলেজ" value={institution} onChange={(e) => setInstitution(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">পাসওয়ার্ড</label>
              <input type="password" className="form-input" placeholder="ন্যূনতম ৬ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }} disabled={loading}>
              {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "নিবন্ধন সম্পন্ন করুন"}
            </button>
          </form>

        ) : (
          // ─── Teacher Application Form ───
          <form onSubmit={handleTeacherApply}>
            <div className="form-group">
              <label className="form-label">পুরো নাম</label>
              <input type="text" className="form-input" placeholder="যেমন: ড. সাইফুল ইসলাম" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">ইমেইল</label>
              <input type="email" className="form-input" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">মোবাইল নম্বর</label>
              <input type="tel" className="form-input" placeholder="017xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">বিষয় (Subject)</label>
                <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="বাংলা">বাংলা</option>
                  <option value="ইংরেজি">ইংরেজি</option>
                  <option value="গণিত">গণিত</option>
                  <option value="পদার্থ">পদার্থবিজ্ঞান</option>
                  <option value="রসায়ন">রসায়ন</option>
                  <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">প্রতিষ্ঠান</label>
                <input type="text" className="form-input" placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়" value={institution} onChange={(e) => setInstitution(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">সংক্ষিপ্ত পরিচয় ও দক্ষতা</label>
              <textarea
                className="form-input"
                placeholder="আপনার শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও বিশেষত্ব সম্পর্কে লিখুন..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">পাসওয়ার্ড</label>
              <input type="password" className="form-input" placeholder="ন্যূনতম ৬ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              ℹ️ আবেদন জমা দেওয়ার পর অ্যাডমিন রিভিউ করে অনুমোদন দেবেন। অনুমোদনের পর আপনি শিক্ষক হিসেবে লগইন করতে পারবেন।
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }} disabled={loading}>
              {loading ? "আবেদন জমা হচ্ছে..." : "🧑‍🏫 আবেদন জমা দিন"}
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>লগইন করুন</a>
          </div>
        )}
      </div>
    </section>
  );
}
