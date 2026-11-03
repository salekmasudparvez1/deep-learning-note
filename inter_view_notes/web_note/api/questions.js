import questionsHandler from "../lib/questions.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-AllowMethods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (typeof req.body === "string") req.body = JSON.parse(req.body);
    return questionsHandler(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
