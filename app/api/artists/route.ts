import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  ArtistInput,
  ensureMomentumSchema,
  extractHandle,
  normalizeUrl,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function cleanList(values: unknown) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function validateArtist(body: ArtistInput) {
  if (!body.name || !String(body.name).trim()) {
    return "Nome do artista é obrigatório.";
  }

  const platforms = Array.isArray(body.platforms) ? body.platforms : [];
  for (const item of platforms) {
    if (!item?.url?.trim()) continue;

    try {
      new URL(normalizeUrl(item.url));
    } catch {
      return `URL inválida para ${item.platform}.`;
    }
  }

  return null;
}

export async function GET() {
  try {
    const sql = await ensureMomentumSchema();

    const artists = await sql`
      SELECT id, name, country, genre, image_url, chartmetric_id, status, created_at, updated_at
      FROM momentum_artists
      ORDER BY created_at DESC
    `;

    const platforms = await sql`
      SELECT artist_id, platform, url, handle, external_id, monitor_enabled
      FROM momentum_artist_platforms
      ORDER BY platform ASC
    `;

    const aliases = await sql`
      SELECT artist_id, alias
      FROM momentum_artist_aliases
      ORDER BY alias ASC
    `;

    const keywords = await sql`
      SELECT artist_id, keyword
      FROM momentum_artist_keywords
      ORDER BY keyword ASC
    `;

    const payload = artists.map((artist) => ({
      ...artist,
      platforms: platforms.filter((item) => item.artist_id === artist.id),
      aliases: aliases.filter((item) => item.artist_id === artist.id).map((item) => item.alias),
      keywords: keywords.filter((item) => item.artist_id === artist.id).map((item) => item.keyword),
    }));

    return NextResponse.json({ artists: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const databaseMissing = message === "DATABASE_URL_NOT_CONFIGURED";

    return NextResponse.json(
      {
        error: databaseMissing
          ? "Banco de dados ainda não configurado."
          : "Falha ao carregar artistas.",
        code: message,
      },
      { status: databaseMissing ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArtistInput;
    const validationError = validateArtist(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const sql = await ensureMomentumSchema();
    const artistId = randomUUID();
    const now = new Date().toISOString();

    const name = String(body.name).trim();
    const country = String(body.country || "Brasil").trim();
    const genre = String(body.genre || "").trim() || null;
    const imageUrl = String(body.imageUrl || "").trim() || null;
    const chartmetricId = String(body.chartmetricId || "").trim() || null;

    await sql`
      INSERT INTO momentum_artists
        (id, name, country, genre, image_url, chartmetric_id, status, created_at, updated_at)
      VALUES
        (${artistId}, ${name}, ${country}, ${genre}, ${imageUrl}, ${chartmetricId}, 'active', ${now}, ${now})
    `;

    const platforms = Array.isArray(body.platforms) ? body.platforms : [];

    for (const item of platforms) {
      const platform = String(item.platform || "").trim().toLowerCase();
      const url = normalizeUrl(String(item.url || ""));

      if (!platform || !url) continue;

      const id = randomUUID();
      const handle = extractHandle(platform, url);
      const monitorEnabled = item.monitorEnabled !== false;

      await sql`
        INSERT INTO momentum_artist_platforms
          (id, artist_id, platform, url, handle, monitor_enabled, created_at, updated_at)
        VALUES
          (${id}, ${artistId}, ${platform}, ${url}, ${handle}, ${monitorEnabled}, ${now}, ${now})
      `;
    }

    for (const alias of cleanList(body.aliases)) {
      await sql`
        INSERT INTO momentum_artist_aliases (id, artist_id, alias)
        VALUES (${randomUUID()}, ${artistId}, ${alias})
        ON CONFLICT (artist_id, alias) DO NOTHING
      `;
    }

    for (const keyword of cleanList(body.keywords)) {
      await sql`
        INSERT INTO momentum_artist_keywords (id, artist_id, keyword)
        VALUES (${randomUUID()}, ${artistId}, ${keyword})
        ON CONFLICT (artist_id, keyword) DO NOTHING
      `;
    }

    return NextResponse.json(
      { ok: true, artistId, message: "Artista cadastrado e salvo no banco." },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const databaseMissing = message === "DATABASE_URL_NOT_CONFIGURED";

    return NextResponse.json(
      {
        error: databaseMissing
          ? "Banco de dados ainda não configurado."
          : "Falha ao cadastrar artista.",
        code: message,
      },
      { status: databaseMissing ? 503 : 500 },
    );
  }
}
