"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  CircleGauge,
  Flame,
  LayoutDashboard,
  MessageSquareText,
  Music2,
  Newspaper,
  Radar,
  Search,
  Settings,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import ArtistsModule from "@/components/ArtistsModule";
import LiveNewsModule from "@/components/LiveNewsModule";

const nav = [
  ["Visão geral", LayoutDashboard],
  ["Artistas", Users],
  ["Reputação", CircleGauge],
  ["Notícias", Newspaper],
  ["Redes sociais", MessageSquareText],
  ["Música", Music2],
  ["Comparativos", BarChart3],
  ["Viralização", Flame],
  ["Alertas", BellRing],
  ["Admin", Settings],
] as const;

const reputation = [
  { d: "16 Set", score: 74, positive: 61, negative: 13, buzz: 42 },
  { d: "17 Set", score: 76, positive: 63, negative: 12, buzz: 48 },
  { d: "18 Set", score: 75, positive: 62, negative: 14, buzz: 45 },
  { d: "19 Set", score: 79, positive: 65, negative: 11, buzz: 61 },
  { d: "20 Set", score: 81, positive: 66, negative: 10, buzz: 70 },
  { d: "21 Set", score: 80, positive: 67, negative: 11, buzz: 66 },
  { d: "22 Set", score: 84, positive: 68, negative: 10, buzz: 78 },
];

const sentiment = [
  { name: "Positivo", value: 68 },
  { name: "Neutro", value: 22 },
  { name: "Negativo", value: 10 },
];

const platforms = [
  { name: "TikTok", mentions: 12840, engagement: 12.8 },
  { name: "Instagram", mentions: 9460, engagement: 8.6 },
  { name: "YouTube", mentions: 5320, engagement: 6.3 },
  { name: "X", mentions: 4180, engagement: 5.1 },
  { name: "Notícias", mentions: 1760, engagement: 2.8 },
];

const competitors = [
  { artist: "Artista principal", share: 31, reputation: 84, momentum: 91 },
  { artist: "Artista B", share: 24, reputation: 77, momentum: 82 },
  { artist: "Artista C", share: 18, reputation: 80, momentum: 74 },
  { artist: "Artista D", share: 15, reputation: 69, momentum: 71 },
  { artist: "Artista E", share: 12, reputation: 73, momentum: 65 },
];

const topics = [
  { topic: "Novo lançamento", sentiment: "+89%", volume: "12,8 mil", impact: "Muito alto" },
  { topic: "Show / performance", sentiment: "+81%", volume: "8,4 mil", impact: "Alto" },
  { topic: "Feat / colaboração", sentiment: "+74%", volume: "6,1 mil", impact: "Alto" },
  { topic: "Vida pessoal", sentiment: "+41%", volume: "3,7 mil", impact: "Médio" },
  { topic: "Crítica pontual", sentiment: "-36%", volume: "1,2 mil", impact: "Baixo" },
];

const news = [
  { source: "Portal nacional", title: "Artista amplia presença digital após novo lançamento", tone: "Positivo", reach: "12,4M", time: "32 min" },
  { source: "Portal de entretenimento", title: "Novo projeto movimenta fãs nas redes sociais", tone: "Positivo", reach: "8,1M", time: "1h" },
  { source: "Noticiário regional", title: "Show reúne grande público e gera repercussão local", tone: "Neutro", reach: "1,7M", time: "2h" },
  { source: "Blog musical", title: "Faixa entra entre os assuntos mais comentados", tone: "Positivo", reach: "920K", time: "3h" },
  { source: "Coluna", title: "Comentário pontual gera debate entre fãs", tone: "Negativo", reach: "610K", time: "5h" },
];

const musicTrend = [
  { d: "16 Set", streams: 58, social: 42 },
  { d: "17 Set", streams: 61, social: 48 },
  { d: "18 Set", streams: 63, social: 45 },
  { d: "19 Set", streams: 67, social: 61 },
  { d: "20 Set", streams: 74, social: 70 },
  { d: "21 Set", streams: 79, social: 66 },
  { d: "22 Set", streams: 86, social: 78 },
];

const alerts = [
  { level: "Atenção", title: "Buzz 2,4× acima do baseline", text: "Crescimento puxado por TikTok e Instagram nas últimas 3 horas." },
  { level: "Normal", title: "Negatividade sob controle", text: "Menções negativas representam 10% da conversa monitorada." },
  { level: "Oportunidade", title: "Tema com aceleração", text: "Conteúdos relacionados ao lançamento cresceram 61% desde ontem." },
];

