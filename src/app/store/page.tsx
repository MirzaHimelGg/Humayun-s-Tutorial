import { prisma } from "@/lib/prisma";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let whereClause: any = {};
  if (category) {
    whereClause.category = category;
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { id: "desc" }
  });

  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">সহায়ক বই ও গাইডসমূহ</h2>
          <p className="section-subtitle">তোমার পছন্দের বই অর্ডার করো এবং ঘরে বসেই ডেলিভারি নাও</p>
        </div>

        {/* Categories filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
          <a href="/store" className={`btn ${!category ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            সব বই
          </a>
          <a href="/store?category=HSC" className={`btn ${category === 'HSC' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            HSC গাইড
          </a>
          <a href="/store?category=SSC" className={`btn ${category === 'SSC' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            SSC গাইড
          </a>
          <a href="/store?category=Guide" className={`btn ${category === 'Guide' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            কোশ্চেন ব্যাংক ও অন্যান্য
          </a>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📚</span>
            <p>দুঃখিত, এই ক্যাটাগরিতে কোনো বই পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {products.map((book) => {
              const images = JSON.parse(book.imagesJson);
              return (
                <div key={book.id} className="card">
                  <div className="card-img-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                    <img 
                      src={images[0]} 
                      alt={book.title} 
                      style={{ height: "180px", width: "auto", objectFit: "contain", padding: "1rem" }} 
                    />
                    <span className="card-badge" style={{ backgroundColor: book.type === "PHYSICAL" ? "#4f46e5" : "#0ea5e9" }}>
                      {book.type === "PHYSICAL" ? "প্রিন্ট বই" : "ই-বুক পিডিএফ"}
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{book.title}</h3>
                    <p className="card-text">{book.description}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>লেখক: {book.author}</p>
                    
                    <div className="card-footer">
                      <div className="price-wrapper">
                        {book.discountPrice && (
                          <span className="original-price">৳{book.price}</span>
                        )}
                        <span className="price">৳{book.discountPrice || book.price}</span>
                      </div>
                      <a href={`/store/${book.slug}`} className="btn btn-secondary btn-sm">বিস্তারিত দেখুন</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
