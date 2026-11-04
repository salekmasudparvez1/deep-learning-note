import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "admin") redirect("/dashboard");
  return <div className="wrap"><section className="hero"><span className="eyebrow">Admin workspace</span><h1>Manage the learning platform.</h1><p>Signed in as {user.email}. This area is restricted to the configured administrator.</p></section></div>;
}
