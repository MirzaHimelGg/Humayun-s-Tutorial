import { prisma } from "@/lib/prisma";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const book = await prisma.product.findUnique({
    where: { slug }
  });

  if (!book) {
    return (
      <div className="container" style={{ padding: "10rem 2rem", textAlign: "center" }}>
        <h2>দুঃখিত, বইটি পাওয়া যায়নি!</h2>
        <a href="/store" className="btn btn-primary" style={{ marginTop: "1rem" }}>বইয়ের দোকানে ফিরে যান</a>
      </div>
    );
  }

  const images = JSON.parse(book.imagesJson);

  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "4rem", alignItems: "start" }}>
        {/* Book Cover Image */}
        <div className="card" style={{ padding: "3rem", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
          <img 
            src={images[0]} 
            alt={book.title} 
            style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }} 
          />
        </div>

        {/* Book Details */}
        <div>
          <span 
            className="status-badge" 
            style={{ 
              backgroundColor: book.type === "PHYSICAL" ? "var(--primary-light)" : "var(--success-light)",
              color: book.type === "PHYSICAL" ? "var(--primary)" : "var(--success)",
              marginBottom: "1rem" 
            }}
          >
            {book.type === "PHYSICAL" ? "প্রিন্ট সংস্করণ" : "ই-বুক পিডিএফ"}
          </span>
          
          <h1 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>{book.title}</h1>
          <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>লেখক: <strong>{book.author}</strong></p>
          
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--accent)" }}>৳{book.discountPrice || book.price}</span>
            {book.discountPrice && (
              <span style={{ fontSize: "1.125rem", textDecoration: "line-through", color: "var(--text-muted)" }}>৳{book.price}</span>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "1.5rem 0", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>বইয়ের বিবরণ ও সূচীপত্র</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{book.description}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <a 
                href={`/checkout?productId=${book.id}&qty=1`} 
                className="btn btn-primary btn-lg" 
                style={{ flex: 1, textAlign: "center" }}
              >
                সরাসরি অর্ডার করুন (Buy Now)
              </a>
              {book.type === "PHYSICAL" && (
                <div style={{ fontSize: "0.85rem", color: book.stockQty > 0 ? "var(--success)" : "var(--danger)", alignSelf: "center" }}>
                  {book.stockQty > 0 ? `🟢 স্টকে আছে (উপলব্ধ: ${book.stockQty}টি)` : "🔴 স্টক শেষ"}
                </div>
              )}
            </div>
            
            {/* Direct instructions for the client/cart */}
            <button 
              id="add-to-cart-btn"
              className="btn btn-secondary" 
              style={{ width: "100%", padding: "0.75rem" }}
              // We'll write a small helper to store this in LocalStorage for /cart checkout
            >
              🛒 কার্টে যোগ করুন
            </button>
          </div>
        </div>
      </div>
      
      {/* Script to handle cart actions */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const productId = ${book.id};
            const title = "${book.title}";
            const price = ${book.discountPrice || book.price};
            
            const existingIndex = cart.findIndex(item => item.productId === productId);
            if (existingIndex > -1) {
              cart[existingIndex].quantity += 1;
            } else {
              cart.push({ productId, title, price, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('"${book.title}" বইটি কার্টে যোগ করা হয়েছে!');
            window.location.href = '/cart';
          });
        `
      }} />
    </section>
  );
}
