"use client";

import { useEffect, useState } from "react";

interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateQuantity = (productId: number, delta: number) => {
    const updated = cart.map((item) => {
      if (item.productId === productId) {
        const quantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (productId: number) => {
    const updated = cart.filter((item) => item.productId !== productId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="section-header">
          <h2 className="section-title">আমার শপিং কার্ট</h2>
          <p className="section-subtitle">আপনার নির্বাচিত প্রোডাক্টগুলোর তালিকা</p>
        </div>

        {cart.length === 0 ? (
          <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
            <span style={{ fontSize: "4rem", display: "block", marginBottom: "1.5rem" }}>🛒</span>
            <h3 style={{ marginBottom: "1rem" }}>আপনার কার্টটি সম্পূর্ণ খালি!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              আমাদের বইয়ের লাইব্রেরি থেকে প্রয়োজনীয় গাইড বা বই যোগ করুন।
            </p>
            <a href="/store" className="btn btn-primary">বইয়ের দোকানে যান</a>
          </div>
        ) : (
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {cart.map((item) => (
                <div 
                  key={item.productId} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    borderBottom: "1px solid var(--border-color)", 
                    paddingBottom: "1rem" 
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.1rem" }}>{item.title}</h3>
                    <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.95rem" }}>
                      ৳{item.price}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: "0.25rem 0.5rem" }}
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        -
                      </button>
                      <span style={{ padding: "0 0.75rem", fontWeight: "bold" }}>{item.quantity}</span>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: "0.25rem 0.5rem" }}
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ color: "var(--danger)", borderColor: "var(--border-color)" }}
                      onClick={() => removeItem(item.productId)}
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart summary */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "2px solid var(--border-color)" }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>সর্বমোট মূল্য:</span>
                <h2 style={{ fontSize: "2rem", color: "var(--accent)" }}>৳{getSubtotal()}</h2>
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <a href="/store" className="btn btn-secondary">আরও কেনাকাটা করুন</a>
                <a href="/checkout" className="btn btn-primary">অর্ডার করতে এগিয়ে যান (Checkout)</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
