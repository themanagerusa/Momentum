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

const nav = [
  ["Visão geral", LayoutDashboard],
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
  { d: "16 Set", score: 74, buzz: 42 },
  { d: "17 Set", score: 76, buzz: 48 },
  { d: "18 Set", score: 75, buzz: 45 },
  { d: "19 Set", score: 79, buzz: 61 },
  { d: "20 Set", score: 81, buzz: 70 },
  { d: "21 Set", score: 80, buzz: 66 },
  { d: "22 Set", score: 84, buzz: 78 },
];

const sentiment = [
  { name: "Positivo", value: 68 },
  { name: "Neutro", value: 22 },
  { name: "Negativo", value: 10 },
];

const platforms = [
  { name: "TikTok", mentions: 12840 },
  { name: "Instagram", mentions: 9460 },
  { name: "YouTube", mentions: 5320 },
  { name: "X", mentions: 4180 },
  { name: "Notícias", mentions: 1760 },
];

const competitors = [
  { artist: "Artista A", share: 31 },
  { artist: "Artista B", share: 24 },
  { artist: "Artista C", share: 18 },
  { artist: "Artista D", share: 15 },
  { artist: "Artista E", share: 12 },
];

const topics = [
  { topic: "Novo lançamento", sentiment: "+89%", volume: "12,8 mil", impact: "Muito alto" },
  { topic: "Show / performance", sentiment: "+81%", volume: "8,4 mil", impact: "Alto" },
  { topic: "Feat / colaboração", sentiment: "+74%", volume: "6,1 mil", impact: "Alto" },
  { topic: "Vida pessoal", sentiment: "+41%", volume: "3,7 mil", impact: "Médio" },
  { topic: "Crítica pontual", sentiment: "-36%", volume: "1,2 mil", impact: "Baixo" },
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

export default function Home() {
  const [active, setActive] = useState("Visão geral");
  const [range, setRange] = useState("7d");
  const selectedArtist = "Artista principal";

  const summary = useMemo(() => {
    return "Reputação em alta, com crescimento de buzz puxado por TikTok e Instagram. O principal vetor é lançamento musical, sem sinal relevante de crise neste momento.";
  }, []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark"><TrendingUp size={20} /></div>
          <div><b>Momentum</b><span>Artist Intelligence</span></div>
        </div>

        <div className="nav">
          {nav.map(([label, Icon]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        <div className="sideFooter">
          <span>AMBIENTE</span>
          <strong>V1 · MVP</strong>
          <small>Dados demonstrativos</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p>Momentum / {active}</p>
            <h1>{selectedArtist}</h1>
          </div>
          <div className="actions">
            <div className="search"><Search size={16}/><input placeholder="Buscar artista, assunto ou fonte..." /></div>
            <button className="ghost"><BellRing size={17}/></button>
            <button className="primary">+ Adicionar artista</button>
          </div>
        </header>

        <div className="subbar">
          <div className="artistPill"><span className="avatar">A</span><b>{selectedArtist}</b><span>Brasil</span></div>
          <div className="ranges">
            {["24h","7d","30d","90d"].map(r => <button key={r} className={range===r ? "selected":""} onClick={()=>setRange(r)}>{r}</button>)}
          </div>
        </div>

        <section className="hero">
          <div>
            <span className="eyebrow"><Sparkles size={15}/> Leitura executiva</span>
            <h2>O artista está em <em>momento positivo</em>.</h2>
            <p>{summary}</p>
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
          <div className="card chartCard">
            <div className="cardHead"><div><span>REPUTAÇÃO</span><h3>Evolução do Reputation Index</h3></div><b>84/100</b></div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={reputation}>
                <defs>
                  <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9cff57" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#9cff57" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#202632" vertical={false}/>
                <XAxis dataKey="d" stroke="#687080" axisLine={false} tickLine={false}/>
                <YAxis domain={[60,100]} stroke="#687080" axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
                <Area type="monotone" dataKey="score" stroke="#9cff57" strokeWidth={3} fill="url(#fillScore)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card chartCard">
            <div className="cardHead"><div><span>SENTIMENTO</span><h3>Distribuição das conversas</h3></div><b>+58 net</b></div>
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
          </div>
        </section>

        <section className="grid two">
          <div className="card chartCard">
            <div className="cardHead"><div><span>BUZZ</span><h3>Menções por plataforma</h3></div><Activity size={18}/></div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platforms} layout="vertical" margin={{left:15}}>
                <CartesianGrid stroke="#202632" horizontal={false}/>
                <XAxis type="number" hide/>
                <YAxis type="category" dataKey="name" width={80} stroke="#9aa3b2" axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
                <Bar dataKey="mentions" fill="#7dd3fc" radius={[0,8,8,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card chartCard">
            <div className="cardHead"><div><span>MERCADO</span><h3>Share of Voice</h3></div><Users size={18}/></div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={competitors}>
                <CartesianGrid stroke="#202632" vertical={false}/>
                <XAxis dataKey="artist" stroke="#687080" axisLine={false} tickLine={false}/>
                <YAxis stroke="#687080" axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#11151d",border:"1px solid #2a313d",borderRadius:12}}/>
                <Bar dataKey="share" fill="#a78bfa" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
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

        <section className="card roadmap">
          <div><span>PRÓXIMAS INTEGRAÇÕES</span><h3>Base preparada para dados reais</h3></div>
          <div className="chips">
            {["Chartmetric","Instagram","TikTok","YouTube","X","Google News","Portais","Spotify"].map(x=><span key={x}>{x}</span>)}
          </div>
        </section>
      </section>
    </main>
  );
}