function Kpi({ label, value, delta, icon: Icon }: any) {
  return (
    <div className="card kpi">
      <div className="kpiTop"><span>{label}</span><Icon size={18} /></div>
      <strong>{value}</strong>
      <small className={delta?.startsWith("-") ? "down" : "up"}>{delta} vs. período anterior</small>
    </div>
  );
}

function ChartCard({ eyebrow, title, children, right }: any) {
  return (
    <div className="card chartCard">
      <div className="cardHead"><div><span>{eyebrow}</span><h3>{title}</h3></div>{right}</div>
      {children}
    </div>
  );
}

function SentimentChart() {
  return (
    <div className="pieWrap">
      <ResponsiveContainer width="55%" height={260}>
        <PieChart>
          <Pie data={sentiment} dataKey="value" nameKey="name" innerRadius={72} outerRadius={100} paddingAngle={5}>
            <Cell fill="#9cff57"/><Cell fill="#8d96a5"/><Cell fill="#ff5f66"/>
          </Pie>
          <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="legend">
        {sentiment.map((s,i)=><div key={s.name}><span className={"dot d"+i}></span><span>{s.name}</span><b>{s.value}%</b></div>)}
      </div>
    </div>
  );
}

function Overview() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow"><Sparkles size={15}/> Leitura executiva</span>
          <h2>O artista está em <em>momento positivo</em>.</h2>
          <p>Reputação em alta, com crescimento de buzz puxado por TikTok e Instagram. O principal vetor é lançamento musical, sem sinal relevante de crise neste momento.</p>
        </div>
        <div className="heroScores">
          <div><span>Reputation Index</span><strong>84</strong><small>+4,0</small></div>
          <div><span>Momentum Score</span><strong>91</strong><small>+7,8</small></div>
        </div>
      </section>

      <section className="grid kpis">
        <Kpi label="Menções 24h" value="33,5 mil" delta="+38%" icon={MessageSquareText}/>
        <Kpi label="Share of Voice" value="31%" delta="+4,2 p.p." icon={Share2}/>
        <Kpi label="Sentimento positivo" value="68%" delta="+6,1 p.p." icon={TrendingUp}/>
        <Kpi label="Alerta de crise" value="Normal" delta="+0 ocorrências" icon={AlertTriangle}/>
      </section>

      <section className="grid two">
        <ChartCard eyebrow="REPUTAÇÃO" title="Evolução do Reputation Index" right={<b>84/100</b>}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={reputation}>
              <defs><linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9cff57" stopOpacity={0.35}/><stop offset="95%" stopColor="#9cff57" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="#202632" vertical={false}/>
              <XAxis dataKey="d" stroke="#687080" axisLine={false} tickLine={false}/>
              <YAxis domain={[60,100]} stroke="#687080" axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
              <Area type="monotone" dataKey="score" stroke="#9cff57" strokeWidth={3} fill="url(#fillScore)"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard eyebrow="SENTIMENTO" title="Distribuição das conversas" right={<b>+58 net</b>}><SentimentChart/></ChartCard>
      </section>

      <section className="grid two">
        <ChartCard eyebrow="BUZZ" title="Menções por plataforma" right={<Activity size={18}/>}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platforms} layout="vertical" margin={{left:15}}>
              <CartesianGrid stroke="#202632" horizontal={false}/><XAxis type="number" hide/>
              <YAxis type="category" dataKey="name" width={80} stroke="#9aa3b2" axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
              <Bar dataKey="mentions" fill="#7dd3fc" radius={[0,8,8,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard eyebrow="MERCADO" title="Share of Voice" right={<Users size={18}/>}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={competitors}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="artist" stroke="#687080" axisLine={false} tickLine={false}/><YAxis stroke="#687080" axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/><Bar dataKey="share" fill="#a78bfa" radius={[8,8,0,0]}/></BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid lower">
        <div className="card tableCard">
          <div className="cardHead"><div><span>DRIVERS</span><h3>O que está movimentando a reputação</h3></div><Radar size={18}/></div>
          <div className="table">
            <div className="tr th"><span>Assunto</span><span>Sentimento</span><span>Volume</span><span>Impacto</span></div>
            {topics.map(t=><div className="tr" key={t.topic}><b>{t.topic}</b><span className={t.sentiment.startsWith("-")?"neg":"pos"}>{t.sentiment}</span><span>{t.volume}</span><span>{t.impact}</span></div>)}
          </div>
        </div>
        <div className="card alerts">
          <div className="cardHead"><div><span>RADAR</span><h3>Alertas e oportunidades</h3></div><BellRing size={18}/></div>
          {alerts.map((a,i)=><div className="alert" key={i}><div className={"signal s"+i}></div><div><span>{a.level}</span><b>{a.title}</b><p>{a.text}</p></div></div>)}
        </div>
      </section>
    </>
  );
}

function ReputationModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Reputation Index" value="84/100" delta="+4,0" icon={CircleGauge}/>
        <Kpi label="Positivo" value="68%" delta="+6,1 p.p." icon={TrendingUp}/>
        <Kpi label="Negativo" value="10%" delta="-2,4 p.p." icon={AlertTriangle}/>
        <Kpi label="Net sentiment" value="+58" delta="+8,5" icon={Activity}/>
      </section>
      <section className="grid two">
        <ChartCard eyebrow="HISTÓRICO" title="Sentimento ao longo do tempo" right={<CircleGauge size={18}/>}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reputation}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="d" stroke="#687080" axisLine={false}/><YAxis stroke="#687080" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Line type="monotone" dataKey="positive" stroke="#9cff57" strokeWidth={3}/><Line type="monotone" dataKey="negative" stroke="#ff5f66" strokeWidth={2}/></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard eyebrow="COMPOSIÇÃO" title="Positivo, neutro e negativo" right={<b>33,5 mil menções</b>}><SentimentChart/></ChartCard>
      </section>
      <section className="card tableCard moduleCard">
        <div className="cardHead"><div><span>DRIVERS</span><h3>Assuntos que mais impactam a percepção</h3></div><Radar size={18}/></div>
        <div className="table"><div className="tr th"><span>Assunto</span><span>Sentimento</span><span>Volume</span><span>Impacto</span></div>{topics.map(t=><div className="tr" key={t.topic}><b>{t.topic}</b><span className={t.sentiment.startsWith("-")?"neg":"pos"}>{t.sentiment}</span><span>{t.volume}</span><span>{t.impact}</span></div>)}</div>
      </section>
    </>
  );
}

function NewsModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Notícias 24h" value="184" delta="+27%" icon={Newspaper}/>
        <Kpi label="Alcance potencial" value="48,2M" delta="+18%" icon={Users}/>
        <Kpi label="Positivas" value="71%" delta="+5,2 p.p." icon={TrendingUp}/>
        <Kpi label="Fontes ativas" value="96" delta="+12" icon={Radar}/>
      </section>
      <section className="card tableCard moduleCard">
        <div className="cardHead"><div><span>MONITORAMENTO</span><h3>Notícias mais relevantes agora</h3></div><Newspaper size={18}/></div>
        <div className="newsList">{news.map((n,i)=><article className="newsItem" key={i}><div><span>{n.source} · {n.time}</span><b>{n.title}</b></div><div className="newsMeta"><span className={n.tone==="Negativo"?"neg":n.tone==="Positivo"?"pos":""}>{n.tone}</span><small>alcance {n.reach}</small></div></article>)}</div>
      </section>
    </>
  );
}

function SocialModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Menções sociais" value="31,7 mil" delta="+41%" icon={MessageSquareText}/>
        <Kpi label="Engajamento médio" value="9,8%" delta="+2,1 p.p." icon={Activity}/>
        <Kpi label="UGC detectado" value="4,9 mil" delta="+32%" icon={Users}/>
        <Kpi label="Earned share" value="73%" delta="+8 p.p." icon={Share2}/>
      </section>
      <section className="grid two">
        <ChartCard eyebrow="PLATAFORMAS" title="Volume de menções" right={<MessageSquareText size={18}/>}>
          <ResponsiveContainer width="100%" height={300}><BarChart data={platforms} layout="vertical" margin={{left:15}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={80} stroke="#9aa3b2" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Bar dataKey="mentions" fill="#7dd3fc" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard eyebrow="ENGAJAMENTO" title="Taxa por plataforma" right={<Activity size={18}/>}>
          <ResponsiveContainer width="100%" height={300}><BarChart data={platforms}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="name" stroke="#687080" axisLine={false}/><YAxis stroke="#687080" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Bar dataKey="engagement" fill="#9cff57" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
      </section>
    </>
  );
}

function MusicModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Music Momentum" value="86/100" delta="+9,4" icon={Music2}/>
        <Kpi label="Streaming index" value="86" delta="+14%" icon={TrendingUp}/>
        <Kpi label="Social index" value="78" delta="+18%" icon={MessageSquareText}/>
        <Kpi label="Playlist impact" value="Alto" delta="+7%" icon={Share2}/>
      </section>
      <section className="card chartCard moduleCard">
        <div className="cardHead"><div><span>CORRELAÇÃO</span><h3>Streaming × buzz social</h3></div><Music2 size={18}/></div>
        <ResponsiveContainer width="100%" height={330}><LineChart data={musicTrend}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="d" stroke="#687080" axisLine={false}/><YAxis stroke="#687080" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Line type="monotone" dataKey="streams" stroke="#9cff57" strokeWidth={3}/><Line type="monotone" dataKey="social" stroke="#7dd3fc" strokeWidth={3}/></LineChart></ResponsiveContainer>
      </section>
      <section className="card roadmap"><div><span>INTEGRAÇÃO PLANEJADA</span><h3>Chartmetric + DSPs + social listening</h3></div><div className="chips">{["Spotify","YouTube","TikTok","Instagram","Apple Music","Deezer","Chartmetric"].map(x=><span key={x}>{x}</span>)}</div></section>
    </>
  );
}

function ComparisonModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Posição em Share of Voice" value="#1" delta="+1 posição" icon={Users}/>
        <Kpi label="Share of Voice" value="31%" delta="+4,2 p.p." icon={Share2}/>
        <Kpi label="Melhor reputação" value="84" delta="+4,0" icon={CircleGauge}/>
        <Kpi label="Maior momentum" value="91" delta="+7,8" icon={TrendingUp}/>
      </section>
      <section className="grid two">
        <ChartCard eyebrow="BENCHMARK" title="Share of Voice por artista" right={<Users size={18}/>}>
          <ResponsiveContainer width="100%" height={300}><BarChart data={competitors} layout="vertical" margin={{left:15}}><XAxis type="number" hide/><YAxis type="category" dataKey="artist" width={100} stroke="#9aa3b2" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Bar dataKey="share" fill="#a78bfa" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard eyebrow="BENCHMARK" title="Reputação × Momentum" right={<BarChart3 size={18}/>}>
          <ResponsiveContainer width="100%" height={300}><BarChart data={competitors}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="artist" stroke="#687080" axisLine={false}/><YAxis stroke="#687080" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Bar dataKey="reputation" fill="#9cff57" radius={[6,6,0,0]}/><Bar dataKey="momentum" fill="#7dd3fc" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
      </section>
    </>
  );
}

function ViralModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Buzz Velocity" value="2,4×" delta="+61%" icon={Flame}/>
        <Kpi label="Pico atual" value="7,4K/h" delta="+82%" icon={Activity}/>
        <Kpi label="Perfis propagando" value="3,2 mil" delta="+44%" icon={Users}/>
        <Kpi label="Plataformas ativas" value="5" delta="+2" icon={Share2}/>
      </section>
      <section className="grid two">
        <ChartCard eyebrow="VELOCIDADE" title="Buzz versus baseline" right={<Flame size={18}/>}>
          <ResponsiveContainer width="100%" height={300}><AreaChart data={reputation}><CartesianGrid stroke="#202632" vertical={false}/><XAxis dataKey="d" stroke="#687080" axisLine={false}/><YAxis stroke="#687080" axisLine={false}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d"}}/><Area type="monotone" dataKey="buzz" stroke="#ffb86b" fill="#ffb86b22" strokeWidth={3}/></AreaChart></ResponsiveContainer>
        </ChartCard>
        <div className="card alerts">
          <div className="cardHead"><div><span>PROPAGAÇÃO</span><h3>Leitura automática</h3></div><Radar size={18}/></div>
          <div className="flow"><b>TikTok</b><span>→</span><b>Instagram</b><span>→</span><b>X</b><span>→</span><b>Portais</b><span>→</span><b>YouTube</b></div>
          <p className="muted">Demonstração de como o Momentum poderá identificar a origem de um assunto e acompanhar sua migração entre plataformas.</p>
        </div>
      </section>
    </>
  );
}

function AlertsModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Status geral" value="Normal" delta="+0 crises" icon={BellRing}/>
        <Kpi label="Alertas ativos" value="3" delta="+1" icon={AlertTriangle}/>
        <Kpi label="Oportunidades" value="6" delta="+2" icon={TrendingUp}/>
        <Kpi label="Anomalias 24h" value="2" delta="+1" icon={Activity}/>
      </section>
      <section className="card alerts moduleCard">
        <div className="cardHead"><div><span>CENTRAL</span><h3>Alertas, anomalias e oportunidades</h3></div><BellRing size={18}/></div>
        {alerts.concat([{level:"Anomalia",title:"Crescimento fora do padrão detectado",text:"O volume atual ultrapassou o comportamento histórico esperado para esta faixa horária."}]).map((a,i)=><div className="alert" key={i}><div className={"signal s"+(i%3)}></div><div><span>{a.level}</span><b>{a.title}</b><p>{a.text}</p></div></div>)}
      </section>
    </>
  );
}

function AdminModule() {
  return (
    <>
      <section className="grid kpis">
        <Kpi label="Artistas cadastrados" value="1" delta="+0" icon={Users}/>
        <Kpi label="Fontes monitoradas" value="0" delta="+0" icon={Radar}/>
        <Kpi label="Integrações ativas" value="0" delta="+0" icon={Settings}/>
        <Kpi label="Coletas reais" value="0" delta="+0" icon={Activity}/>
      </section>
      <section className="card tableCard moduleCard">
        <div className="cardHead"><div><span>CONFIGURAÇÃO</span><h3>Integrações do Momentum</h3></div><Settings size={18}/></div>
        <div className="integrationGrid">{["Chartmetric","Instagram","TikTok","YouTube","X","Google News / RSS","Spotify","Apple Music"].map(x=><div className="integration" key={x}><div><b>{x}</b><span>Aguardando configuração</span></div><button>Configurar</button></div>)}</div>
        <p className="muted">Os botões desta V1 são de interface. Credenciais e pipelines de coleta ainda não foram conectados.</p>
      </section>
    </>
  );
}

function Module({
  active,
  addArtistOpen,
  setAddArtistOpen,
}: {
  active: string;
  addArtistOpen: boolean;
  setAddArtistOpen: (value: boolean) => void;
}) {
  if (active === "Artistas") return <ArtistsModule open={addArtistOpen} onOpenChange={setAddArtistOpen}/>;
  if (active === "Reputação") return <ReputationModule/>;
  if (active === "Notícias") return <LiveNewsModule/>;
  if (active === "Redes sociais") return <SocialModule/>;
  if (active === "Música") return <MusicModule/>;
  if (active === "Comparativos") return <ComparisonModule/>;
  if (active === "Viralização") return <ViralModule/>;
  if (active === "Alertas") return <AlertsModule/>;
  if (active === "Admin") return <AdminModule/>;
  return <Overview/>;
}

export default function Home() {
  const [active, setActive] = useState("Visão geral");
  const [range, setRange] = useState("7d");
  const [addArtistOpen, setAddArtistOpen] = useState(false);
  const selectedArtist = "Artista principal";
  const pageTitle = active === "Artistas" ? "Base de artistas" : selectedArtist;
  useMemo(() => selectedArtist, []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark"><TrendingUp size={20} /></div><div><b>Momentum</b><span>Artist Intelligence</span></div></div>
        <div className="nav">{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}><Icon size={18} /> {label}</button>)}</div>
        <div className="sideFooter"><span>AMBIENTE</span><strong>V1 · MVP</strong><small>Dados demonstrativos</small></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><p>Momentum / {active}</p><h1>{pageTitle}</h1></div>
          <div className="actions"><div className="search"><Search size={16}/><input placeholder="Buscar artista, assunto ou fonte..." /></div><button className="ghost"><BellRing size={17}/></button><button className="primary" onClick={() => { setActive("Artistas"); setAddArtistOpen(true); }}>+ Adicionar artista</button></div>
        </header>
        <div className="subbar"><div className="artistPill"><span className="avatar">A</span><b>{selectedArtist}</b><span>Brasil</span></div><div className="ranges">{["24h","7d","30d","90d"].map(r => <button key={r} className={range===r ? "selected":""} onClick={()=>setRange(r)}>{r}</button>)}</div></div>
        <Module active={active} addArtistOpen={addArtistOpen} setAddArtistOpen={setAddArtistOpen}/>
        <section className="card roadmap"><div><span>STATUS DO MVP</span><h3>Interface funcional · dados ainda demonstrativos</h3></div><div className="chips">{["Chartmetric","Instagram","TikTok","YouTube","X","Notícias","Spotify"].map(x=><span key={x}>{x}</span>)}</div></section>
      </section>
    </main>
  );
}
