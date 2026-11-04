import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setSession, userByEmail } from "@/lib/auth";
import { apiError } from "@/lib/api-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A valid JSON body is required." }, { status: 400 });
    }
    const [user] = await userByEmail(String(body.email ?? "").trim());
    if (
      !user ||
      !(await bcrypt.compare(String(body.password ?? ""), user.password_hash))
    ) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return apiError(error, "Could not sign in.");
  }
}
