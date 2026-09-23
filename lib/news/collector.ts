import { randomUUID } from "crypto";
import { ensureMomentumSchema } from "@/lib/db";
import {
  deduplicateNews,
  searchGdelt,
  searchGoogleNews,
  type DiscoveredNewsArticle,
} from "@/lib/news/adapters";

type ArtistRow = {
  id: string;
  name: string;
  country: string;
};

type AliasRow = {
  artist_id: string;
  alias: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

function articleMentionsArtist(article: DiscoveredNewsArticle, names: string[]) {
  const haystack = normalize(article.title);
  return names.some((name) => {
    const needle = normalize(name);
    return needle.length >= 4 && haystack.includes(needle);
  });
}

function buildQueries(name: string, aliases: string[]) {
  const names = [name, ...aliases]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 4);

  return names.map((value) => `"${value.replace(/"/g, "")}"`);
}

export async function collectArtistNews(options: {
  artistId?: string;
  hours?: number;
}) {
  const sql = await ensureMomentumSchema();
  const hours = Math.max(1, Math.min(options.hours ?? 24, 168));

  const artists = (options.artistId
    ? await sql`
        SELECT id, name, country
        FROM momentum_artists
        WHERE id = ${options.artistId} AND status = 'active'
      `
    : await sql`
        SELECT id, name, country
        FROM momentum_artists
        WHERE status = 'active'
        ORDER BY created_at ASC
      `) as ArtistRow[];

  const aliases = (await sql`
    SELECT artist_id, alias
    FROM momentum_artist_aliases
    ORDER BY alias ASC
  `) as AliasRow[];

  const report: Array<{
    artistId: string;
    artistName: string;
    discovered: number;
    inserted: number;
    googleNews: number;
    gdelt: number;
    errors: string[];
  }> = [];

  for (const artist of artists) {
    const artistAliases = aliases
      .filter((row) => row.artist_id === artist.id)
      .map((row) => row.alias);

    const names = [artist.name, ...artistAliases];
    const queries = buildQueries(artist.name, artistAliases);
    const jobs: Promise<DiscoveredNewsArticle[]>[] = [];

    for (const query of queries) {
      jobs.push(searchGoogleNews(query, { limit: 25 }));
      jobs.push(searchGdelt(query, { limit: 40, hours }));
    }

    const settled = await Promise.allSettled(jobs);
    const errors = settled.flatMap((result) =>
      result.status === "rejected"
        ? [result.reason instanceof Error ? result.reason.message : String(result.reason)]
        : [],
    );

    const raw = settled.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );

    const relevant = deduplicateNews(raw).filter((article) =>
      articleMentionsArtist(article, names),
    );

    let inserted = 0;

    for (const article of relevant) {
      const metadata = JSON.stringify({
        discoverySource: article.discoverySource,
        discoveryQuery: article.query,
        artistName: artist.name,
        collectedBy: "momentum-news-multisource-v1",
      });

      const result = await sql`
        INSERT INTO momentum_monitoring_events (
          id,
          artist_id,
          source_type,
          source_platform,
          source_url,
          title,
          author,
          published_at,
          collected_at,
          metadata
        )
        SELECT
          ${randomUUID()},
          ${artist.id},
          'news',
          ${article.discoverySource},
          ${article.url},
          ${article.title},
          ${article.source},
          ${article.publishedAt},
          NOW(),
          ${metadata}::jsonb
        WHERE NOT EXISTS (
          SELECT 1
          FROM momentum_monitoring_events
          WHERE artist_id = ${artist.id}
            AND source_type = 'news'
            AND source_url = ${article.url}
        )
        RETURNING id
      `;

      if (result.length) inserted += 1;
    }

    report.push({
      artistId: artist.id,
      artistName: artist.name,
      discovered: relevant.length,
      inserted,
      googleNews: relevant.filter((item) => item.discoverySource === "google_news").length,
      gdelt: relevant.filter((item) => item.discoverySource === "gdelt").length,
      errors,
    });
  }

  return {
    ok: true,
    collectedAt: new Date().toISOString(),
    adapters: ["google_news", "gdelt"],
    artists: report,
    totals: {
      artists: report.length,
      discovered: report.reduce((sum, item) => sum + item.discovered, 0),
      inserted: report.reduce((sum, item) => sum + item.inserted, 0),
      googleNews: report.reduce((sum, item) => sum + item.googleNews, 0),
      gdelt: report.reduce((sum, item) => sum + item.gdelt, 0),
    },
  };
}
