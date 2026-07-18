import { redirect } from "next/navigation";

// The payment simulator redirects here after a successful bookstore order payment.
// The student dashboard (/dashboard) already shows all orders, so we redirect there.
export default function MyOrdersRedirectPage() {
  redirect("/dashboard");
}
