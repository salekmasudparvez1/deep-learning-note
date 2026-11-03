const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://deep-learning-note-webnote.vercel.app",
]);

export function configureCors(req, res) {
  const origin = req.headers?.origin;
  res.setHeader(
    "Access-Control-Allow-Origin",
    origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://deep-learning-note-webnote.vercel.app",
  );
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
