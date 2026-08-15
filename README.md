# DUVIDO!

Jogo local para duas pessoas disputarem perguntas numéricas geradas dinamicamente por IA. Não há banco de perguntas hardcoded: a Groq cria pergunta, resposta, categoria, dificuldade e explicação a cada rodada.

## Requisitos

- Node.js 20 ou mais recente
- npm
- Groq API Key

## Instalação

```bash
npm install
cp .env.example .env
```

Edite `.env`:

```env
GROQ_API_KEY=sua-chave-aqui
```

## Desenvolvimento

Inicie frontend e backend juntos:

```bash
npm run dev
```

Abra `http://localhost:5173`. A API usa `http://localhost:3001` e o Vite encaminha `/api` automaticamente.

Para rodar separadamente:

```bash
npm run dev -w server
npm run dev -w client
```

## Build e produção

```bash
npm run typecheck
npm run build
npm start
```

O build do cliente fica em `client/dist`. Nesta versão, `npm start` inicia somente a API local; em desenvolvimento, o proxy do Vite já encaminha as chamadas corretamente.

## Deploy gratuito na Vercel

1. Envie o repositório para GitHub, GitLab ou Bitbucket.
2. No painel da Vercel, escolha **Add New → Project** e importe o repositório.
3. Mantenha o diretório raiz do projeto e as configurações detectadas de `vercel.json`.
4. Em **Environment Variables**, crie `GROQ_API_KEY` para Production, Preview e Development.
5. Clique em **Deploy**.

O `vercel.json` compila o Vite em `client/dist`, publica os arquivos estáticos e encaminha `/api/*` para a função Express em `api/index.ts`. Não coloque a chave no código nem use variáveis com prefixo `VITE_`.

## API

- `GET /api/health` — status da API.
- `POST /api/questions` — recebe categoria/temas e cria uma rodada. Retorna apenas `roundId`, pergunta, categoria e dificuldade.
- `POST /api/questions/:roundId/reveal` — recebe o último palpite, compara no servidor e só então retorna resposta, explicação e resultado do desafio.

Cada resposta é guardada em um token opaco autenticado com AES-256-GCM e validade de duas horas. Isso permite revelar a rodada em qualquer instância serverless sem enviar a resposta em texto legível ou depender da memória de um processo. As últimas perguntas ficam apenas no estado local da partida e são enviadas a cada nova geração para evitar repetições.

## Segurança e IA

A chave é lida somente no backend por `process.env.GROQ_API_KEY`; `.env` está ignorado pelo Git. O modelo fica centralizado em `server/src/services/groqService.ts`. O retorno JSON passa por validação e há até três tentativas controladas. Nenhuma resposta correta é enviada em texto legível ao navegador antes de `DUVIDO!`.

## Limitações da V1

- Sem contas, banco de dados, histórico permanente ou multiplayer remoto.
- Um token de rodada pode tecnicamente ser revelado novamente até expirar; a interface impede isso no fluxo normal.
- O conteúdo gerado pode conter imprecisões factuais inerentes a modelos de IA.
