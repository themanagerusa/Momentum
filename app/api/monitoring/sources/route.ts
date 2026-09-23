import { NextResponse } from "next/server";
import { ensureMomentumSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = await ensureMomentumSchema();

    const sources = await sql`
      SELECT
        s.id,
        s.artist_id,
        a.name AS artist_name,
        s.platform,
        s.target_url,
        s.source_kind,
        s.enabled,
        s.status,
        s.last_collected_at,
        s.next_collection_at,
        s.last_error,
        s.created_at
      FROM momentum_monitoring_sources s
      INNER JOIN momentum_artists a ON a.id = s.artist_id
      ORDER BY a.name ASC, s.platform ASC
    `;

    return NextResponse.json({ sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        error:
          message === "DATABASE_URL_NOT_CONFIGURED"
            ? "Banco de dados ainda não configurado."
            : "Falha ao carregar fontes de monitoramento.",
        code: message,
      },
      { status: message === "DATABASE_URL_NOT_CONFIGURED" ? 503 : 500 },
    );
  }
}
