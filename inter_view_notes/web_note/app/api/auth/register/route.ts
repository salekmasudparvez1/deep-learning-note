import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const normalized = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || String(password ?? "").length < 8) {
      return NextResponse.json({ error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
    }
    const isAdminEmail = normalized === process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (isAdminEmail && !process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 503 });
    }
    if (isAdminEmail && password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "The configured admin credentials are required." }, { status: 403 });
    }
    const [existing] = await db<{ id: string }[]>(`users?email=eq.${encodeURIComponent(normalized)}&select=id`);
    if (existing) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    const rows = await db<{ id: string; email: string; name: string; role: "admin" | "user" }[]>("users", {
      method: "POST", body: JSON.stringify({ email: normalized, name: String(name ?? "").trim() || normalized.split("@")[0], password_hash: await bcrypt.hash(password, 12), role: isAdminEmail ? "admin" : "user" }),
    });
    await setSession(rows[0]);
    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
