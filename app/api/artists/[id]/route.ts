import { NextResponse } from "next/server";
import { ensureMomentumSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const sql = await ensureMomentumSchema();

    const result = await sql`
      DELETE FROM momentum_artists
      WHERE id = ${id}
      RETURNING id
    `;

    if (!result.length) {
      return NextResponse.json({ error: "Artista não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json(
      { error: "Falha ao remover artista.", code: message },
      { status: message === "DATABASE_URL_NOT_CONFIGURED" ? 503 : 500 },
    );
  }
}
