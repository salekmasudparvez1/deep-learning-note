import questionsHandler from "../lib/questions.js";
import { configureCors } from "../lib/cors.js";

export default async function handler(req, res) {
  configureCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (typeof req.body === "string") req.body = JSON.parse(req.body);
    return await questionsHandler(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
