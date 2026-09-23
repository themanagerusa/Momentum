import { NextResponse } from "next/server";
import { collectArtistNews } from "@/lib/news/collector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const artistId = typeof body.artistId === "string" ? body.artistId : undefined;
    const hours = Number.isFinite(Number(body.hours)) ? Number(body.hours) : 24;

    const result = await collectArtistNews({ artistId, hours });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json(
      {
        ok: false,
        error:
          message === "DATABASE_URL_NOT_CONFIGURED"
            ? "Banco de dados ainda não configurado."
            : "Falha na coleta multifonte de notícias.",
        code: message,
      },
      { status: message === "DATABASE_URL_NOT_CONFIGURED" ? 503 : 500 },
    );
  }
}
