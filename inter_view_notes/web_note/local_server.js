import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "./server_script.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function createResponse(res) {
  return {
    setHeader: (name, value) => res.setHeader(name, value),
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(body) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(body));
      return this;
    },
    end(body) {
      res.end(body);
      return this;
    },
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(req, res) {
  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const requestedFile =
    requestPath === "/"
      ? "index.html"
      : requestPath === "/dashboard"
        ? "dashboard.html"
        : requestPath === "/question"
          ? "question.html"
          : requestPath.slice(1);
  const filePath = normalize(join(root, requestedFile));

  if (!filePath.startsWith(root)) {
    res.writeHead(400);
    res.end("Invalid path");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    });
    res.end(body);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api")) {
      req.body = await readBody(req);
      await handler(req, createResponse(res));
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500);
    res.end("Internal server error");
  }
});

server.listen(port, () => {
  console.log(`Interview notes running at http://localhost:${port}`);
});
