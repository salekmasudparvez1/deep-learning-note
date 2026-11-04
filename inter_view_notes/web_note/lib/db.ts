const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

export async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!url || !key) throw new Error("Supabase server configuration is missing.");
  const response = await fetch(`${url}/rest/v1/${path}`, {
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
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message ?? `Database request failed (${response.status}).`);
  return body as T;
}

export const now = () => new Date().toISOString();
