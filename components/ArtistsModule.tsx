"use client";

import {
  AlertCircle,
  Check,
  Database,
  Globe2,
  Link2,
  Music2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type PlatformKey =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "spotify"
  | "apple_music"
  | "deezer"
  | "x"
  | "facebook"
  | "threads"
  | "kwai"
  | "soundcloud"
  | "amazon_music"
  | "website";

type ArtistPlatform = {
  artist_id: string;
  platform: PlatformKey;
  url: string;
  handle?: string | null;
  external_id?: string | null;
  monitor_enabled: boolean;
};

type ArtistRecord = {
  id: string;
  name: string;
  country: string;
  genre?: string | null;
  image_url?: string | null;
  chartmetric_id?: string | null;
  status: string;
  aliases: string[];
  keywords: string[];
  platforms: ArtistPlatform[];
};

type PlatformForm = {
  key: PlatformKey;
  label: string;
  placeholder: string;
  url: string;
  monitorEnabled: boolean;
};

const platformBlueprint: Omit<PlatformForm, "url" | "monitorEnabled">[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/artista" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@artista" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@artista" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { key: "apple_music", label: "Apple Music", placeholder: "https://music.apple.com/..." },
  { key: "deezer", label: "Deezer", placeholder: "https://deezer.com/artist/..." },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/artista" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/artista" },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@artista" },
  { key: "kwai", label: "Kwai", placeholder: "https://kwai.com/..." },
  { key: "soundcloud", label: "SoundCloud", placeholder: "https://soundcloud.com/artista" },
  { key: "amazon_music", label: "Amazon Music", placeholder: "https://music.amazon.com/artists/..." },
  { key: "website", label: "Site oficial", placeholder: "https://artista.com.br" },
];

const initialPlatforms = () =>
  platformBlueprint.map((platform) => ({
    ...platform,
    url: "",
    monitorEnabled: true,
  }));

