# Product Requirements Document (PRD)
## Online Bangla Learning Platform (HSC/SSC — Bangla 1st & 2nd Paper) with Bookstore

**Document version:** 1.0
**Date:** June 15, 2026
**Prepared for:** development team
**Status:** Working

---

## 1. Executive Summary

This platform is a Bengali-language e-learning website modeled after 10 Minute School, but focused specifically on **Bangla subject preparation for SSC and HSC students** — primarily **Bangla 1st Paper** (সাহিত্য/গদ্য-পদ্য) and **Bangla 2nd Paper** (ব্যাকরণ ও নির্মিতি). The platform will support three user roles — **Student, Teacher, Admin** — and will include a **built-in e-commerce store** for the client to sell physical/digital books.

The system must be delivered as a **fully working, deployable web application** (frontend + backend + database + admin panel + payment integration), not just a design.

---

## 2. Goals & Objectives

| Goal | Description |
|---|---|
| G1 | Let students discover, purchase, and consume Bangla-focused courses (SSC & HSC, 1st & 2nd paper) online. |
| G2 | Let teachers create and manage course content, live classes, quizzes, and answer student doubts. |
| G3 | Let the admin manage the entire platform — users, courses, payments, store, and content moderation. |
| G4 | Let the client sell books (physical and/or digital/PDF) through an integrated store with its own cart/checkout. |
| G5 | Support Bangladesh-specific payment methods (bKash, Nagad, Rocket, cards via SSLCommerz) and SMS notifications. |
| G6 | Be mobile-first and low-bandwidth friendly (majority of users will be on mobile, sometimes on slow connections). |
| G7 | Be ready to deploy to production with clear environment configuration and no missing pieces. |

---

## 3. Target Users

1. **Students** — Class 9, 10 (SSC) and Class 11, 12 (HSC) students preparing for board exams, focused on Bangla 1st & 2nd paper (platform should be structured so other subjects can be added later without re-architecture).
2. **Teachers** — Subject experts who create/manage courses, host live classes, upload recorded lectures, create quizzes/MCQs, grade assignments, and answer student questions.
3. **Admin** — The platform owner/operations team who manages everything: users, courses, orders, payments, refunds, content approval, and site configuration.
4. **Guest/Visitor** — Unauthenticated users who can browse the course catalog and store but must register to purchase or enroll.

---

## 4. Scope

### 4.1 In Scope (v1)
- Public marketing site (home page, course catalog, book store, about, contact).
- Authentication & role-based access (Student, Teacher, Admin).
- Course structure: Class → Subject → Paper (1st/2nd) → Chapters → Lessons.
- Content types per lesson: recorded video, live class link/embed, PDF notes, quiz/MCQ.
- Enrollment & batch system (paid and free courses).
- Live class scheduling and access control (join link gated to enrolled students).
- Quiz/MCQ engine with auto-grading, model tests, and result tracking.
- Doubt-solving / Q&A (student asks a question on a lesson, teacher/admin answers).
- E-commerce Book Store: product catalog, cart, checkout, order management, inventory, shipping address collection.
- Payments: bKash, Nagad, Rocket, and card payments via a Bangladeshi payment gateway aggregator (SSLCommerz or similar), plus Cash on Delivery (COD) for the store.
- Admin dashboard: manage users, courses, content, orders, payments, coupons, reports.
- Teacher dashboard: manage own courses, students, live classes, quizzes, Q&A.
- Student dashboard: my courses, my orders, progress tracking, certificates, doubt inbox.
- Notifications: email + SMS (Bangladesh SMS gateway) + in-app notifications.
- Certificate generation (auto-generated PDF certificate on course completion).
- Bengali (bn) as primary language throughout UI; content is Bengali by nature.
- Responsive design (mobile, tablet, desktop) — mobile-first.

