-- Momentum / Artist Intelligence
-- Este arquivo documenta o schema criado automaticamente pela API.
-- A aplicação também executa CREATE TABLE IF NOT EXISTS na primeira operação com DATABASE_URL configurada.

CREATE TABLE momentum_artists (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',
  genre TEXT,
  image_url TEXT,
  chartmetric_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE momentum_artist_platforms (
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
);

CREATE TABLE momentum_artist_aliases (
  id UUID PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, alias)
);

CREATE TABLE momentum_artist_keywords (
  id UUID PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES momentum_artists(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, keyword)
);

CREATE TABLE momentum_monitoring_events (
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
);
