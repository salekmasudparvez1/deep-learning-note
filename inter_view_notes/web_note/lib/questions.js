import { createId, supabase } from "./supabase.js";

const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const STATUSES = new Set(["not-started", "reviewing", "learned"]);

async function readQuestions() {
  const rows = await supabase(
    "interview_questions?select=id,question,answer,category,topic,difficulty,status,created_at,updated_at&order=created_at.desc",
  );
  return rows.map(({ id, question, answer, category, topic, difficulty, status }) => ({
    id,
    question,
    answer,
    category,
    topic,
    difficulty,
    status,
  }));
}

export default async function questionsHandler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, questions: await readQuestions() });
  }
  if (req.method === "POST") {
    const question = req.body?.question?.trim();
    if (!question) return res.status(400).json({ error: "Question text is required." });
    const [row] = await supabase("interview_questions", {
      method: "POST",
      body: JSON.stringify({
        id: createId("q"),
        question,
        answer: (req.body.answer || "").trim(),
        category: (req.body.category || "").trim(),
        topic: (req.body.topic || "").trim(),
        difficulty: DIFFICULTIES.has(req.body.difficulty) ? req.body.difficulty : "Medium",
        status: STATUSES.has(req.body.status) ? req.body.status : "not-started",
      }),
    });
    return res.status(201).json({ ok: true, question: row });
  }
  if (req.method === "PUT") {
    if (!req.body?.id) return res.status(400).json({ error: "id is required." });
    const patch = {};
    for (const field of ["question", "answer", "category", "topic"]) {
      if (typeof req.body[field] === "string") patch[field] = req.body[field].trim();
    }
    if (DIFFICULTIES.has(req.body.difficulty)) patch.difficulty = req.body.difficulty;
    if (STATUSES.has(req.body.status)) patch.status = req.body.status;
    if (!Object.keys(patch).length) return res.status(400).json({ error: "Nothing to update." });
    patch.updated_at = new Date().toISOString();
    const [row] = await supabase(
      `interview_questions?id=eq.${encodeURIComponent(req.body.id)}`,
      { method: "PATCH", body: JSON.stringify(patch) },
    );
    return res.status(200).json({ ok: true, question: row });
  }
  if (req.method === "DELETE") {
    if (!req.body?.id) return res.status(400).json({ error: "id is required." });
    await supabase(`interview_questions?id=eq.${encodeURIComponent(req.body.id)}`, {
      method: "DELETE",
    });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Unsupported method." });
}
