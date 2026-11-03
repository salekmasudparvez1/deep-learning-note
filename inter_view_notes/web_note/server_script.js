import { bodyOf, createId, supabase } from "./lib/supabase.js";
import { readRoutine } from "./lib/routine.js";
import questionsHandler from "./lib/questions.js";

function configureCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function routineHandler(req, res, body) {
  if (req.method === "GET") return res.status(200).json(await readRoutine());

  if (req.method === "POST" && (body.type || "record") === "record") {
    if (!body.taskId || typeof body.completed !== "boolean") {
      return res.status(400).json({ error: "A valid taskId and completed boolean are required." });
    }
    const task = await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}&select=id`);
    if (!task.length) {
      return res.status(400).json({ error: "A valid taskId and completed boolean are required." });
    }
    const [entry] = await supabase("routine_records", {
      method: "POST",
      body: JSON.stringify({
        task_id: body.taskId,
        completed: body.completed,
        timestamp: body.timestamp || new Date().toISOString(),
      }),
    });
    return res.status(200).json({ ok: true, entry, ...(await readRoutine()) });
  }

  if (req.method === "POST" && body.type === "group") {
    if (!body.title?.trim()) return res.status(400).json({ error: "Group title is required." });
    const [group] = await supabase("routine_groups", {
      method: "POST",
      body: JSON.stringify({
        id: createId("group"),
        title: body.title.trim(),
        subtitle: (body.subtitle || "").trim(),
      }),
    });
    return res.status(201).json({ ok: true, group });
  }

  if (req.method === "POST" && body.type === "topic") {
    if (!body.groupId || !body.title?.trim()) {
      return res.status(400).json({ error: "A valid groupId and topic title are required." });
    }
    const [task] = await supabase("routine_topics", {
      method: "POST",
      body: JSON.stringify({
        id: createId("topic"),
        group_id: body.groupId,
        title: body.title.trim(),
        hint: (body.hint || "").trim(),
      }),
    });
    return res.status(201).json({ ok: true, task });
  }

  if (req.method === "PUT" && body.type === "topic") {
    if (!body.taskId || !body.title?.trim()) {
      return res.status(400).json({ error: "A valid taskId and topic title are required." });
    }
    const [task] = await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title: body.title.trim(), hint: (body.hint || "").trim() }),
    });
    return res.status(200).json({ ok: true, task });
  }

  if (req.method === "DELETE" && body.type === "topic") {
    if (!body.taskId) return res.status(400).json({ error: "taskId is required." });
    await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}`, {
      method: "DELETE",
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Unsupported method or request type." });
}

export default async function handler(req, res) {
  configureCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const path = (req.url || "").split("?")[0];
    if (path.includes("/questions")) {
      req.body = bodyOf(req);
      return questionsHandler(req, res);
    }
    return routineHandler(req, res, bodyOf(req));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
