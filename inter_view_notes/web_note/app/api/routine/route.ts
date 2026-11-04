import { NextResponse } from "next/server";
import { currentUser, refreshSession } from "@/lib/auth";
import { db } from "@/lib/db";

const groups = ["core-preparation", "applied-ai-engineering"];
async function auth() { return (await currentUser()) ?? (await refreshSession()); }
export async function GET() {
  const user = await auth(); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const [topics, records] = await Promise.all([
    db<{ id: string; group_id: string; title: string; hint: string }[]>("routine_topics?select=id,group_id,title,hint&order=sort_order.asc"),
    db<{ task_id: string; completed: boolean; timestamp: string }[]>(`routine_records?user_id=eq.${user.id}&select=task_id,completed,timestamp&order=timestamp.asc`),
  ]);
  return NextResponse.json({ groups: groups.map((id) => ({ id, title: id === groups[0] ? "Core preparation" : "Applied AI engineering", tasks: topics.filter((topic) => topic.group_id === id) })), records });
}
export async function POST(request: Request) {
  const user = await auth(); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { taskId, completed } = await request.json();
  if (!taskId || typeof completed !== "boolean") return NextResponse.json({ error: "A valid taskId and completed value are required." }, { status: 400 });
  const [entry] = await db<Record<string, unknown>[]>("routine_records", { method: "POST", body: JSON.stringify({ user_id: user.id, task_id: taskId, completed }) });
  return NextResponse.json({ entry });
}
