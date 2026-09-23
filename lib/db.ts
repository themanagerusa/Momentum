import { neon } from "@neondatabase/serverless";

export type ArtistPlatformInput = {
  platform: string;
  url: string;
  monitorEnabled?: boolean;
};

export type ArtistInput = {
  name: string;
  country?: string;
  genre?: string;
  imageUrl?: string;
  chartmetricId?: string;
  aliases?: string[];
  keywords?: string[];
  platforms?: ArtistPlatformInput[];
};

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL_NOT_CONFIGURED");
  }
  return neon(connectionString);
}

export async function ensureMomentumSchema() {
  const sql = getDatabase();

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_artists (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Brasil',
      genre TEXT,
      image_url TEXT,
      chartmetric_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_artist_platforms (
      id UUID PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      handle TEXT,
      external_id TEXT,
      monitor_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (artist_id, platform)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_artist_aliases (
      id UUID PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (artist_id, alias)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_artist_keywords (
      id UUID PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
      keyword TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (artist_id, keyword)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_monitoring_sources (
      id UUID PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      target_url TEXT NOT NULL,
      source_kind TEXT NOT NULL DEFAULT 'official_profile',
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'pending',
      last_collected_at TIMESTAMPTZ,
      next_collection_at TIMESTAMPTZ,
      last_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (artist_id, platform, target_url)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS momentum_monitoring_events (
      id UUID PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL,
      source_platform TEXT,
      source_url TEXT,
      title TEXT,
      body TEXT,
      author TEXT,
      published_at TIMESTAMPTZ,
      collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sentiment TEXT,
      sentiment_score DOUBLE PRECISION,
      relevance_score DOUBLE PRECISION,
      engagement_count BIGINT,
      reach_estimate BIGINT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_momentum_platforms_artist ON momentum_artist_platforms(artist_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_momentum_sources_artist ON momentum_monitoring_sources(artist_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_momentum_sources_due ON momentum_monitoring_sources(enabled, next_collection_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_momentum_events_artist_time ON momentum_monitoring_events(artist_id, collected_at DESC)`;

  return sql;
}

export function extractHandle(platform: string, rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const parts = url.pathname.split("/").filter(Boolean);

    if (platform === "youtube") {
      const candidate = parts.find((part) => part.startsWith("@"));
      return candidate || null;
    }

    if (["instagram", "tiktok", "x", "facebook", "threads"].includes(platform)) {
      return parts[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}

export function extractExternalId(platform: string, rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const parts = url.pathname.split("/").filter(Boolean);

    if (platform === "spotify" && parts[0] === "artist") return parts[1] || null;
    if (platform === "deezer" && parts[0] === "artist") return parts[1] || null;
    if (platform === "youtube") {
      const channelIndex = parts.indexOf("channel");
      if (channelIndex >= 0) return parts[channelIndex + 1] || null;
      return parts.find((part) => part.startsWith("@")) || null;
    }
    if (platform === "apple_music") {
      const last = parts.at(-1) || "";
      const match = last.match(/id(\d+)/);
      return match?.[1] || null;
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
