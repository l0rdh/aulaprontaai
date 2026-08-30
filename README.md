# Plano Certo IA

Você é um Engenheiro Full-Stack Sênior e Product Designer construindo a V1 completa de um Micro-SaaS chamado AulaPronta IA.

## O produto

AulaPronta IA é uma plataforma para professores da Educação Básica brasileira (Educação Infantil ao Ensino Médio) criarem planos de aula e avaliações completos, alinhados à BNCC, em menos de 2 minutos usando IA. O público é professor(a) de escola pública ou particular, sem tempo sobrando, muitas vezes acessando pelo celular entre uma aula e outra.

## Stack técnica (siga exatamente)

- React + Vite + TypeScript

- Tailwind CSS + shadcn/ui (Button, Card, Dialog, Sheet, Select, Badge, Tabs, Progress, Skeleton, Toast/Sonner, Avatar, DropdownMenu, Accordion, Separator, Checkbox)

- lucide-react para todos os ícones

- react-router-dom para as rotas

- react-hook-form + zod para validação de formulários

- Supabase JS Client para autenticação e banco de dados

## IMPORTANTE — o banco de dados já existe

As tabelas profiles, lesson_plans, generated_exams e credit_transactions JÁ FORAM CRIADAS no Supabase (schema SQL rodado manualmente), com RLS e triggers configurados — incluindo a concessão automática de 3 créditos grátis no cadastro. NÃO crie novas tabelas, NÃO gere migrations, NÃO altere o schema existente. Use a integração nativa do Lovable com Supabase apenas para autenticação e para ler/escrever nessas tabelas.

Estrutura resumida (para referência ao montar as queries):

- profiles: id, full_name, email, school_name, subjects_taught[], credits, plan ('free'|'pro'), created_at

- lesson_plans: id, user_id, title, grade_level, subject, theme, bncc_codes[], content_json, duration_minutes, is_favorite, created_at

- generated_exams: id, user_id, lesson_plan_id, title, question_count, difficulty, content_json, created_at

## Design System

Não use o visual genérico de "SaaS de IA" (fundo roxo com gradiente, cards flutuantes com glow, excesso de rounded-3xl). O produto deve parecer feito especificamente para professores: confiável, organizado, com leve aconchego de "caderno de planejamento bem-feito" — não uma dashboard fria de startup.

Paleta (use exatamente estes tons):

- Primária/Tinta: #2C3B8C — azul-índigo profundo, tipo tinta de caneta. Textos de destaque, ícones ativos, bordas de foco.

- Ação/CTA: #4338CA — reservado para botões primários e links de ação.

- Fundo base: #FAF9F6 — off-white levemente quente (não branco puro, não cinza frio).

- Superfície (cards): #FFFFFF com shadow-sm sutil.

- Texto principal: #1E1B2E — quase-preto com leve tom azulado.

- Sucesso: #059669. Alerta (créditos acabando): #D97706. Borda/divisor: #E4E1D8.

Tipografia:

- Títulos e headlines da Landing Page: "Fraunces" (serifada, com personalidade, transmite confiança pedagógica sem parecer institucional).

- Interface do app inteira (dashboard, formulários, botões, corpo de texto): "Inter" — prioriza legibilidade e velocidade, já que o professor usa isso correndo entre aulas.

- Importe as duas via Google Fonts.

Elemento de assinatura visual: o cronograma da aula gerada (Acolhida → Fechamento) deve ser desenhado como uma trilha vertical de horário (linha contínua com marcadores por etapa, cada um com ícone e faixa de tempo) — como uma agenda de horário escolar, não um accordion genérico. Esse componente é o elemento mais distintivo do produto e deve manter o mesmo estilo em qualquer lugar que exiba o cronograma.

Regras gerais de UI:

- Cantos arredondados moderados (rounded-lg, não rounded-3xl em tudo).

- Sombras discretas, nunca glow/neon.

- lucide-react em todo lugar, nunca emoji substituindo ícone funcional.

- Todo texto da interface em português do Brasil.

- Foco de teclado sempre visível.

- Motion apenas em transições sutis (fade/slide de 150-200ms) em modais e troca de passos do wizard — nada de animação decorativa espalhada.

- Todo texto de botão descreve a ação em primeira pessoa do professor ("Gerar Plano de Aula", "Salvar Plano"), e o toast de sucesso reaproveita a mesma palavra do botão que disparou a ação.

