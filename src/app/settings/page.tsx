"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  className?: string;
  institution?: string;
  avatar?: string;
  bio?: string;
}

const AVATARS = [
  { emoji: "🎓", label: "শিক্ষার্থী" },
  { emoji: "🧑‍🏫", label: "শিক্ষক" },
  { emoji: "🛡️", label: "অ্যাডমিন" },
  { emoji: "📚", label: "পড়ুয়া" },
  { emoji: "✍️", label: "লেখক" },
  { emoji: "💻", label: "প্রোগ্রামার" },
  { emoji: "🎨", label: "শিল্পী" },
  { emoji: "🧠", label: "চিন্তাবিদ" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [className, setClassName] = useState("HSC");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("🎓");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/login?redirect=/settings");
          return;
        }
        const data = await res.json();
        if (data.success) {
          const u = data.user;
          setProfile(u);
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setClassName(u.className || "HSC");
          setInstitution(u.institution || "");
          setBio(u.bio || "");
          setAvatar(u.avatar || "🎓");
        } else {
          setError("ব্যবহারকারীর প্রোফাইল লোড করতে ব্যর্থ হয়েছে।");
        }
      } catch (err) {
        setError("সংযোগ বিচ্ছিন্ন হয়েছে। পুনরায় চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setAvatar(data.avatar);
        setSuccess("ছবি সফলভাবে আপলোড করা হয়েছে। সংরক্ষণ করতে 'প্রোফাইল আপডেট করুন' বাটনে ক্লিক করুন।");
      } else {
        setError(data.error || "ছবি আপলোড ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("ছবি আপলোড করার সময় নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটি মেলেনি। পুনরায় পরীক্ষা করুন।");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const payload: any = {
        name,
        email,
        phone,
        avatar,
        className: profile?.role === "STUDENT" ? className : undefined,
        institution: profile?.role !== "ADMIN" ? institution : undefined,
        bio: profile?.role === "TEACHER" ? bio : undefined,
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।");
        setProfile(data.user);
        setPassword("");
        setConfirmPassword("");
        
        // Reload header state after a small delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || "আপডেট করা সম্ভব হয়নি।");
      }
    } catch (err) {
      setError("সার্ভার ত্রুটি। পুনরায় চেষ্টা করুন।");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "75vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 45, height: 45, border: "3px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>প্রোফাইল সেটিংস লোড হচ্ছে...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container" style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2>{error}</h2>
        <button onClick={() => router.back()} className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          ফিরে যান
        </button>
      </div>
    );
  }

  const roleLabel = profile?.role === "ADMIN" ? "🛡️ অ্যাডমিন" : profile?.role === "TEACHER" ? "🧑‍🏫 শিক্ষক" : "🎓 শিক্ষার্থী";

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "85vh", padding: "2.5rem 0" }}>
      <div className="container" style={{ maxWidth: "750px" }}>
        
        {/* Back navigation */}
        <button 
          onClick={() => {
            if (profile?.role === "ADMIN") router.push("/admin/dashboard");
            else if (profile?.role === "TEACHER") router.push("/teacher/dashboard");
            else router.push("/dashboard");
          }} 
          style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.95rem" }}
        >
          ← ড্যাশবোর্ডে ফিরে যান
        </button>

        <h1 style={{ fontSize: "1.75rem", color: "var(--maroon)", fontWeight: "800", marginBottom: "0.35rem" }}>
          ⚙️ প্রোফাইল সেটিংস (Profile Settings)
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          আপনার অ্যাকাউন্টের বিবরণ, সিকিউরিটি এবং পার্সোনালাইজেশন আপডেট করুন
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Avatar selection card */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--maroon)", marginBottom: "1.25rem", fontWeight: "700" }}>
              👤 প্রোফাইল ছবি / অবতার নির্বাচন করুন
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: avatar.startsWith("/") ? "inherit" : "3.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "2px solid var(--primary)", overflow: "hidden" }}>
                {avatar.startsWith("/") ? (
                  <img src={avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  avatar
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setAvatar(av.emoji)}
                      title={av.label}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        border: avatar === av.emoji ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        background: avatar === av.emoji ? "var(--primary-light)" : "#fff",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "0.35rem" }}>
                    অথবা কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ fontSize: "0.8rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.25rem 0.5rem", background: "#fff", cursor: "pointer" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account information card */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--maroon)", marginBottom: "1.5rem", fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📝 মৌলিক অ্যাকাউন্ট বিবরণ</span>
              <span style={{ fontSize: "0.8rem", background: "var(--bg-tertiary)", padding: "0.2rem 0.65rem", borderRadius: "999px", color: "var(--text-muted)", fontWeight: "normal" }}>
                ভূমিকা: {roleLabel}
              </span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", flexWrap: "wrap" }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">পুরো নাম (Full Name)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">ইমেইল (Email)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">মোবাইল নম্বর (Phone)</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                />
              </div>

              {/* STUDENT Specific */}
              {profile?.role === "STUDENT" && (
                <>
                  <div className="form-group">
                    <label className="form-label">শ্রেণী (Class Level)</label>
                    <select 
                      className="form-select" 
                      value={className} 
                      onChange={(e) => setClassName(e.target.value)}
                    >
                      <option value="HSC">HSC (১১-১২)</option>
                      <option value="SSC">SSC (৯-১০)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">শিক্ষা প্রতিষ্ঠান</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={institution} 
                      onChange={(e) => setInstitution(e.target.value)} 
                      placeholder="যেমন: ঢাকা কলেজ"
                    />
                  </div>
                </>
              )}

              {/* TEACHER Specific */}
              {profile?.role === "TEACHER" && (
                <>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">শিক্ষা প্রতিষ্ঠান ও বিভাগ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={institution} 
                      onChange={(e) => setInstitution(e.target.value)} 
                      placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">আপনার সংক্ষিপ্ত পরিচয় ও দক্ষতা (Bio)</label>
                    <textarea 
                      className="form-input" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      rows={3} 
                      placeholder="আপনার যোগ্যতা ও অভিজ্ঞতার সংক্ষিপ্ত বিবরণ..."
                      style={{ resize: "vertical" }}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security details card */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--maroon)", marginBottom: "1.25rem", fontWeight: "700" }}>
              🔒 নিরাপত্তা পরিবর্তন (পাসওয়ার্ড)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              পাসওয়ার্ড পরিবর্তন করতে না চাইলে নিচে পাসওয়ার্ডের ঘরগুলো ফাঁকা রাখুন।
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">নতুন পাসওয়ার্ড (New Password)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="ন্যূনতম ৬ সংখ্যার পাসওয়ার্ড দিন"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="পুনরায় পাসওয়ার্ডটি লিখুন"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={updating}
            style={{ padding: "0.85rem", fontSize: "1rem", fontWeight: "bold", boxShadow: "0 4px 14px rgba(188,75,47,0.25)" }}
          >
            {updating ? "প্রোফাইল আপডেট হচ্ছে..." : "✅ প্রোফাইল আপডেট করুন"}
          </button>

        </form>
      </div>
    </div>
  );
}
