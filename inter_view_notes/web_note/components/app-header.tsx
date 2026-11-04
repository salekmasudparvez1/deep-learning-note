"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; email: string; name: string; role: "admin" | "user" };

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="brand" href="/">
          <span className="mark">PA</span>
          <span>AI Eng Routine</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <nav
          className={`navlinks ${mobileMenuOpen ? "open" : ""}`}
          aria-label="Primary navigation"
        >
          <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>
            Features
          </Link>
          <Link href="/#resources" onClick={() => setMobileMenuOpen(false)}>
            Resources
          </Link>
          <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)}>
            Pricing
          </Link>
          <Link href="/routine" onClick={() => setMobileMenuOpen(false)}>
            Routine
          </Link>
          <Link href="/questions" onClick={() => setMobileMenuOpen(false)}>
            Questions
          </Link>
          {user && (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          )}
          {!loading && user && (
            <button onClick={handleLogout} className="btn">
              Logout
            </button>
          )}
          {!loading && !user && (
            <Link href="/auth" className="btn primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
