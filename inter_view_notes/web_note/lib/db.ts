import "server-only";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");

const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

export class DatabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function isMissingSchemaError(error: unknown) {
  return (
    error instanceof DatabaseError &&
    (error.code === "PGRST205" ||
      error.message.includes("Could not find the table"))
  );
}

export async function db<T>(path: string, init: RequestInit = {}, useServiceRole: boolean = false): Promise<T> {
  if (!url || !key) {
    throw new DatabaseError(
      "Supabase server configuration is missing. Check your environment variables.",
      503,
    );
  }

  const normalizedPath = path.replace(/^\/+/, "");

  let response: Response;

  try {
    response = await fetch(`${url}/rest/v1/${normalizedPath}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new DatabaseError(
      `Supabase connection failed: ${
        error instanceof Error ? error.message : "Network error"
      }`,
      503,
    );
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    if (!response.ok) {
      throw new DatabaseError(
        `Database request failed (${response.status}).`,
        response.status,
      );
    }

    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new DatabaseError(
      body?.message ??
        body?.error ??
        `Database request failed (${response.status}).`,
      response.status,
      body?.code,
    );
  }

  return body as T;
}

export const now = () => new Date().toISOString();
