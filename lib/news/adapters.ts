export type NewsDiscoverySource = "google_news" | "gdelt";

export type DiscoveredNewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  discoverySource: NewsDiscoverySource;
  query: string;
};

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match
    ? decode(match[1].trim()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "";
}

export function canonicalNewsUrl(raw: string) {
  try {
    const url = new URL(raw);
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
      "output",
    ].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return raw.trim();
  }
}

export function titleFingerprint(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(de|da|do|das|dos|e|a|o|em|para|por|com|um|uma)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 16)
    .join(" ");
}

function parseDate(value?: string) {
  if (!value) return new Date().toISOString();

  const direct = Date.parse(value);
  if (Number.isFinite(direct)) return new Date(direct).toISOString();

  const compact = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})Z?$/);
  if (compact) {
    const [, year, month, day, hour, minute, second] = compact;
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      ),
    ).toISOString();
  }

  return new Date().toISOString();
}

export async function searchGoogleNews(
  query: string,
  options: { limit?: number; locale?: string } = {},
): Promise<DiscoveredNewsArticle[]> {
  const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
  const locale = options.locale ?? "pt-BR";
  const isBrazilianPortuguese = locale.toLowerCase().startsWith("pt");
  const hl = isBrazilianPortuguese ? "pt-BR" : "en-US";
  const gl = isBrazilianPortuguese ? "BR" : "US";
  const ceid = isBrazilianPortuguese ? "BR:pt-419" : "US:en";

  const response = await fetch(
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`,
    {
      headers: { "User-Agent": "Momentum-Artist-Intelligence/1.0" },
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    throw new Error(`GOOGLE_NEWS_${response.status}`);
  }

  const xml = await response.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi)?.slice(0, limit) ?? [];

  return items.flatMap((item) => {
    const rawTitle = tag(item, "title");
    const parts = rawTitle.split(" - ");
    const source = parts.length > 1 ? parts.pop()! : "Google Notícias";
    const title = parts.join(" - ") || rawTitle;
    const url = tag(item, "link");
    const date = tag(item, "pubDate");

    if (!title || !url) return [];

    return [{
      title,
      url: canonicalNewsUrl(url),
      source,
      publishedAt: parseDate(date),
      discoverySource: "google_news" as const,
      query,
    }];
  });
}

type GdeltArticle = {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
  language?: string;
};

export async function searchGdelt(
  query: string,
  options: { limit?: number; hours?: number; portugueseOnly?: boolean } = {},
): Promise<DiscoveredNewsArticle[]> {
  const limit = Math.max(1, Math.min(options.limit ?? 35, 250));
  const hours = Math.max(1, Math.min(options.hours ?? 24, 168));
  const languageFilter = options.portugueseOnly === false ? "" : " sourcelang:portuguese";

  const params = new URLSearchParams({
    query: `${query}${languageFilter}`,
    mode: "artlist",
    maxrecords: String(limit),
    timespan: `${hours}h`,
    sort: "datedesc",
    format: "json",
  });

  const response = await fetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
    {
      headers: { "User-Agent": "Momentum-Artist-Intelligence/1.0" },
      next: { revalidate: 120 },
    },
  );

  if (!response.ok) {
    throw new Error(`GDELT_${response.status}`);
  }

  const data = (await response.json()) as { articles?: GdeltArticle[] };

  return (data.articles ?? []).flatMap((article) => {
    if (!article.title || !article.url) return [];

    return [{
      title: article.title,
      url: canonicalNewsUrl(article.url),
      source: article.domain ?? "GDELT",
      publishedAt: parseDate(article.seendate),
      discoverySource: "gdelt" as const,
      query,
    }];
  });
}

export function deduplicateNews(items: DiscoveredNewsArticle[]) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  return items.filter((item) => {
    const urlKey = canonicalNewsUrl(item.url);
    const titleKey = titleFingerprint(item.title);

    if (seenUrls.has(urlKey) || (titleKey && seenTitles.has(titleKey))) {
      return false;
    }

    seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    return true;
  });
}
