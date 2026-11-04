import Link from "next/link";

export function AppHeader() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="brand" href="/"><span className="mark">PA</span><span>AI Eng Routine</span></Link>
        <nav className="navlinks" aria-label="Primary navigation">
          <Link href="/#resources">Resources</Link><Link href="/routine">Routine</Link>
          <Link href="/questions">Questions</Link><Link href="/dashboard">Dashboard</Link><Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
