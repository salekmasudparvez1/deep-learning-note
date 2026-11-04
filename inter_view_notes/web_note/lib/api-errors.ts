import { NextResponse } from "next/server";
import { DatabaseError, isMissingSchemaError } from "./db";

export function apiError(error: unknown, fallback: string) {
  console.error(error);

  if (isMissingSchemaError(error)) {
    return NextResponse.json(
      {
        error:
          "The database is not initialized. Apply the Supabase migrations, then retry.",
        code: "DATABASE_NOT_INITIALIZED",
      },
      { status: 503 },
    );
  }

  if (error instanceof DatabaseError) {
    const status = error.status >= 500 ? 503 : error.status;
    return NextResponse.json(
      { error: status === 503 ? "Database service is unavailable." : error.message },
      { status },
    );
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}
