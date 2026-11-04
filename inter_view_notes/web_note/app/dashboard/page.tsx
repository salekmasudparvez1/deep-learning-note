import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/auth");

  return (
    <div className="wrap">
      <section className="hero">
        <span className="eyebrow">Manage your progress</span>
        <h1>Your learning command center.</h1>
        <p>Welcome back, {user.name}. Keep topics organized and make your daily routine fit your current goals.</p>
        <div className="actions">
          <Link className="btn primary" href="/routine">Open daily routine ↗</Link>
          <Link className="btn" href="/questions">Review questions</Link>
        </div>
      </section>
    </div>
  );
}
