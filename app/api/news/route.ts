import { NextResponse } from "next/server";
import { ensureMomentumSchema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const artistId = url.searchParams.get("artistId");
    const requestedLimit = Number(url.searchParams.get("limit") || 100);
    const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 100, 300));

    const sql = await ensureMomentumSchema();

    const items = artistId
      ? await sql`
          SELECT
            e.id,
            e.artist_id,
            a.name AS artist_name,
            e.source_platform,
            e.source_url,
            e.title,
            e.author,
            e.published_at,
            e.collected_at,
            e.sentiment,
            e.sentiment_score,
            e.relevance_score,
            e.metadata
          FROM momentum_monitoring_events e
          INNER JOIN momentum_artists a ON a.id = e.artist_id
          WHERE e.source_type = 'news'
            AND e.artist_id = ${artistId}
          ORDER BY COALESCE(e.published_at, e.collected_at) DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT
            e.id,
            e.artist_id,
            a.name AS artist_name,
            e.source_platform,
            e.source_url,
            e.title,
            e.author,
            e.published_at,
            e.collected_at,
            e.sentiment,
            e.sentiment_score,
            e.relevance_score,
            e.metadata
          FROM momentum_monitoring_events e
          INNER JOIN momentum_artists a ON a.id = e.artist_id
          WHERE e.source_type = 'news'
          ORDER BY COALESCE(e.published_at, e.collected_at) DESC
          LIMIT ${limit}
        `;

    const adapterCounts = items.reduce<Record<string, number>>((acc, item) => {
      const key = String(item.source_platform || "unknown");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      items,
      total: items.length,
      adapters: adapterCounts,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json(
      {
        error:
          message === "DATABASE_URL_NOT_CONFIGURED"
            ? "Banco de dados ainda não configurado."
            : "Falha ao carregar notícias.",
        code: message,
      },
      { status: message === "DATABASE_URL_NOT_CONFIGURED" ? 503 : 500 },
    );
  }
}
