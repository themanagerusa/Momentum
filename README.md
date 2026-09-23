# Momentum

Momentum é uma plataforma de **Artist Intelligence**, reputação, social listening, notícias e performance artística.

## V1 / MVP

A versão inicial entrega uma interface executiva navegável com:

- Reputation Index
- Momentum Score
- sentimento positivo / neutro / negativo
- volume de menções
- share of voice
- buzz por plataforma
- drivers de reputação
- radar de alertas e oportunidades
- estrutura visual para módulos de notícias, redes sociais, música, comparativos, viralização e admin

> Os dados desta V1 são demonstrativos. Nenhuma métrica exibida deve ser interpretada como dado real de artista.

## Stack

- Next.js 15
- React 19
- TypeScript
- Recharts
- Lucide React

## Rodar localmente

```bash
npm install
npm run dev
```

## Próximas integrações

A arquitetura está preparada para evoluir para ingestão real via:

- Chartmetric
- Instagram
- TikTok
- YouTube
- X
- notícias / RSS / portais
- Spotify e demais DSPs

## Roadmap técnico

1. Persistência e cadastro de artistas
2. Banco histórico de menções e métricas
3. pipeline de classificação de sentimento
4. deduplicação e clusterização de notícias
5. Reputation Index proprietário
6. Momentum Score proprietário
7. detecção de anomalias
8. alertas de crise
9. autenticação e perfis de acesso
10. integrações reais e atualização automática


## Cadastro de artistas

O Momentum agora possui uma base própria para cadastro de artistas. Cada artista pode ter:

- nome artístico
- país
- gênero / segmento
- imagem oficial
- Chartmetric Artist ID
- aliases e palavras-chave
- Instagram
- TikTok
- YouTube
- Spotify
- Apple Music
- Deezer
- X / Twitter
- Facebook
- Threads
- Kwai
- SoundCloud
- Amazon Music
- site oficial

Cada plataforma pode ser marcada individualmente como **Monitorar**. Quando o artista é salvo, os links oficiais são persistidos no PostgreSQL e também registrados em `momentum_monitoring_sources` para alimentar os coletores futuros.

### Banco de dados

Defina a variável `DATABASE_URL` no projeto Vercel. A aplicação cria automaticamente as tabelas necessárias na primeira chamada da API.

Endpoints atuais:

- `GET /api/health`
- `GET /api/artists`
- `POST /api/artists`
- `DELETE /api/artists/:id`
- `GET /api/monitoring/sources`


## Status do banco

- Neon PostgreSQL: conectado
- Projeto Neon: Momentum
- Região: São Paulo
- Schema inicial: aplicado
- Persistência de artistas e fontes de monitoramento: pronta