### 4.2 Out of Scope (v1) — can be phase 2
- Native mobile apps (iOS/Android) — v1 is a responsive website (PWA-capable).
- Live proctored exams with webcam monitoring.
- AI-based doubt-solving bot (like "TenTen").
- Multi-language (English) UI — Bangla only in v1.
- Affiliate/referral program.
- Offline physical center management (branch/seat booking).

---

## 5. User Roles & Permissions

### 5.1 Role Matrix

| Feature / Action | Student | Teacher | Admin |
|---|:---:|:---:|:---:|
| Browse public catalog & store | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ (invited by admin) | ✅ |
| Enroll / purchase a course | ✅ | ❌ | ❌ |
| Purchase books from store | ✅ | ✅ | ✅ |
| Watch recorded lessons (enrolled only) | ✅ | ✅ (own courses) | ✅ (all) |
| Join live classes (enrolled only) | ✅ | ✅ (host) | ✅ (all) |
| Take quizzes / model tests | ✅ | ❌ (can preview) | ✅ (preview) |
| View own progress & results | ✅ | ✅ (their students') | ✅ (all) |
| Ask a doubt/question on a lesson | ✅ | ❌ | ❌ |
| Answer student doubts | ❌ | ✅ (own course) | ✅ (any) |
| Create/edit courses, chapters, lessons | ❌ | ✅ (own courses, pending admin approval to publish) | ✅ (full control) |
| Upload video/PDF content | ❌ | ✅ | ✅ |
| Create quizzes/MCQs | ❌ | ✅ | ✅ |
| Schedule live classes | ❌ | ✅ (own courses) | ✅ |
| Publish/unpublish a course | ❌ | ❌ (submit for review only) | ✅ |
| Manage teacher accounts | ❌ | ❌ | ✅ |
| Manage student accounts | ❌ | ❌ (view own students only) | ✅ |
| Manage store products (books) | ❌ | ❌ | ✅ |
| Manage orders / shipping / refunds | ❌ | ❌ | ✅ |
| Manage payments & payouts | ❌ | ❌ (view own earnings, if revenue share exists) | ✅ |
| View site-wide analytics | ❌ | ❌ (own course analytics only) | ✅ |
| Manage coupons/discounts | ❌ | ❌ | ✅ |
| Manage site content (banners, FAQs, pages) | ❌ | ❌ | ✅ |
| Issue certificates | ❌ | ❌ (trigger for own course) | ✅ |
| Moderate/delete any content or comment | ❌ | ❌ (own course only) | ✅ |

### 5.2 Role Notes
- A **Teacher** account is created only by Admin (or self-registers and is approved by Admin) — teachers should not be able to self-publish without admin review to keep content quality controlled.
- **Admin** has a super-set of all permissions and can impersonate/manage everything.
- Consider a future **sub-admin** role (e.g., "Store Manager", "Content Moderator") — data model should allow adding roles later without a rewrite (use a `roles` table, not a hardcoded enum, if feasible).

---

## 6. Functional Requirements

### 6.1 Authentication & User Management
- Email/phone + password registration and login.
- Phone number verification via OTP (SMS) — common expectation in Bangladesh.
- Password reset via email or OTP.
- Optional: Google login (social auth).
- JWT-based session with refresh tokens.
- Profile management: name, phone, email, class (9/10/11/12), institution, photo.
- Admin can suspend/ban/delete any account.

### 6.2 Course Catalog & Structure
- Hierarchy: **Class (SSC/HSC, and grade) → Subject (Bangla) → Paper (1st/2nd) → Chapter → Lesson**.
- Each course/batch has: title, description, thumbnail, price (or "free"), instructor(s), syllabus outline, start date, duration, enrolled count, rating/reviews.
- Course types: **Recorded course** (self-paced) and **Live batch** (scheduled live classes + recordings).
- Filter/search catalog by class, paper, price, teacher.
- Course detail page: syllabus preview, demo/free lesson, reviews, instructor bio, "what you'll get" (live classes, notes, MCQs, model tests), price, enroll button.

### 6.3 Lesson Content
- Each lesson can contain one or more of:
  - Recorded video (hosted via a video streaming service — see §9.3)
  - Live class (scheduled, with join link/embed; recording auto-attached after the class ends)
  - PDF/notes attachment (downloadable, watermarked with student info to reduce piracy)
  - Quiz/MCQ set attached to the lesson
- Video player must support: playback speed control, resume-from-last-position, and (ideally) download-prevention/DRM-lite protection.
- Lessons are locked until the student is enrolled in the course; free preview lessons are explicitly flagged as free.

### 6.4 Live Classes
- Teacher schedules a live class (date, time, duration, linked course/chapter).
- Options: embed a third-party live tool (Zoom/Google Meet/YouTube Live unlisted) OR integrate a WebRTC-based in-house solution (recommend starting with **third-party embed** for v1 to reduce complexity/cost — see §9.4).
- Enrolled students see "Join Now" button active only within the scheduled window.
- Auto-reminder notification (SMS/email/in-app) 30 minutes before class.
- Class recording auto-uploaded/linked to the lesson after completion (manual upload acceptable for v1).

### 6.5 Quiz / MCQ / Model Test Engine
- Teacher/Admin creates MCQ questions with: question text (supports Bengali + image), 4 options, correct answer, explanation, marks, difficulty tag, chapter tag.
- Quiz types: **Practice quiz** (unlimited attempts, instant feedback) and **Model Test** (timed, one/limited attempts, simulates exam conditions).
- Auto-grading and instant result with correct/incorrect breakdown and explanations.
- Result history and performance analytics per student (per chapter strength/weakness).
- Leaderboard/ranking (optional, per model test) — nice-to-have for v1, can be phase 2 if timeline is tight.

### 6.6 Doubt Solving (Q&A)
- Student can post a question on a specific lesson (text + optional image upload).
- Teacher (owner of the course) or Admin can answer.
- Student gets notified when answered.
- Other enrolled students can view existing Q&A on that lesson (helps reduce duplicate questions).

### 6.7 Progress Tracking & Certificates
- Track: lessons completed, quizzes attempted/scores, overall course completion %.
- Student dashboard shows progress bar per enrolled course.
- On reaching 100% completion (or admin-defined threshold), auto-generate a downloadable PDF certificate with student name, course name, completion date, and a verification code.
- Public certificate verification page (enter code → shows validity), mirroring the reference site's "সার্টিফিকেট ভেরিফাই করুন" feature.

### 6.8 E-Commerce Book Store
- Product catalog: books (physical and/or digital/PDF), each with title, author, price, discount price, stock quantity, category (Class 9/10/11/12, 1st Paper/2nd Paper/Guide/etc.), images, description.
- Cart & checkout flow: add to cart, update quantity, apply coupon, choose delivery address, choose payment method.
- Delivery: integrate with a Bangladeshi courier (Pathao Courier / Steadfast / RedX / manual) — for v1, **manual courier assignment by admin is acceptable**, with courier API integration as a stretch goal.
- Order statuses: Pending → Confirmed → Processing → Shipped → Delivered → Cancelled/Returned.
- Digital products (e.g., PDF book): instantly accessible from student's "My Purchases" after payment confirmation, no shipping needed.
- Inventory management: stock auto-decrements on order confirmation; admin gets low-stock alerts.
- Order history and invoice download for students.
- Reviews & ratings on books.

### 6.9 Payments
- Payment methods: **bKash**, , **Rocket**, **Visa/Mastercard** (via a Bangladeshi aggregator such as SSLCommerz, ShurjoPay, or AamarPay — pick one aggregator for v1, e.g. SSLCommerz, which supports all of the above through one integration), and **Cash on Delivery** (store only, not for course purchases).
- Applies to both course enrollment and store checkout.
- Payment must be verified via server-side webhook/callback before granting access/confirming order (never trust client-side "success" redirect alone).
- Refund handling: Admin can mark an order/enrollment as refunded (manual refund process is acceptable for v1; gateway-initiated refund API is a stretch goal).
- Invoices/receipts auto-generated and emailed.

### 6.10 Coupons & Promotions
- Admin can create discount coupons (percentage or fixed amount), applicable to courses, store, or both.
- Coupon constraints: usage limit, expiry date, minimum order value, per-user usage limit.

### 6.11 Notifications
- Channels: In-app notification bell, Email, SMS (via a Bangladeshi SMS gateway).
- Trigger events: registration success, payment success/failure, enrollment confirmation, live class reminder, new answer to a doubt, order status change, certificate issued.

### 6.12 Admin Dashboard
- Overview analytics: total students, teachers, courses, revenue (courses vs store), active enrollments, recent orders.
- User management: search/filter/suspend/edit any user; approve teacher accounts.
- Course management: approve/reject/publish/unpublish courses submitted by teachers; edit any course.
- Store management: manage products, stock, orders, shipping, coupons.
- Content management: manage homepage banners, FAQ page, static pages (About, Privacy Policy, Refund Policy, Terms & Conditions — the reference site links these explicitly), testimonials section.
- Reports: sales report (course/store), enrollment report, exportable as CSV.

### 6.13 Teacher Dashboard
- My Courses: create/edit course & chapters/lessons, submit for admin approval.
- Content upload: video, PDF, quiz builder.
- Live class scheduler.
- My Students: list of enrolled students, their progress.
- Doubt inbox: unanswered questions for my courses.
- My Earnings (if a revenue-share model applies) — flag this as **needs client decision**: does the platform pay teachers a commission, salary, or is it in-house staff only? (See §13 Open Questions.)

### 6.14 Student Dashboard
- My Courses (enrolled, with progress bar and "continue learning" shortcut).
- My Orders (store purchases, invoices, tracking status).
- My Results (quiz/model test history, performance breakdown by chapter).
- My Certificates.
- My Doubts (asked questions and answers).
- Profile & settings.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Homepage and catalog pages should load in <3s on 3G/4G mobile connections in Bangladesh. Use CDN for static assets and images. |
| **Scalability** | Architecture should support scaling to at least 50,000 registered users and 5,000 concurrent live-class viewers in year 1 without redesign. |
| **Availability** | Target 99.5% uptime; graceful handling of payment gateway downtime (retry/queue). |
| **Security** | HTTPS everywhere; password hashing (bcrypt/argon2); role-based access control enforced server-side (not just UI-hidden); rate-limiting on auth endpoints; OWASP top-10 mitigations; secure payment webhook signature verification. |
| **Data Privacy** | Comply with basic data protection practices; student data (phone, payment info) never exposed publicly; Privacy Policy page required (already referenced in site structure). |
| **Localization** | Full Bengali (bn-BD) UI; support Bengali fonts/typography; numbers/dates should support Bengali numeral display where the client wants it (reference site mixes Bengali and Arabic numerals — confirm with client, default to Bengali numerals for marketing copy, Arabic numerals for prices/dates). |
| **SEO** | Server-side rendering or static generation for public pages (catalog, course detail, store, blog/notes) for discoverability; meta tags, OG tags, sitemap.xml, robots.txt (mirroring the reference site's meta setup). |
| **Accessibility** | Reasonable color contrast, alt text on images, keyboard navigation on forms. |
| **Browser/Device support** | Latest 2 versions of Chrome, Safari, Firefox, Edge; Android 8+ and iOS 13+ mobile browsers. |
| **Backup & Recovery** | Daily automated database backups, retained for at least 30 days. |

---

## 8. Information Architecture (Site Map)

```
/ (Home)
/courses (Catalog: filter by class, paper)
/courses/:slug (Course detail)
/store (Book store catalog)
/store/:slug (Book detail)
/cart
/checkout
/live-classes (Upcoming live class schedule)
/notes (Free notes & guides)
/certificate (Verify certificate)
/about
/contact
/faq
/privacy-policy
/refund-policy
/terms-and-conditions
/login
/register
/forgot-password

--- Student (authenticated) ---
/dashboard
/dashboard/my-courses
/dashboard/course/:id/learn (lesson player)
/dashboard/my-orders
/dashboard/my-results
/dashboard/my-certificates
/dashboard/my-doubts
/dashboard/profile

--- Teacher (authenticated) ---
/teacher/dashboard
/teacher/courses
/teacher/courses/:id/edit
/teacher/courses/:id/lessons
/teacher/courses/:id/quiz-builder
/teacher/courses/:id/live-class
/teacher/students
/teacher/doubts

--- Admin (authenticated) ---
/admin/dashboard
/admin/users
/admin/teachers
/admin/courses (approve/manage)
/admin/store/products
/admin/store/orders
/admin/coupons
/admin/payments
/admin/content (banners, FAQ, pages)
/admin/reports
```

---

## 9. Technical Architecture (Recommended)

> **Assumption:** No tech stack was specified by the client, so a modern, well-supported, cost-effective stack is recommended below. This can be swapped for another stack (e.g., Laravel, Django) — the requirements in this PRD are stack-agnostic and should be usable with any of them.

### 9.1 Suggested Stack
- **Frontend:** Next.js (React) — supports SSR/SSG for SEO on public pages, and CSR for dashboards.
- **Backend:** Node.js with NestJS (or Express) exposing a REST or GraphQL API.
- **Database:** PostgreSQL (relational data: users, courses, orders fit well; use JSONB fields for flexible content blocks).
- **File/Video storage:** Cloud object storage (e.g., S3-compatible) for PDFs/images; a dedicated video hosting/streaming service for lecture videos (see §9.3).
- **Cache/Queue:** Redis for caching and background job queues (e.g., certificate generation, notification sending).
- **Search:** PostgreSQL full-text search for v1 (course/store search); Elasticsearch/Meilisearch if search needs grow.
- **Authentication:** JWT + refresh tokens; bcrypt/argon2 password hashing.
- **Hosting/Infra:** Containerized (Docker) app deployed to a cloud provider (AWS/GCP/DigitalOcean) with CDN (Cloudflare) in front for static assets and DDoS protection.
- **CI/CD:** GitHub Actions (or equivalent) for automated build/test/deploy.

### 9.2 Payment Integration
- Integrate one Bangladeshi payment aggregator that supports bKash, Nagad, Rocket, and cards in a single integration (e.g., **SSLCommerz**), to avoid integrating each mobile wallet separately.
- All payment confirmations must be verified via server-to-server webhook, not just browser redirect.

### 9.3 Video Hosting
- Do **not** self-host raw video files on the app server. Use a video hosting/streaming provider (e.g., Bunny Stream, Vimeo, YouTube-unlisted, or AWS-based HLS pipeline) for adaptive bitrate streaming and to reduce piracy risk (signed/expiring URLs).
- For v1, a cost-effective option (e.g., Bunny Stream) with token-authenticated playback is recommended.

### 9.4 Live Classes
- v1 recommendation: embed a third-party tool (YouTube Live unlisted stream, or Zoom/Google Meet links surfaced inside the platform) rather than building custom WebRTC infrastructure — much faster to ship and reliable.
- Phase 2: consider a native in-platform live classroom if budget/timeline allows.

### 9.5 SMS Gateway
- Integrate a Bangladeshi SMS provider (e.g., a local aggregator API) for OTP and notifications.

---

## 10. Core Data Model (Entities)

- **User** (id, name, email, phone, password_hash, role[student/teacher/admin], class, institution, avatar, status, created_at)
- **Course** (id, title, slug, description, class_level, subject, paper[1st/2nd], type[recorded/live], price, discount_price, teacher_id, status[draft/pending/published], thumbnail, created_at)
- **Chapter** (id, course_id, title, order)
- **Lesson** (id, chapter_id, title, type[video/live/pdf], content_url, is_free_preview, order)
- **LiveClassSchedule** (id, lesson_id, start_time, end_time, join_url, recording_url)
- **Enrollment** (id, student_id, course_id, enrolled_at, progress_percent, status)
- **Quiz** (id, lesson_id or course_id, title, type[practice/model_test], time_limit)
- **Question** (id, quiz_id, text, image_url, options[4], correct_option, explanation, marks)
- **QuizAttempt** (id, student_id, quiz_id, score, answers_json, attempted_at)
- **Doubt** (id, student_id, lesson_id, question_text, image_url, status[open/answered])
- **DoubtAnswer** (id, doubt_id, answered_by_user_id, answer_text, answered_at)
- **Certificate** (id, student_id, course_id, verification_code, issued_at, pdf_url)
- **Product** (id, title, slug, description, author, category, price, discount_price, stock_qty, type[physical/digital], images, digital_file_url)
- **Order** (id, user_id, items_json, total_amount, payment_method, payment_status, order_status, shipping_address, coupon_code, created_at)
- **OrderItem** (id, order_id, product_id, quantity, unit_price)
- **Coupon** (id, code, discount_type, discount_value, applies_to[course/store/both], usage_limit, expiry_date)
- **Payment** (id, order_id or enrollment_id, gateway, gateway_txn_id, amount, status, raw_response, created_at)
- **Notification** (id, user_id, type, message, is_read, created_at)
- **Review** (id, user_id, target_type[course/product], target_id, rating, comment)

---

## 11. Key API Endpoints (High-Level, REST-style)

```
Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password

Courses (Public)
GET    /api/courses
GET    /api/courses/:slug
GET    /api/courses/:id/chapters

Enrollment (Student)
POST   /api/enrollments
GET    /api/enrollments/my

Lessons/Learning (Student, enrolled only)
GET    /api/lessons/:id
POST   /api/lessons/:id/complete

Quizzes
GET    /api/quizzes/:id
POST   /api/quizzes/:id/attempt
GET    /api/quiz-attempts/my

Doubts
POST   /api/doubts
GET    /api/doubts/my
POST   /api/doubts/:id/answer   (teacher/admin)

Store (Public)
GET    /api/products
GET    /api/products/:slug
POST   /api/cart
POST   /api/checkout

Payments
POST   /api/payments/initiate
POST   /api/payments/webhook/:gateway   (server-to-server callback)

Teacher
POST   /api/teacher/courses
PUT    /api/teacher/courses/:id
POST   /api/teacher/courses/:id/lessons
POST   /api/teacher/live-classes

Admin
GET    /api/admin/users
PUT    /api/admin/users/:id/status
GET    /api/admin/courses/pending
PUT    /api/admin/courses/:id/approve
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
POST   /api/admin/coupons
GET    /api/admin/reports/sales
```

*(This is representative, not exhaustive — the dev team should expand per entity with standard CRUD + role guards.)*

---

## 12. Design & Content Notes (from reference site)

- Reference site (10 Minute School) uses a clean, card-based catalog layout, a hero banner with rotating class-level shortcuts (Class 6–8, HSC batches, etc.), teacher-led course cards with instructor photo, testimonial carousel with student photos/results, an app-download promo section, and a footer with company links, policies, and contact channels (phone/WhatsApp/email/social).
- For this Bangla-focused platform, replicate this pattern but scope the top-level navigation to: **HSC**, **SSC**, **Store**, **Free Notes**, rather than the full multi-subject/class range of the reference site.
- Primary language: Bengali. Use a clean, readable Bengali web font (e.g., Hind Siliguri, Noto Sans Bengali, or Solaiman Lipi for print-like PDFs/certificates).
- Mobile-first layout is critical — most Bangladeshi students will access via phone.

---

## 13. Open Questions for Client (must be answered before/during build)

1. **Content ownership:** Will the client (or hired teachers) provide all video/PDF/MCQ content, or should the platform include content-creation tools assuming content is built from scratch after launch?
2. **Revenue model for teachers:** Fixed salary/in-house staff, or commission/revenue-share requiring payout tracking in the system?
3. **Free content:** Should there be a free tier (e.g., free notes, free demo classes) to drive signups, similar to the reference site's "ফ্রি ক্লাস" and "ফ্রি নোটস ও গাইড" sections?
4. **Store fulfillment:** Does the client have an existing courier/delivery partner, or should the system integrate a courier API (Pathao/Steadfast/RedX) vs. manual dispatch by admin?
5. **Digital vs physical books:** Will books be physical-only, digital (PDF)-only, or both?
6. **Branding:** Any existing brand name, logo, and color palette for the platform, or should this be defined during design?
7. **Budget/timeline constraints** that might affect the "recommended" vs "minimum viable" choices above (e.g., video hosting provider, live-class tooling).
8. **Certificates:** Should certificates carry legal/institutional weight (e.g., co-branded with a partner institution) or are they purely motivational?

---

## 14. Suggested Build Phases

| Phase | Scope |
|---|---|
| **Phase 0** | Finalize open questions (§13), finalize tech stack, set up infra/repo/CI-CD. |
| **Phase 1 — Core Platform** | Auth, roles, course catalog, course detail, enrollment, recorded lessons, PDF notes, basic admin panel. |
| **Phase 2 — Learning Engine** | Quiz/MCQ engine, model tests, progress tracking, doubt Q&A, certificates. |
| **Phase 3 — Live Classes** | Live class scheduling, embed integration, reminders. |
| **Phase 4 — Store** | Product catalog, cart, checkout, orders, inventory, coupons. |
| **Phase 5 — Payments & Notifications** | Payment gateway integration (bKash/Nagad/Rocket/cards), SMS/email notifications. |
| **Phase 6 — Polish & Launch** | Performance tuning, SEO, QA/testing, security review, deployment, monitoring setup. |

---

## 15. Acceptance Criteria (Definition of Done for v1)

- All three roles can log in and see role-appropriate dashboards, with server-side permission enforcement (not just hidden UI).
- A student can browse the catalog, purchase a course via at least one real payment method, and immediately access lesson content.
- A teacher can create a course, add chapters/lessons, upload a video and a PDF, build a quiz, and submit it for admin approval.
- An admin can approve/publish a teacher's course, manage all users, and view a sales report.
- A student can buy a book from the store, complete checkout with a real payment method, and the order appears in both student "My Orders" and admin "Orders" panel.
- A student can complete a quiz and see an instant scored result.
- A student reaching 100% course completion receives a downloadable certificate, verifiable on the public certificate page.
- The site is fully in Bengali, mobile-responsive, and passes basic Lighthouse performance/SEO checks (score > 80).
- The application is deployed to a live production URL with HTTPS, connected to production database and payment gateway (in live or verified sandbox mode, per client readiness).

---

## 16. Appendix: Glossary

- **SSC** — Secondary School Certificate (Class 9–10 board exam, Bangladesh).
- **HSC** — Higher Secondary Certificate (Class 11–12 board exam, Bangladesh).
- **Bangla 1st Paper** — Literature-focused paper (গদ্য, পদ্য, উপন্যাস, নাটক).
- **Bangla 2nd Paper** — Grammar and composition paper (ব্যাকরণ ও নির্মিতি).
- **bKash / Nagad / Rocket** — Mobile Financial Services (MFS), the dominant digital payment methods in Bangladesh.
- **MCQ** — Multiple Choice Question.

---

*End of document.*
