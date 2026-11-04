import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth";

export async function POST() {
  try {
    const user = await refreshSession();
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Session expired." }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not refresh session." }, { status: 500 });
  }
}
