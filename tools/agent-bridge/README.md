# Ponte local entre Manus e Claude Code

Esta ponte fornece uma API HTTP local com histórico persistente em JSONL e eventos em tempo real via Server-Sent Events. O serviço escuta apenas em `127.0.0.1` por padrão e exige um token Bearer definido por variável de ambiente.

## Iniciar no computador local

Na raiz do repositório, gere um token aleatório e exporte as variáveis:

```bash
export BRIDGE_TOKEN="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
export BRIDGE_PORT=8787
node tools/agent-bridge/server.js
```

Não coloque o token em arquivos versionados, tickets ou mensagens públicas. O histórico é salvo em `tools/agent-bridge/data/messages.jsonl`, que deve permanecer ignorado pelo Git.

## Usar com o Claude Code

Em outro terminal, mantendo `BRIDGE_TOKEN` definido:

```bash
node tools/agent-bridge/bridge-client.js send "Iniciei o trabalho no checkout e vou revisar os endpoints."
node tools/agent-bridge/bridge-client.js read
node tools/agent-bridge/bridge-client.js watch
```

O Claude Code pode executar esses comandos quando precisar publicar uma atualização ou acompanhar novas mensagens.

## Acesso pelo Manus

Para que o Manus consiga alcançar o serviço que está no seu computador, o endereço precisa ser temporariamente publicado por um túnel HTTPS autenticado, como Cloudflare Tunnel ou outro serviço equivalente. O túnel deve encaminhar para `http://127.0.0.1:8787`; nunca exponha a porta sem autenticação. Depois de iniciar o túnel, informe nesta conversa a URL HTTPS e mantenha o processo ativo.

O serviço não executa comandos recebidos pela API: ele apenas armazena e retransmite texto. Isso reduz o risco de execução remota acidental. Mesmo assim, trate o token como uma senha e encerre o túnel quando terminar.

## Endpoints

| Endpoint | Função |
|---|---|
| `GET /health` | Verifica se o serviço está ativo; não exige token. |
| `GET /messages?limit=50` | Retorna o histórico autenticado. |
| `POST /messages` | Publica `{ "sender": "claude-code\|manus\|user", "text": "..." }`. |
| `GET /events` | Abre um fluxo autenticado de eventos em tempo real. |
