import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { apiError } from "@/lib/api-errors";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function adminDb<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!url || !serviceKey) {
    throw new Error("Supabase service role configuration is missing");
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const response = await fetch(`${url}/rest/v1/${normalizedPath}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw new Error(`Database request failed (${response.status})`);
    }
    return undefined as T;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? body?.error ?? `Database request failed (${response.status})`);
  }
  return body as T;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const groups = await adminDb<any[]>("routine_groups?select=*&order=sort_order.asc");
    const topics = await adminDb<any[]>("routine_topics?select=*&order=sort_order.asc");

    return NextResponse.json({ groups, topics });
  } catch (error) {
    return apiError(error, "Failed to fetch routine data");
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (type === "group") {
      const { id, title, subtitle, sort_order } = data;
      const newGroup = await adminDb("routine_groups", {
        method: "POST",
        body: JSON.stringify({
          id,
          title,
          subtitle: subtitle || "",
          sort_order: sort_order || 0,
        }),
      });
      return NextResponse.json({ group: newGroup[0] });
    }

    if (type === "topic") {
      const { id, group_id, title, hint, sort_order } = data;
      const newTopic = await adminDb("routine_topics", {
        method: "POST",
        body: JSON.stringify({
          id,
          group_id,
          title,
          hint: hint || "",
          sort_order: sort_order || 0,
        }),
      });
      return NextResponse.json({ topic: newTopic[0] });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Failed to create routine item");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, id, data } = body;

    if (type === "group") {
      const updated = await adminDb(
        `routine_groups?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      return NextResponse.json({ group: updated[0] });
    }

    if (type === "topic") {
      const updated = await adminDb(
        `routine_topics?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      return NextResponse.json({ topic: updated[0] });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Failed to update routine item");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID required" }, { status: 400 });
    }

    if (type === "group") {
      await adminDb(`routine_groups?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return NextResponse.json({ ok: true });
    }

    if (type === "topic") {
      await adminDb(`routine_topics?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Failed to delete routine item");
  }
}
