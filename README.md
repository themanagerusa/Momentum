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