## Páginas e fluxos

### 1. Landing Page (rota "/", pública)

Nesta ordem:

- Header fixo: logo "AulaPronta IA", links (Como funciona, Preços, Entrar), CTA "Criar plano grátis".

- Hero: headline sobre a dor real (ex.: "Pare de perder seu domingo à noite planejando aula"), subheadline com a solução em 1 frase, CTA duplo ("Começar grátis" + "Ver como funciona"), e um mockup visual de um plano de aula gerado (card com badges BNCC) ao lado.

- Seção de dor: 3 cards curtos — tempo perdido pesquisando código BNCC manualmente; formatação e estrutura pedagógica do zero toda semana; ferramentas de IA genéricas (tipo ChatGPT puro) não conhecem a BNCC de verdade e erram os códigos.

- Como funciona: 3 passos numerados (01/02/03) — Escolha etapa, ano e componente → Descreva o tema da aula → Receba o plano completo e alinhado à BNCC em menos de 2 minutos.

- Features: grid com ícones — Alinhamento automático à BNCC, Estrutura pedagógica completa (acolhida à avaliação), Geração de avaliações a partir do plano, Exportação em PDF pronta pra imprimir.

- Prova social: 2-3 depoimentos fictícios de professores (nome, disciplina, escola — claramente placeholders para o usuário trocar depois) + um contador tipo "X planos gerados" com valor placeholder.

- Preços: comparação Free (3 créditos grátis, sem cartão) vs Pro (créditos ilimitados ou pacote maior, valor placeholder tipo R$29,90/mês).

- FAQ: accordion com 4-5 perguntas (Preciso saber usar IA? Os códigos BNCC são confiáveis? Funciona pra Educação Infantil? Posso cancelar quando quiser?).

- CTA final + Footer.

### 2. Autenticação (/login, /cadastro)

- Email + senha via Supabase Auth. Cadastro também pede full_name (vai em raw_user_meta_data, que o trigger do banco usa para popular profiles.full_name).

- Validação com zod (email válido, senha mínima 6 caracteres).

- Link "esqueci minha senha" (resetPasswordForEmail).

- Redireciona para /dashboard após login.

- Layout centralizado, simples, mesmo logo da landing.

### 3. Dashboard (/dashboard, protegida)

- Sidebar (vira bottom nav no mobile): Dashboard, Criar Plano, Meus Planos, Configurações, nome/avatar do professor no rodapé.

- Card de destaque no topo: saldo de créditos (grande e visível) + badge do plano (Free/Pro) + botão "Criar novo plano".

- Se credits <= 1: badge de alerta âmbar sugerindo upgrade.

- 3-4 cards de estatísticas rápidas: total de planos criados, total de avaliações geradas, disciplina mais usada, último plano criado.

- Lista dos 3-5 planos mais recentes (cards clicáveis → tela de visualização).

- Estado vazio (sem planos ainda): ilustração simples + convite para criar o primeiro plano.

### 4. Wizard de Criação (/criar-plano, protegida)

Formulário em etapas numeradas (1/2/3/4 — aqui a numeração é justificada, é um processo sequencial real):

Etapa 1 — Etapa de ensino: Select com Educação Infantil, Ensino Fundamental — Anos Iniciais (1º ao 5º), Ensino Fundamental — Anos Finais (6º ao 9º), Ensino Médio.

Etapa 2 — Ano/série (dinâmico conforme etapa 1):

- Educação Infantil → Bebês (0 a 1a6m) / Crianças bem pequenas (1a7m a 3a11m) / Crianças pequenas (4a a 5a11m)

- Fund. Anos Iniciais → 1º, 2º, 3º, 4º, 5º ano

- Fund. Anos Finais → 6º, 7º, 8º, 9º ano

- Médio → 1ª, 2ª, 3ª série

Etapa 3 — Componente/Área/Campo (dinâmico conforme etapa 1):

- Educação Infantil → Campos de Experiência: O eu, o outro e o nós / Corpo, gestos e movimentos / Traços, sons, cores e formas / Escuta, fala, pensamento e imaginação / Espaços, tempos, quantidades, relações e transformações

- Fundamental (ambos) → Língua Portuguesa, Matemática, Ciências, Geografia, História, Arte, Educação Física, Língua Inglesa, Ensino Religioso

