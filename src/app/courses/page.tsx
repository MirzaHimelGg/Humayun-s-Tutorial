import { prisma } from "@/lib/prisma";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ classLevel?: string; paper?: string }>;
}) {
  const { classLevel, paper } = await searchParams;

  let whereClause: any = { status: "PUBLISHED" };
  if (classLevel) {
    whereClause.classLevel = classLevel;
  }
  if (paper) {
    whereClause.paper = paper;
  }

  const courses = await prisma.course.findMany({
    where: whereClause,
    include: {
      teacher: { select: { name: true, avatar: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="section" style={{ minHeight: "80vh" }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">অনলাইন কোর্সসমূহ</h2>
          <p className="section-subtitle">তোমার ক্লাস লেভেল অনুযায়ী সঠিক কোর্স বেছে নিয়ে পড়াশোনা শুরু করো</p>
        </div>

        {/* Filter Navigation */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
          <a href="/courses" className={`btn ${!classLevel ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            সব কোর্স
          </a>
          <a href="/courses?classLevel=HSC" className={`btn ${classLevel === 'HSC' && !paper ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            HSC কোর্স
          </a>
          <a href="/courses?classLevel=HSC&paper=1st" className={`btn ${classLevel === 'HSC' && paper === '1st' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            HSC ১ম পত্র
          </a>
          <a href="/courses?classLevel=HSC&paper=2nd" className={`btn ${classLevel === 'HSC' && paper === '2nd' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            HSC ২য় পত্র
          </a>
          <a href="/courses?classLevel=SSC" className={`btn ${classLevel === 'SSC' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            SSC কোর্স
          </a>
        </div>

        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🔍</span>
            <p>দুঃখিত, কোনো কোর্স খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="card">
                <div className="card-img-wrapper">
                  <img src={course.thumbnail || ""} alt={course.title} className="card-img" />
                  <span className="card-badge">{course.classLevel}</span>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{course.title}</h3>
                  <p className="card-text">{course.description}</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "bold" }}>🎓</div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{course.teacher.name}</span>
                  </div>

                  <div className="card-footer">
                    <div className="price-wrapper">
                      {course.discountPrice && (
                        <span className="original-price">৳{course.price}</span>
                      )}
                      <span className="price">৳{course.discountPrice || course.price}</span>
                    </div>
                    <a href={`/courses/${course.slug}`} className="btn btn-primary btn-sm">বিস্তারিত দেখুন</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
