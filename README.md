# 🛡️ Job Hunter SOC & Blue Team

> Sistema automatizado de monitoramento, 
triagem inteligente de vagas com IA e painel operacional em tempo real voltado para operações defensivas de cibersegurança (SOC / Blue Team).

![Status](https://img.shields.io/badge/Status-Operacional-00e5ff?style=for-the-badge)
![n8n](https://img.shields.io/badge/Orquestração-n8n-ea580c?style=for-the-badge&logo=n8n)
![Gemini AI](https://img.shields.io/badge/IA-Google%20Gemini-4285F4?style=for-the-badge&logo=google)
![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 📌 Visão Geral da Arquitetura

O **Job Hunter SOC** foi concebido para eliminar o trabalho manual de busca e análise de vagas em portais de emprego. 
O sistema ingere oportunidades recentes no mercado brasileiro, normaliza os dados, submete cada descrição técnica ao modelo **Google Gemini** 
para confrontar com a matriz de competências do candidato, persiste o histórico analítico e dispara alertas prioritários.

[ Schedule Trigger (n8n) ]

               │
               ▼

   [ RapidAPI / JSearch (BR) ]
   
               │
               ▼

 [ Normalização & Triagem Inicial ]
 
               │
               ▼

  [ Google Gemini AI (Match Scoring) ]
  
   ┌───────────┴───────────┐
   
   [ Supabase Database ]     [ Condição Match >= 75% ]

            │                           │                             
  [ Dashboard Vercel ]      [ Alerta HTML no Gmail ]

  ## 🚀 Funcionalidades Principais

* **Ingestão Automatizada:** Coleta de vagas de cibersegurança e SOC no Brasil via API conectada aos principais agregadores (LinkedIn, Gupy, Indeed, Catho).
* **Análise Heurística com IA (Gemini):**
  * Cálculo de score percentual de aderência (0 a 100%).
  * Nível de aderência categorizado (`ALTO`, `MEDIO`, `BAIXO`).
  * Geração de parecer técnico detalhado.
  * Extração automatizada de **Pontos Fortes** e **Gaps Técnicos** para preparação pré-entrevista.
* **Alertas Críticos:** Disparo de e-mails formatados via SMTP (Gmail) imediatamente após a detecção de oportunidades com aderência $\ge 75\%$.
* **Dashboard SOC / Operations:** Interface escura desenvolvida em React + Vite, com métricas de volume, distribuição por criticidade, velocímetro de aderência e botões de ação rápida para candidatura imediata.
* **Segurança e Hardening:** Tabela protegida com **Row Level Security (RLS)** restrito no PostgreSQL, garantindo que o frontend atue estritamente em modo de leitura (*read-only*).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **Orquestração** | n8n | Pipelines de ETL, triggers agendados e fluxos condicionais |
| **Inteligência Artificial** | Google Gemini | Processamento de linguagem natural e scoring do perfil |
| **Fonte de Dados** | JSearch API (RapidAPI) | Extração estruturada de vagas com filtragem geográfica (`BR`) |
| **Banco de Dados** | Supabase (PostgreSQL) | Armazenamento relacional, histórico e políticas de segurança RLS |
| **Alertas** | SMTP Gmail | Notificação imediata das melhores oportunidades em HTML |
| **Frontend** | React 18 + Vite | Painel interativo estilo centro de monitoramento |
| **Hospedagem** | Vercel | Deploy contínuo (CI/CD) conectado ao repositório GitHub |

---

## 🔒 Modelo de Segurança e Governança

Para garantir que a solução permaneça protegida mesmo operando com credenciais públicas no navegador:

1. **Princípio do Menor Privilégio no Banco:**
   * A chave pública exposta no frontend (`anon`) possui exclusivamente permissão de `SELECT` na tabela de vagas via Row Level Security (RLS).
   * Operações de inserção, alteração e exclusão por usuários anônimos são explicitamente bloqueadas por políticas no PostgreSQL.
2. **Isolamento de Segredos de Backend:**
   * Chaves com privilégio administrativo (`service_role`), credenciais SMTP e tokens de API permanecem confinados no ambiente seguro do n8n, sem exposição no código-fonte.
3. **Prevenção de Fuga de Credenciais:**
   * Arquivo `.gitignore` devidamente configurado para impedir o versionamento de arquivos de ambiente local (`.env`).

---

## 📊 Estrutura de Dados (Supabase)

```sql
create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  empresa text not null,
  localizacao text,
  modelo_trabalho text,
  senioridade text,
  descricao text,
  url_original text,
  fonte text,
  score_match integer,
  nivel_aderencia text,
  justificativa text,
  pontos_fortes text[],
  gaps text[],
  hash_dedup text unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
💻 Como Rodar o Dashboard Localmente
Pré-requisitos
Node.js 18+ instalado

Conta configurada no Supabase

Instalação
Bash
# 1. Clone o repositório
git clone [https://github.com/seu-usuario/Job-Hunter.git](https://github.com/seu-usuario/Job-Hunter.git)

# 2. Acesse a pasta do projeto
cd Job-Hunter

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env.local na raiz com:
# VITE_SUPABASE_URL=sua-url-do-supabase
# VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica

# 5. Inicie o servidor de desenvolvimento
npm run dev

Roadmap de Evoluções Futuras
[x] Triagem automatizada com Gemini e integração n8n

[x] Notificação prioritária por e-mail com análise de gaps

[x] Dashboard operacional estilo SOC com gráficos de KPIs

[ ] Módulo de geração de cartas de apresentação personalizadas com base nos gaps da vaga

[ ] Integração com Telegram Bot para comandos interativos (/vagas_hoje, /status)


---

Assim que você salvar o arquivo no GitHub, o seu repositório estará com uma documentação de nível de engenharia, explicando arquitetura, segurança e valor de ponta a ponta.
