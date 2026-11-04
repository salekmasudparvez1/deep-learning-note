import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
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

    const users = await adminDb<any[]>("users?select=id,email,name,role,created_at&order=created_at.desc");
    return NextResponse.json({ users });
  } catch (error) {
    return apiError(error, "Failed to fetch users");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role || !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await adminDb(
      `users?id=eq.${encodeURIComponent(id)}&select=id,email,name,role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }
    );

    return NextResponse.json({ user: updated[0] });
  } catch (error) {
    return apiError(error, "Failed to update user");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (id === user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await adminDb(`users?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Failed to delete user");
  }
}
