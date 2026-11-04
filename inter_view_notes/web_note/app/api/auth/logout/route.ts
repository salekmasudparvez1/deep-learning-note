import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { apiError } from "@/lib/api-errors";

export async function POST() {
  try { await clearSession(); return NextResponse.json({ ok: true }); }
  catch (error) { return apiError(error, "Could not sign out."); }
}
