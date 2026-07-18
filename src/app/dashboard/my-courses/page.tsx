import { redirect } from "next/navigation";

// The payment simulator redirects here after a successful course enrollment payment.
// The student dashboard (/dashboard) already shows all enrolled courses, so we redirect there.
export default function MyCoursesRedirectPage() {
  redirect("/dashboard");
}
