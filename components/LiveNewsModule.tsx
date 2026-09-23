"use client";

import { Activity, Newspaper, Radio, RefreshCw, Search, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type NewsItem = {
  id: string;
  artist_id: string;
  artist_name: string;
  source_platform: "google_news" | "gdelt" | string;
  source_url: string;
  title: string;
  author?: string | null;
  published_at?: string | null;
  collected_at: string;
  sentiment?: string | null;
  sentiment_score?: number | null;
  metadata?: Record<string, unknown> | null;
};

type NewsPayload = {
  items: NewsItem[];
  total: number;
  adapters: Record<string, number>;
  updatedAt: string;
};

export default function LiveNewsModule() {
  const [payload, setPayload] = useState<NewsPayload>({
    items: [],
    total: 0,
    adapters: {},
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  async function loadNews() {
    setLoading(true);
    try {
      const response = await fetch("/api/news?limit=150", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Não foi possível carregar as notícias.");
        return;
      }
      setPayload(data);
    } catch {
      setMessage("Falha ao carregar o radar de notícias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  async function collectNow() {
    setCollecting(true);
    setMessage("");
    try {
      const response = await fetch("/api/news/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: 24 }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "A coleta não pôde ser concluída.");
        return;
      }

      if (!data.totals?.artists) {
        setMessage("Cadastre ao menos um artista para iniciar a leitura de notícias.");
      } else {
        setMessage(
          `Coleta concluída: ${data.totals.inserted} novas notícias salvas · Google ${data.totals.googleNews} · GDELT ${data.totals.gdelt}.`,
        );
      }

      await loadNews();
    } catch {
      setMessage("Falha ao executar a coleta multifonte.");
    } finally {
      setCollecting(false);
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return payload.items;

    return payload.items.filter((item) =>
      [item.title, item.artist_name, item.author, item.source_platform]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(normalized)),
    );
  }, [payload.items, query]);

  const googleCount = payload.adapters.google_news || 0;
  const gdeltCount = payload.adapters.gdelt || 0;
  const artistCount = new Set(payload.items.map((item) => item.artist_id)).size;

  return (
    <>
      <section className="newsHero">
        <div>
          <span className="sectionEyebrow">RADAR MULTIFONTE</span>
          <h2>Notícias em tempo real</h2>
          <p>
            O Momentum cruza Google News RSS e GDELT, elimina duplicidades e
            vincula cada matéria ao artista cadastrado.
          </p>
        </div>
        <button className="primary" onClick={collectNow} disabled={collecting}>
          <RefreshCw size={15} className={collecting ? "spin" : ""}/>
          {collecting ? "Coletando..." : "Atualizar notícias"}
        </button>
      </section>

      <section className="grid kpis">
        <div className="card kpi">
          <div className="kpiTop"><span>Notícias armazenadas</span><Newspaper size={18}/></div>
          <strong>{payload.total}</strong>
          <small className="up">corpus atual</small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>Google News RSS</span><Search size={18}/></div>
          <strong>{googleCount}</strong>
          <small className="up">descobertas no feed</small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>GDELT</span><Radio size={18}/></div>
          <strong>{gdeltCount}</strong>
          <small className="up">descobertas no adaptador</small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>Artistas cobertos</span><Zap size={18}/></div>
          <strong>{artistCount}</strong>
          <small className="up">com notícia coletada</small>
        </div>
      </section>

      <section className="card artistDirectory newsDirectory">
        <div className="directoryHead">
          <div>
            <span className="sectionEyebrow">LEITURA CONSOLIDADA</span>
            <h3>Google News + GDELT</h3>
          </div>
          <div className="artistSearch">
            <Search size={15}/>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar notícia ou artista..."
            />
          </div>
        </div>

        {message && <div className="systemNotice"><Activity size={15}/><span>{message}</span></div>}

        {loading ? (
          <div className="emptyState">Carregando notícias...</div>
        ) : filtered.length === 0 ? (
          <div className="emptyState">
            <Newspaper size={28}/>
            <b>Nenhuma notícia coletada ainda.</b>
            <span>Cadastre um artista e execute “Atualizar notícias”.</span>
          </div>
        ) : (
          <div className="liveNewsList">
            {filtered.map((item) => (
              <a
                className="liveNewsItem"
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                key={item.id}
              >
                <div className="newsSourceBadge">
                  <span className={item.source_platform === "gdelt" ? "gdelt" : "google"}>
                    {item.source_platform === "gdelt" ? "GDELT" : "Google News"}
                  </span>
                </div>
                <div className="liveNewsBody">
                  <span>
                    {item.artist_name} · {item.author || "Fonte não identificada"}
                  </span>
                  <b>{item.title}</b>
                  <small>
                    {new Date(item.published_at || item.collected_at).toLocaleString("pt-BR")}
                  </small>
                </div>
                <div className="liveNewsStatus">
                  <span>{item.sentiment || "sentimento pendente"}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
