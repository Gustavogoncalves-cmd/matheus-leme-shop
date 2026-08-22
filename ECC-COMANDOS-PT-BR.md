# Comandos ECC - Referência em Português Brasileiro

> Tradução completa dos comandos `/ecc` do repositório https://github.com/affaan-m/ECC

## 🎯 Fluxo Core

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/plan` | `/planejar` | Requisitos + riscos + plano passo-a-passo (aguarda confirmação) |
| `/code-review` | `/revisar-codigo` | Revisar mudanças locais ou PR do GitHub |
| `/build-fix` | `/corrigir-build` | Detectar e corrigir erros de build automaticamente |
| `/santa-loop` | `/loop-adversarial` | Revisão adversarial dupla (ambos devem aprovar) |

## 🧪 Testes

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/go-test` | `/go-teste` | Workflow TDD específico para Go |
| `/kotlin-test` | `/kotlin-teste` | Workflow TDD específico para Kotlin |
| `/rust-test` | `/rust-teste` | Workflow TDD específico para Rust |
| `/cpp-test` | `/cpp-teste` | Workflow TDD específico para C++ |
| `/flutter-test` | `/flutter-teste` | Workflow TDD específico para Flutter |
| `/react-test` | `/react-teste` | Workflow TDD específico para React |
| `/test-coverage` | `/cobertura-testes` | Cobertura de testes genérica |

## 🔨 Corretores de Build

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/go-build` | `/go-build` | Corretor de build para Go |
| `/kotlin-build` | `/kotlin-build` | Corretor de build para Kotlin |
| `/rust-build` | `/rust-build` | Corretor de build para Rust |
| `/cpp-build` | `/cpp-build` | Corretor de build para C++ |
| `/gradle-build` | `/gradle-build` | Corretor de build para Gradle |
| `/flutter-build` | `/flutter-build` | Corretor de build para Flutter |
| `/react-build` | `/react-build` | Corretor de build para React |

## 🚀 Funcionalidades Orquestradas

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/orch-add-feature` | `/adicionar-funcionalidade` | End-to-end nova funcionalidade (pesquisa→plano→teste→revisão→commit) |
| `/orch-fix-defect` | `/corrigir-defeito` | Reproduzir como teste falhando, corrigir, revisar |
| `/orch-refine-code` | `/refinar-codigo` | Refatoração preservando comportamento |

## 📋 Planejamento & Arquitetura

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/plan` | `/planejar` | Planejamento colaborativo |
| `/multi-plan` | `/planejar-multiplo` | Planejamento com múltiplos agentes |
| `/multi-workflow` | `/fluxo-multiplo` | Workflow com múltiplos agentes |
| `/prp-prd` | `/prp-documento-produto` | Documento de Requisitos do Produto |
| `/prp-plan` | `/prp-planejar` | Planejamento PRP |
| `/prp-implement` | `/prp-implementar` | Implementação PRP |

## 💾 Gerenciamento de Sessão

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/save-session` | `/salvar-sessao` | Armazenar estado em `~/.claude/session-data/` |
| `/resume-session` | `/retomar-sessao` | Carregar sessão anterior |
| `/checkpoint` | `/ponto-verificacao` | Criar pontos de verificação de workflow |
| `/sessions` | `/sessoes` | Histórico de sessões |

## 🏗️ Infraestrutura

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/project-init` | `/inicializar-projeto` | Inicializar novo projeto |
| `/harness-audit` | `/auditoria-harness` | Auditar harness do projeto |
| `/cost-report` | `/relatorio-custos` | Relatório de custos |
| `/security-scan` | `/varredura-seguranca` | Auditoria de vulnerabilidades |
| `/jira` | `/jira` | Integração com Jira |
| `/pr` | `/pr` | Gerenciar pull requests |
| `/auto-update` | `/atualizar-auto` | Atualizar ECC para a versão mais recente |

## 🧠 Memória (CLI, não slash)

```bash
ecc memory init           # Inicializar memória
ecc memory save           # Salvar estado
ecc memory handoff        # Transferir contexto
ecc memory search         # Pesquisar memória
ecc memory read           # Ler memória
ecc memory doctor         # Diagnóstico de memória
```

## ⚡ Decisão Rápida

| Situação | Comando |
|----------|---------|
| **Nova funcionalidade?** | `→ /planejar` |
| **Build quebrado?** | `→ /corrigir-build` |
| **Sessão terminando?** | `→ /salvar-sessao` |
| **Retomando trabalho?** | `→ /retomar-sessao` |

## 📚 Revisores Específicos de Linguagem

Os seguintes comandos também estão disponíveis como reviewers:

- `/go-review` → `/revisar-go`
- `/python-review` → `/revisar-python`
- `/rust-review` → `/revisar-rust`
- `/typescript-review` → `/revisar-typescript`
- `/kotlin-review` → `/revisar-kotlin`
- `/java-review` → `/revisar-java`
- `/cpp-review` → `/revisar-cpp`
- `/react-review` → `/revisar-react`
- `/vue-review` → `/revisar-vue`
- `/flutter-review` → `/revisar-flutter`

## 🎓 Aprendizado & Padrões

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/instinct-import` | `/importar-instinto` | Importar padrões aprendidos |
| `/instinct-export` | `/exportar-instinto` | Exportar padrões para reutilizar |
| `/evolve` | `/evoluir` | Agregar instintos em skills reutilizáveis |

## 🔍 Pesquisa & Conhecimento

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/search-first` | `/pesquisar-primeiro` | Pesquisar antes de codificar |
| `/learn` | `/aprender` | Aprender novo padrão |
| `/learn-eval` | `/avaliar-aprendizado` | Avaliar aprendizado |

## 🛠️ Qualidade & Limpeza

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/refactor-clean` | `/limpar-refatorar` | Remover código morto |
| `/quality-gate` | `/porta-qualidade` | Ponto de verificação de qualidade |
| `/simplify` | `/simplificar` | Simplificar código |

## 📊 Relatórios & Análise

| Comando | Tradução | Descrição |
|---------|----------|-----------|
| `/cost-report` | `/relatorio-custos` | Relatório de custos do projeto |
| `/security-scan` | `/varredura-seguranca` | Scan de segurança |
| `/test-coverage` | `/cobertura-testes` | Cobertura de testes |

---

**Dica:** Para uma lista completa atualizada, execute `/plugin list ecc@ecc` dentro de uma sessão do Claude Code.
