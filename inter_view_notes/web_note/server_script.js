// server_script.js  →  deployed as /api (via vercel.json rewrite)
import fs from "fs";
import path from "path";
import initialData from "./api/data.json" with { type: "json" };

const DATA_FILE = path.join(process.cwd(), "api", "data.json");
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "parvez-ai-routine";

async function readData() {
  if (KV_URL && KV_TOKEN) {
    const response = await fetch(KV_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", KV_KEY]),
    });
    if (!response.ok) throw new Error(`KV read failed with HTTP ${response.status}`);
    const result = await response.json();
    return result.result ? JSON.parse(result.result) : structuredClone(initialData);
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return structuredClone(initialData);
  }
}

async function writeData(data) {
  if (KV_URL && KV_TOKEN) {
    const response = await fetch(KV_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(data)]),
    });
    if (!response.ok) throw new Error(`KV write failed with HTTP ${response.status}`);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Production storage is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN.",
    );
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getBody(req) {
  if (!req.body) return {};
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
}

function findTask(data, taskId) {
  for (const group of data.routine?.groups || []) {
    const task = (group.tasks || []).find((item) => item.id === taskId);
    if (task) return { group, task };
  }
  return null;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  let data;
  try {
    data = await readData();
  } catch (error) {
    res.status(500).json({ error: `api.json is missing or invalid: ${error.message}` });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json(data);
    return;
  }

  try {
    const body = getBody(req);
    const type = body.type || "record";

    if (type === "record" && req.method === "POST") {
      const { taskId, completed } = body;
      if (!taskId || typeof completed !== "boolean" || !findTask(data, taskId)) {
        res.status(400).json({ error: "A valid taskId and completed boolean are required." });
        return;
      }
      const entry = {
        taskId,
        completed,
        timestamp: body.timestamp || new Date().toISOString(),
      };
      if (!Array.isArray(data.records)) data.records = [];
      data.records.push(entry);
      await writeData(data);
      res.status(200).json({ ok: true, entry, records: data.records });
      return;
    }

    if (type === "group" && req.method === "POST") {
      const { title, subtitle = "" } = body;
      if (!title?.trim()) {
        res.status(400).json({ error: "Group title is required." });
        return;
      }
      const group = { id: makeId("group"), title: title.trim(), subtitle: subtitle.trim(), tasks: [] };
      data.routine.groups = [...(data.routine.groups || []), group];
      await writeData(data);
      res.status(201).json({ ok: true, group });
      return;
    }

    if (type === "topic" && req.method === "POST") {
      const { groupId, title, hint = "" } = body;
      const group = (data.routine?.groups || []).find((item) => item.id === groupId);
      if (!group || !title?.trim()) {
        res.status(400).json({ error: "A valid groupId and topic title are required." });
        return;
      }
      const task = { id: makeId("topic"), title: title.trim(), hint: hint.trim() };
      group.tasks = [...(group.tasks || []), task];
      await writeData(data);
      res.status(201).json({ ok: true, task });
      return;
    }

    if (type === "topic" && req.method === "PUT") {
      const { taskId, title, hint = "" } = body;
      const result = findTask(data, taskId);
      if (!result || !title?.trim()) {
        res.status(400).json({ error: "A valid taskId and topic title are required." });
        return;
      }
      result.task.title = title.trim();
      result.task.hint = hint.trim();
      await writeData(data);
      res.status(200).json({ ok: true, task: result.task });
      return;
    }

    if (type === "topic" && req.method === "DELETE") {
      const result = findTask(data, body.taskId);
      if (!result) {
        res.status(404).json({ error: "Topic not found." });
        return;
      }
      result.group.tasks = result.group.tasks.filter((task) => task.id !== body.taskId);
      data.records = (data.records || []).filter((record) => record.taskId !== body.taskId);
      await writeData(data);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Unsupported method or request type." });
  } catch (error) {
    res.status(400).json({ error: `Invalid request: ${error.message}` });
  }
}