import Link from "next/link";
import { currentUser } from "@/lib/auth";

export async function AppHeader() {
  const user = await currentUser();
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="brand" href="/"><span className="mark">PA</span><span>AI Eng Routine</span></Link>
        <nav className="navlinks" aria-label="Primary navigation">
          <Link href="/#resources">Resources</Link><Link href="/routine">Routine</Link>
          <Link href="/questions">Questions</Link><Link href="/dashboard">Dashboard</Link>
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        </nav>
      </div>
    </header>
  );
}
