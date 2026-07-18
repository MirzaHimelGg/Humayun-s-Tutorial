"use client";

import React, { useState } from "react";

interface CertificateDetails {
  verificationCode: string;
  issuedAt: string;
  student: { name: string; email: string };
  course: { title: string; classLevel: string };
}

export default function CertificateVerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<CertificateDetails | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError("");
    setDetails(null);
    setSearched(true);

    try {
      // Let's call a database query api or verify api
      const res = await fetch(`/api/certificates/verify?code=${code}`);
      const data = await res.json();
      
      if (data.success && data.certificate) {
        setDetails(data.certificate);
      } else {
        setError(data.error || "প্রদত্ত কোডটির কোনো সার্টিফিকেট পাওয়া যায়নি। অনুগ্রহ করে কোডটি পুনরায় চেক করুন।");
      }
    } catch (err) {
      setError("সার্টিফিকেট যাচাই করার সময় সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "600px", width: "100%", padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "4.5rem", display: "block", marginBottom: "1rem" }}>🏅</span>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>সার্টিফিকেট ভেরিফাই করুন</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            হুমায়ুন'স টিউটোরিয়াল থেকে অর্জিত সার্টিফিকেট যাচাই করতে ভেরিফিকেশন কোডটি নিচে প্রদান করুন।
          </p>
        </div>

        <form onSubmit={handleVerify} style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="সার্টিফিকেট কোড দিন (যেমন: CERT-1-3-123456)" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
          </button>
        </form>

        {searched && !loading && (
          <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
            {error && (
              <div className="alert alert-error" style={{ textAlign: "center" }}>
                ❌ {error}
              </div>
            )}

            {details && (
              <div className="card" style={{ padding: "2rem", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "2px solid var(--success)", boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.1)" }}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <span style={{ color: "var(--success)", fontWeight: "bold", fontSize: "1.1rem", display: "block", marginBottom: "0.25rem" }}>
                    ✓ সার্টিফিকেটটি বৈধ ও ভেরিফাইড
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    কোড: {details.verificationCode}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.95rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>শিক্ষার্থীর নাম:</span>
                    <strong>{details.student.name}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>সফলভাবে সম্পন্ন কোর্স:</span>
                    <strong style={{ maxWidth: "250px", textAlign: "right" }}>{details.course.title}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>শ্রেণী:</span>
                    <strong>{details.course.classLevel}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>ইস্যু করার তারিখ:</span>
                    <strong>{new Date(details.issuedAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
