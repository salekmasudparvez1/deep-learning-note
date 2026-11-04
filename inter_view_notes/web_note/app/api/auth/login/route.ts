import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setSession, userByEmail } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [user] = await userByEmail(String(body.email ?? "").trim());
    if (!user || !(await bcrypt.compare(String(body.password ?? ""), user.password_hash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await setSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
