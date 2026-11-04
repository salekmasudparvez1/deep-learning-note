"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const body = await response.json();
    if (!response.ok) return setError(body.error ?? "Authentication failed.");
    router.push("/dashboard"); router.refresh();
  }
  return <section className="card auth"><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="sub">Your questions and routine are private to your account.</p>
    <form className="form" onSubmit={submit}>{mode === "register" && <label>Name<input name="name" required maxLength={80}/></label>}<label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>{error && <p className="error">{error}</p>}<button className="btn primary" type="submit">{mode === "login" ? "Sign in" : "Create account"}</button></form>
    <button className="btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account?" : "Already have an account?"}</button></section>;
}
