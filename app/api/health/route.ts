import { NextResponse } from "next/server";
import { ensureMomentumSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = await ensureMomentumSchema();

    const artistCount = await sql`SELECT COUNT(*)::int AS count FROM momentum_artists`;
    const sourceCount = await sql`SELECT COUNT(*)::int AS count FROM momentum_monitoring_sources WHERE enabled = TRUE`;
    const eventCount = await sql`SELECT COUNT(*)::int AS count FROM momentum_monitoring_events`;

    return NextResponse.json({
      ok: true,
      database: "online",
      artists: artistCount[0]?.count || 0,
      monitoringSources: sourceCount[0]?.count || 0,
      monitoringEvents: eventCount[0]?.count || 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        ok: false,
        database: message === "DATABASE_URL_NOT_CONFIGURED" ? "not_configured" : "error",
        code: message,
      },
      { status: message === "DATABASE_URL_NOT_CONFIGURED" ? 503 : 500 },
    );
  }
}