- Médio → Linguagens e suas Tecnologias, Matemática e suas Tecnologias, Ciências da Natureza e suas Tecnologias, Ciências Humanas e Sociais Aplicadas

Etapa 4 — Detalhes da aula: campo de texto livre "Tema da aula" (obrigatório, ex.: "Frações equivalentes"), select de duração (30/50/100 minutos), campo opcional "Observações" (ex.: aluno com deficiência auditiva na turma, turma agitada, recurso disponível tipo projetor).

Tela final: resumo de tudo + botão grande "Gerar Plano de Aula". Ao clicar, loading state com mensagem "Criando seu plano de aula..." e spinner.

IMPORTANTE para esta V1: ainda NÃO conecte a IA de verdade. Ao clicar em "Gerar Plano de Aula", simule a chamada (delay de ~2s) e insira na tabela lesson_plans um registro com um content_json MOCKADO, porém realista, seguindo exatamente esta estrutura:

{

  "title": "string",

  "generalObjective": "string",

  "specificObjectives": ["string"],

  "bnccCodes": [{ "code": "EF06MA01", "description": "string" }],

  "materials": ["string"],

  "schedule": [

    { "stage": "Acolhida", "durationMinutes": 5, "description": "string", "teacherAction": "string" },

    { "stage": "Introdução", "durationMinutes": 10, "description": "string", "teacherAction": "string" },

    { "stage": "Desenvolvimento", "durationMinutes": 20, "description": "string", "teacherAction": "string" },

    { "stage": "Atividade Prática", "durationMinutes": 10, "description": "string", "teacherAction": "string" },

    { "stage": "Fechamento", "durationMinutes": 5, "description": "string", "teacherAction": "string" }

  ],

  "assessment": { "type": "string", "description": "string", "criteria": ["string"] },

  "homework": "string ou null",

  "inclusionNotes": "string ou null",

  "notes": "string ou null"

}

Depois redirecione para a tela de visualização (/plano/:id) usando o registro real recém-criado no banco. Isso garante que "Meus Planos" e a Visualização já funcionem de ponta a ponta com dados reais do Supabase — a troca do mock pela IA de verdade é o próximo passo, já com prompt pronto.

### 5. Visualização do Plano (/plano/:id, protegida)

Renderiza o content_json do registro:

- Header: título, badges de etapa/ano + disciplina + duração.

- Badges dos códigos BNCC (cor primária), cada um clicável/expansível mostrando a descrição completa da habilidade.

- Objetivo geral + objetivos específicos (lista).

- Checklist de materiais (Checkbox, estado local, não precisa persistir).

- Cronograma da aula: o componente de trilha vertical de horário descrito no Design System.

- Avaliação: tipo + descrição + critérios.

- Tarefa de casa, se houver.

- Botões no topo: "Copiar" (copia o plano formatado como texto para a área de transferência), "Exportar PDF" (deixe o botão pronto na interface, a lógica real vem no próximo prompt), "Salvar/Favoritar" (toggle is_favorite), "Voltar".

### 6. Meus Planos (/meus-planos, protegida)

- Busca por título/tema (ilike no Supabase).

- Filtros por disciplina e por etapa/ano, combináveis.

- Toggle "Mostrar só favoritos".

- Grid de cards (título, disciplina, ano, data, badge de favorito) → clique leva para /plano/:id.

- Paginação simples.

- Estado vazio com CTA para criar o primeiro plano.

### 7. Modal/Paywall de Upgrade

- Dialog disparado automaticamente quando o usuário tenta gerar um plano com credits = 0, e também acessível por um botão "Fazer upgrade" na sidebar.

- Comparação lado a lado Free vs Pro (features + preço).

- CTA "Assinar Pro" — por enquanto pode só mostrar um toast "Em breve" (a integração de pagamento não faz parte desta V1).

## Regras finais

- Rotas protegidas redirecionam para /login se não houver sessão ativa.

- Skeleton em toda tela que busca dados do Supabase.

- Toast de sucesso/erro em toda ação que grava no banco.

- Totalmente responsivo mobile-first.

- NÃO implemente ainda: exportação de PDF de verdade, a Edge Function de IA, e o bloqueio real de créditos zerados — isso vem nos próximos prompts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aulaprontaai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b8b4574f-f097-4ede-8947-678720eadc00).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
