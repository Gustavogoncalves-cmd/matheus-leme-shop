# Matheus Leme - Streampacks E-commerce

Loja profissional de streampacks premium (overlays, assets, design) com catálogo dinâmico, carrinho de compras, painel admin e integração de pagamento.

## Stack

- **Frontend:** Vue 3 + Vite + Pinia + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Pagamento:** Stripe
- **Auth:** JWT (JSON Web Tokens)

## Estrutura do Projeto

```
matheus-leme-shop/
├── frontend/          # Vue 3 + Vite SPA
├── backend/           # Node.js + Express API
└── shared/            # Schemas/Types compartilhados
```

## Setup Local

### Frontend

```bash
cd frontend
npm install
npm run dev
# Abre em http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais de banco de dados
npm run dev
# Roda em http://localhost:3000
```

### Database

Criar banco PostgreSQL:
```bash
createdb matheus_leme_shop
```

## MVP Features

- [x] Catálogo de produtos com filtros
- [x] Sistema de carrinho de compras
- [ ] Checkout com integração Stripe
- [ ] Painel admin (CRUD de produtos)
- [ ] Autenticação de usuários
- [ ] Histórico de pedidos

## Próximas Fases

1. **Fase 2:** Refatoração do HTML em componentes Vue
2. **Fase 3:** Implementação de rotas e modelos do backend
3. **Fase 4:** Integração frontend ↔ backend
4. **Fase 5:** Painel admin funcional
5. **Deploy:** Docker + CI/CD

## Variáveis de Ambiente

Copie os arquivos `.env.example` para `.env` em ambas as pastas:

- `frontend/.env` - URLs da API e Stripe public key
- `backend/.env` - Credenciais do banco, JWT secret, Stripe keys

## Documentação

- [Plan de Arquitetura](../.claude/plans/staged-foraging-church.md)
- Frontend: Componentes em `src/components/`
- Backend: Rotas em `src/routes/`, Models em `src/models/`

## Contato

Desenvolvido para Matheus Leme | Design e Motion
