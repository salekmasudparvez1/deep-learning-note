import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth";
import { apiError } from "@/lib/api-errors";

export async function POST() {
  try {
    const user = await refreshSession();
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Session expired." }, { status: 401 });
  } catch (error) {
    return apiError(error, "Could not refresh session.");
  }
}
