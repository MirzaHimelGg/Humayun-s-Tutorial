import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.doubtAnswer.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.liveClassSchedule.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const teacherPassword = bcrypt.hashSync("teacher123", 10);
  const studentPassword = bcrypt.hashSync("student123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "অ্যাডমিন ইউজার",
      email: "admin@bangla.edu.bd",
      phone: "01700000000",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "ড. হুমায়ুন কবীর",
      email: "teacher@bangla.edu.bd",
      phone: "01800000000",
      passwordHash: teacherPassword,
      role: "TEACHER",
      institution: "ঢাকা বিশ্ববিদ্যালয়",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "তানভীর রহমান",
      email: "student@bangla.edu.bd",
      phone: "01900000000",
      passwordHash: studentPassword,
      role: "STUDENT",
      className: "HSC",
      institution: "ঢাকা কলেজ",
    },
  });

  console.log("Users created:", {
    admin: admin.email,
    teacher: teacher.email,
    student: student.email,
  });

  // 2. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: "এইচএসসি বাংলা ১ম পত্র - গদ্য ও পদ্য সম্পূর্ণ প্রস্তুতি",
      slug: "hsc-bangla-1st-paper-complete",
      description: "এইচএসসি সিলেবাসের আওতাভুক্ত সকল গদ্য, পদ্য এবং সহপাঠ (লালসালু ও সিরাজউদ্দৌলা) এর লাইন বাই লাইন ব্যাখ্যা, মূলভাব, এবং সৃজনশীল প্রশ্নোত্তর প্রস্তুতি।",
      classLevel: "HSC",
      subject: "Bangla",
      paper: "1st",
      type: "RECORDED",
      price: 1500,
      discountPrice: 1200,
      teacherId: teacher.id,
      status: "PUBLISHED",
      thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500",
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "এইচএসসি বাংলা ২য় পত্র - ব্যাকরণ ও নির্মিতি (লাইভ ব্যাচ)",
      slug: "hsc-bangla-2nd-paper-live",
      description: "বাংলা ব্যাকরণ অংশের ৩০ নম্বর নিশ্চিত করতে এবং নির্মিতি অংশের ৭০ নম্বরের লেখার কৌশল ও শর্টকাট নিয়ে ড. হুমায়ুন কবীরের লাইভ ক্লাস সিরিজ।",
      classLevel: "HSC",
      subject: "Bangla",
      paper: "2nd",
      type: "LIVE",
      price: 2000,
      discountPrice: 1500,
      teacherId: teacher.id,
      status: "PUBLISHED",
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "এসএসসি বাংলা ১ম ও ২য় পত্র কম্বো কোর্স",
      slug: "ssc-bangla-combo",
      description: "এসএসসি পরীক্ষার্থীদের বাংলা প্রথম ও দ্বিতীয় পত্রের পুরো সিলেবাসের বেসিক ও সৃজনশীল গোড়া থেকে শেখার কোর্স।",
      classLevel: "SSC",
      subject: "Bangla",
      paper: "1st",
      type: "RECORDED",
      price: 1200,
      discountPrice: 999,
      teacherId: teacher.id,
      status: "PUBLISHED",
      thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500",
    },
  });

  console.log("Courses created:", [course1.slug, course2.slug, course3.slug]);

  // 3. Chapters & Lessons
  // Course 1 Chapters & Lessons
  const c1ch1 = await prisma.chapter.create({
    data: { courseId: course1.id, title: "গদ্যাংশ (Prose)", order: 1 },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      chapterId: c1ch1.id,
      title: "অপরিচিতা - মূলভাব ও লাইন বাই লাইন ব্যাখ্যা",
      type: "VIDEO",
      contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Mock video
      isFreePreview: true,
      order: 1,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      chapterId: c1ch1.id,
      title: "অপরিচিতা - লেখক পরিচিতি ও অনুধাবনমূলক প্রশ্ন",
      type: "VIDEO",
      contentUrl: "https://www.w3schools.com/html/movie.mp4", // Mock video
      isFreePreview: false,
      order: 2,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      chapterId: c1ch1.id,
      title: "অপরিচিতা - সৃজনশীল প্রশ্নোত্তর সমাধান (PDF)",
      type: "PDF",
      contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Mock PDF
      isFreePreview: false,
      order: 3,
    },
  });

  const c1ch2 = await prisma.chapter.create({
    data: { courseId: course1.id, title: "পদ্যাংশ (Poetry)", order: 2 },
  });

  const lesson4 = await prisma.lesson.create({
    data: {
      chapterId: c1ch2.id,
      title: "সোনার তরী - শব্দার্থ ও ছন্দ বিশ্লেষণ",
      type: "VIDEO",
      contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      isFreePreview: false,
      order: 1,
    },
  });

  // Course 2 (Live Batch) Chapters & Lessons
  const c2ch1 = await prisma.chapter.create({
    data: { courseId: course2.id, title: "বাংলা ব্যাকরণ (Grammar)", order: 1 },
  });

  const lesson5 = await prisma.lesson.create({
    data: {
      chapterId: c2ch1.id,
      title: "বাংলা উচ্চারণের নিয়ম (লাইভ ক্লাস)",
      type: "LIVE",
      contentUrl: "https://zoom.us/mock-meeting-id-1",
      isFreePreview: false,
      order: 1,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0); // 7 PM tomorrow

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(20, 30, 0, 0); // 8:30 PM tomorrow

  await prisma.liveClassSchedule.create({
    data: {
      lessonId: lesson5.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      joinUrl: "https://meet.google.com/mock-meet-id",
    },
  });

  console.log("Chapters and Lessons created.");

  // 4. Quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: "অপরিচিতা - সাধারণ যোগ্যতা যাচাই কুইজ",
      type: "PRACTICE",
      timeLimit: 10,
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz1.id,
      text: "'অপরিচিতা' গল্পে অনুপমের মামার বয়স কত?",
      optionsJson: JSON.stringify([
        "অনুপমের চেয়ে এক বছরের বড়",
        "অনুপমের চেয়ে দুই বছরের বড়",
        "অনুপমের চেয়ে তিন বছরের বড়",
        "অনুপমের চেয়ে চার বছরের বড়",
      ]),
      correctOption: 1, // index 1
      explanation: "গল্পে উল্লেখ আছে, অনুপমের মামা অনুপমের চেয়ে দুই বছরের বড়।",
      marks: 1,
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz1.id,
      text: "কল্যাণীর বাবার নাম কী?",
      optionsJson: JSON.stringify([
        "শম্ভুনাথ সেন",
        "রামনাথ সেন",
        "দীননাথ সেন",
        "হরিনাথ সেন",
      ]),
      correctOption: 0, // index 0
      explanation: "কল্যাণীর বাবা ডাক্তার শম্ভুনাথ সেন।",
      marks: 1,
    },
  });

  console.log("Quizzes and Questions created.");

  // 5. Products (Books)
  const book1 = await prisma.product.create({
    data: {
      title: "এইচএসসি বাংলা ১ম পত্র সহায়ক গ্রন্থ - ২০২২",
      slug: "hsc-bangla-1st-paper-guide",
      description: "এইচএসসি বাংলা প্রথম পত্রের সকল অধ্যায়ের অতি সংক্ষিপ্ত, সংক্ষিপ্ত ও সৃজনশীল প্রশ্নোত্তরের সেরা সমাধান গাইড।",
      author: "ড. হুমায়ুন কবীর",
      category: "HSC",
      price: 350,
      discountPrice: 290,
      stockQty: 45,
      type: "PHYSICAL",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      ]),
    },
  });

  const book2 = await prisma.product.create({
    data: {
      title: "বাংলা ২য় পত্র ব্যাকরণ ও নির্মিতি গাইড (SSC & HSC)",
      slug: "bangla-2nd-paper-guide",
      description: "সহজ ভাষায় ব্যাকরণের কঠিন বিষয়গুলোর ব্যাখ্যা ও নির্মিতি অংশের পূর্ণাঙ্গ দিকনির্দেশনা সম্বলিত সেলফ স্টাডি বুক।",
      author: "ড. হুমায়ুন কবীর",
      category: "HSC",
      price: 280,
      discountPrice: 220,
      stockQty: 80,
      type: "PHYSICAL",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
      ]),
    },
  });

  const book3 = await prisma.product.create({
    data: {
      title: "বিগত ১০ বছরের বোর্ড প্রশ্ন ও সমাধান ব্যাংক (PDF)",
      slug: "board-question-bank-pdf",
      description: "SSC ও HSC পরীক্ষার বিগত ১০ বছরের বাংলা ১ম ও ২য় পত্রের সকল বোর্ড কোশ্চেন উইথ ডিটেইল্ড অ্যানসার শিট (পিডিএফ ডাউনলোড)।",
      author: "এডুকেশন সেল",
      category: "Guide",
      price: 120,
      discountPrice: 80,
      stockQty: 99999,
      type: "DIGITAL",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1610116306796-6ebd7418c0d1?w=400",
      ]),
      digitalFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
  });

  console.log("Bookstore products created:", [book1.slug, book2.slug, book3.slug]);

  // 6. Coupons
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.coupon.create({
    data: {
      code: "BANGLA20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      appliesTo: "BOTH",
      expiryDate: nextMonth,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FLAT100",
      discountType: "FIXED",
      discountValue: 100,
      appliesTo: "BOTH",
      expiryDate: nextMonth,
    },
  });

  console.log("Coupons created.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
