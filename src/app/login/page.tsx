"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("সবগুলো ফিল্ড পূরণ করা আবশ্যক।");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("লগইন সফল হয়েছে! রিডাইরেক্ট করা হচ্ছে...");
        
        // Role-aware redirect
        const role = data.user?.role;
        if (role === "ADMIN") {
          window.location.href = "/admin/dashboard";
        } else if (role === "TEACHER") {
          window.location.href = "/teacher/dashboard";
        } else {
          window.location.href = redirect;
        }
      } else {
        setError(data.error || "লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।");
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "2.5rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.75rem", marginBottom: "0.5rem" }}>অ্যাকাউন্টে লগইন</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          পড়াশোনা চালিয়ে যেতে আপনার অ্যাকাউন্ট ডিটেইলস দিন
        </p>

        {error && (
          <div className="alert alert-error" style={{ fontSize: "0.85rem", padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ fontSize: "0.85rem", padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ইমেইল অথবা মোবাইল নম্বর</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="যেমন: student@bangla.edu.bd অথবা 017xxxxxxxx"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">পাসওয়ার্ড</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "প্রসেস হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          নতুন অ্যাকাউন্ট খুলতে চান? <a href="/register" style={{ color: "var(--primary)", fontWeight: "600" }}>রেজিস্ট্রেশন করুন</a>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          💡 টেস্ট অ্যাকাউন্ট: <strong>student@bangla.edu.bd</strong> / <strong>student123</strong>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <h3>লগইন পেজ লোড হচ্ছে...</h3>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