export default function ArtistsModule({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [platforms, setPlatforms] = useState<PlatformForm[]>(initialPlatforms);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [genre, setGenre] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [chartmetricId, setChartmetricId] = useState("");
  const [aliases, setAliases] = useState("");
  const [keywords, setKeywords] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  async function loadArtists() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/artists", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setDatabaseReady(response.status !== 503 ? null : false);
        setMessage(data.error || "Não foi possível carregar os artistas.");
        return;
      }

      setArtists(data.artists || []);
      setDatabaseReady(true);
    } catch {
      setMessage("Falha de comunicação com a API de artistas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return artists;

    return artists.filter((artist) =>
      [artist.name, artist.country, artist.genre, ...(artist.aliases || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [artists, query]);

  function resetForm() {
    setName("");
    setCountry("Brasil");
    setGenre("");
    setImageUrl("");
    setChartmetricId("");
    setAliases("");
    setKeywords("");
    setPlatforms(initialPlatforms());
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country,
          genre,
          imageUrl,
          chartmetricId,
          aliases: aliases.split(",").map((item) => item.trim()).filter(Boolean),
          keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
          platforms: platforms
            .filter((platform) => platform.url.trim())
            .map((platform) => ({
              platform: platform.key,
              url: platform.url,
              monitorEnabled: platform.monitorEnabled,
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDatabaseReady(response.status !== 503 ? databaseReady : false);
        setMessage(data.error || "Não foi possível cadastrar o artista.");
        return;
      }

      setDatabaseReady(true);
      resetForm();
      onOpenChange(false);
      setMessage("Artista cadastrado. As redes oficiais já estão vinculadas ao monitoramento.");
      await loadArtists();
    } catch {
      setMessage("Falha de comunicação ao cadastrar o artista.");
    } finally {
      setSaving(false);
    }
  }

  async function removeArtist(id: string, artistName: string) {
    if (!window.confirm(`Remover ${artistName} e todas as redes vinculadas?`)) return;

    const response = await fetch(`/api/artists/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadArtists();
    } else {
      const data = await response.json();
      setMessage(data.error || "Não foi possível remover o artista.");
    }
  }

  return (
    <>
      <section className="artistToolbar">
        <div>
          <span className="sectionEyebrow">BASE DE MONITORAMENTO</span>
          <h2>Artistas cadastrados</h2>
          <p>
            Cada perfil oficial cadastrado passa a compor a identidade digital usada
            pelo Momentum para coleta, reputação e inteligência artística.
          </p>
        </div>
        <button className="primary" onClick={() => onOpenChange(true)}>
          <Plus size={16} /> Adicionar artista
        </button>
      </section>

      <section className="grid artistStats">
        <div className="card kpi">
          <div className="kpiTop"><span>Artistas</span><UserRound size={18}/></div>
          <strong>{artists.length}</strong>
          <small className="up">cadastrados no banco</small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>Perfis oficiais</span><Link2 size={18}/></div>
          <strong>{artists.reduce((total, artist) => total + artist.platforms.length, 0)}</strong>
          <small className="up">links vinculados</small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>Banco de dados</span><Database size={18}/></div>
          <strong>{databaseReady === true ? "Online" : databaseReady === false ? "Pendente" : "Verificando"}</strong>
          <small className={databaseReady ? "up" : "down"}>
            {databaseReady ? "persistência disponível" : "aguardando DATABASE_URL"}
          </small>
        </div>
        <div className="card kpi">
          <div className="kpiTop"><span>Monitoramento</span><RefreshCw size={18}/></div>
          <strong>
            {artists.reduce(
              (total, artist) =>
                total + artist.platforms.filter((platform) => platform.monitor_enabled).length,
              0,
            )}
          </strong>
          <small className="up">fontes habilitadas</small>
        </div>
      </section>

      <section className="card artistDirectory">
        <div className="directoryHead">
          <div>
            <span className="sectionEyebrow">DIRETÓRIO</span>
            <h3>Identidades digitais monitoradas</h3>
          </div>
          <div className="artistSearch">
            <Search size={15}/>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar artista..."
            />
          </div>
        </div>

        {message && (
          <div className={databaseReady === false ? "systemNotice warning" : "systemNotice"}>
            <AlertCircle size={16}/>
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="emptyState">Carregando artistas...</div>
        ) : filteredArtists.length === 0 ? (
          <div className="emptyState">
            <UserRound size={28}/>
            <b>Nenhum artista cadastrado ainda.</b>
            <span>
              Use “Adicionar artista” para registrar o artista e seus canais oficiais.
            </span>
          </div>
        ) : (
          <div className="artistCards">
            {filteredArtists.map((artist) => (
              <article className="artistCard" key={artist.id}>
                <div className="artistCardTop">
                  <div className="artistIdentity">
                    {artist.image_url ? (
                      <img src={artist.image_url} alt="" />
                    ) : (
                      <div className="artistInitial">{artist.name.slice(0, 1).toUpperCase()}</div>
                    )}
                    <div>
                      <b>{artist.name}</b>
                      <span>{artist.genre || "Gênero não informado"} · {artist.country}</span>
                    </div>
                  </div>
                  <button
                    className="iconDanger"
                    title="Remover artista"
                    onClick={() => removeArtist(artist.id, artist.name)}
                  >
                    <Trash2 size={15}/>
                  </button>
                </div>

                <div className="artistMeta">
                  <span><Globe2 size={13}/> {artist.platforms.length} canais oficiais</span>
                  <span><Music2 size={13}/> Chartmetric {artist.chartmetric_id ? "vinculado" : "pendente"}</span>
                </div>

                <div className="platformBadges">
                  {artist.platforms.length ? artist.platforms.map((platform) => (
                    <a
                      key={platform.platform}
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                      className={platform.monitor_enabled ? "" : "disabled"}
                    >
                      {platform.platform.replace("_", " ")}
                    </a>
                  )) : <span className="noPlatform">Nenhuma rede vinculada</span>}
                </div>

                {(artist.aliases?.length > 0 || artist.keywords?.length > 0) && (
                  <div className="artistTerms">
                    {[...(artist.aliases || []), ...(artist.keywords || [])].slice(0, 5).map((term) => (
                      <span key={term}>{term}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {open && (
        <div className="modalBackdrop" onMouseDown={() => onOpenChange(false)}>
          <div className="artistModal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modalHead">
              <div>
                <span className="sectionEyebrow">NOVO ARTISTA</span>
                <h2>Cadastrar identidade do artista</h2>
                <p>
                  Informe os canais oficiais. O Momentum salva tudo no banco e usa
                  esses endereços como base para o monitoramento.
                </p>
              </div>
              <button className="modalClose" onClick={() => onOpenChange(false)}>
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="formSection">
                <div className="formSectionTitle">
                  <span>1</span>
                  <div><b>Dados do artista</b><small>Identidade principal</small></div>
                </div>
                <div className="formGrid">
                  <label className="field span2">
                    <span>Nome artístico *</span>
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ex.: Nome do artista"/>
                  </label>
                  <label className="field">
                    <span>País</span>
                    <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Brasil"/>
                  </label>
                  <label className="field">
                    <span>Gênero / segmento</span>
                    <input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Sertanejo, pop, funk..."/>
                  </label>
                  <label className="field span2">
                    <span>Foto / imagem oficial (URL)</span>
                    <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..."/>
                  </label>
                  <label className="field">
                    <span>Chartmetric Artist ID</span>
                    <input value={chartmetricId} onChange={(event) => setChartmetricId(event.target.value)} placeholder="Opcional"/>
                  </label>
                  <label className="field">
                    <span>Aliases</span>
                    <input value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="Nome, apelido, variações"/>
                  </label>
                  <label className="field span2">
                    <span>Palavras-chave adicionais</span>
                    <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="Separe por vírgulas"/>
                  </label>
                </div>
              </div>

              <div className="formSection">
                <div className="formSectionTitle">
                  <span>2</span>
                  <div><b>Redes e plataformas oficiais</b><small>Links usados para identificar e monitorar o artista</small></div>
                </div>
                <div className="platformFormList">
                  {platforms.map((platform, index) => (
                    <div className="platformField" key={platform.key}>
                      <div className="platformLabel">
                        <b>{platform.label}</b>
                        <label className="monitorToggle">
                          <input
                            type="checkbox"
                            checked={platform.monitorEnabled}
                            onChange={(event) => {
                              const next = [...platforms];
                              next[index] = { ...platform, monitorEnabled: event.target.checked };
                              setPlatforms(next);
                            }}
                          />
                          <span>{platform.monitorEnabled ? "Monitorar" : "Não monitorar"}</span>
                        </label>
                      </div>
                      <div className="urlInput">
                        <Link2 size={15}/>
                        <input
                          value={platform.url}
                          onChange={(event) => {
                            const next = [...platforms];
                            next[index] = { ...platform, url: event.target.value };
                            setPlatforms(next);
                          }}
                          placeholder={platform.placeholder}
                        />
                        {platform.url && platform.monitorEnabled && <Check size={15} className="validIcon"/>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modalActions">
                <div>
                  <Database size={15}/>
                  <span>O cadastro será persistido no PostgreSQL do Momentum.</span>
                </div>
                <div>
                  <button type="button" className="ghost" onClick={() => onOpenChange(false)}>Cancelar</button>
                  <button type="submit" className="primary" disabled={saving}>
                    {saving ? "Salvando..." : "Cadastrar artista"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
