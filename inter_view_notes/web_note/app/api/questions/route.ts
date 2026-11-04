import { NextResponse } from "next/server";
import { currentUser, refreshSession } from "@/lib/auth";
import { db, now } from "@/lib/db";

async function auth() {
  return (await currentUser()) ?? (await refreshSession());
}
export async function GET() {
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const questions = await db(`interview_questions?or=(user_id.eq.${user.id},user_id.is.null)&select=id,question,answer,category,topic,difficulty,status,created_at,updated_at&order=created_at.desc`);
  return NextResponse.json({ questions });
}
export async function POST(request: Request) {
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!String(body.question ?? "").trim()) return NextResponse.json({ error: "Question text is required." }, { status: 400 });
  const [question] = await db<Record<string, unknown>[]>("interview_questions", { method: "POST", body: JSON.stringify({
    user_id: user.id, question: String(body.question).trim(), answer: String(body.answer ?? "").trim(),
    category: String(body.category ?? "").trim(), topic: String(body.topic ?? "").trim(),
    difficulty: ["Easy", "Medium", "Hard"].includes(body.difficulty) ? body.difficulty : "Medium",
    status: ["not-started", "reviewing", "learned"].includes(body.status) ? body.status : "not-started",
  }) });
  return NextResponse.json({ question }, { status: 201 });
}
export async function PATCH(request: Request) {
  const user = await auth(); const body = await request.json();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const patch = Object.fromEntries(["question", "answer", "category", "topic", "difficulty", "status"].filter((key) => body[key] !== undefined).map((key) => [key, typeof body[key] === "string" ? body[key].trim() : body[key]]));
  if (!Object.keys(patch).length || !body.id) return NextResponse.json({ error: "A question id and update are required." }, { status: 400 });
  patch.updated_at = now();
  const [question] = await db<Record<string, unknown>[]>(`interview_questions?id=eq.${encodeURIComponent(body.id)}&user_id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify(patch) });
  return NextResponse.json({ question });
}
export async function DELETE(request: Request) {
  const user = await auth(); const { id } = await request.json();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!id) return NextResponse.json({ error: "Question id is required." }, { status: 400 });
  await db(`interview_questions?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`, { method: "DELETE" });
  return NextResponse.json({ ok: true });
}
