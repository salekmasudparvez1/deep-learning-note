"use client";

import { useEffect, useState } from "react";
type Question = { id: string; question: string; answer: string; category: string; difficulty: string; status: string };
export function QuestionsPanel() {
  const [questions, setQuestions] = useState<Question[]>([]); const [error, setError] = useState("");
  async function load() { const response = await fetch("/api/questions"); const body = await response.json(); if (!response.ok) return setError(body.error); setQuestions(body.questions); }
  useEffect(() => { void load(); }, []);
  async function add() { const question = window.prompt("Question"); if (!question?.trim()) return; const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) }); if (!response.ok) setError((await response.json()).error); else void load(); }
  return <section className="section"><div className="section-head"><div><h1>Interview questions</h1><p>Build a private question bank and track what you have learned.</p></div><button className="btn primary" onClick={add}>＋ Add question</button></div>{error && <p className="error">{error}</p>}<div className="grid">{questions.map((item) => <article className="card" key={item.id}><span className="tag">{item.difficulty} · {item.status}</span><h3>{item.question}</h3><p>{item.answer || "Add your answer when you review this question."}</p></article>)}</div>{!questions.length && !error && <div className="card"><p>No questions yet. Add your first one.</p></div>}</section>;
}
