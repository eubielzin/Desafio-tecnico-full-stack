# ReservaFácil — Gerenciamento de Salas de Reunião

Sistema web full-stack para cadastro de salas e gerenciamento de reservas de horários, com prevenção de conflitos de agenda e validação de capacidade.

---

## Visão geral

A aplicação permite que equipes cadastrem salas de reunião e realizem reservas de horários com segurança. Todas as regras de negócio — conflito de horário, capacidade máxima e validação de campos — são aplicadas no servidor via Route Handlers do Next.js, garantindo consistência independente do cliente.

### Funcionalidades

- **Dashboard** — totais de salas, reservas, reservas em andamento e próximas reservas (atualização automática a cada 1 minuto)
- **CRUD de Salas** — criar, editar, excluir e listar salas com nome, capacidade e configuração de disponibilidade (madrugada e fim de semana)
- **CRUD de Reservas** — criar, editar, excluir e listar reservas com indicação de capacidade máxima da sala no formulário
- **Filtros avançados** — filtrar por sala, por período (seletor de intervalo de datas) e por status; ordenação por data/horário (mais antigo ou mais recente primeiro)
- **Status em tempo real** — cada reserva é classificada automaticamente como *Em andamento*, *Próxima* ou *Encerrada*
- **Prevenção de conflitos** — bloqueio no servidor de reservas sobrepostas ou encostadas na mesma sala
- **Validação de capacidade** — impede reservas com mais participantes do que a sala comporta
- **Disponibilidade configurável por sala** — admin define se a sala aceita reservas na madrugada (00:00–06:59) e/ou nos fins de semana; o formulário de reserva adapta o calendário e os horários disponíveis de acordo
- **Comunicação de erros em dois níveis** — toast temporário + alerta inline vermelho dentro do formulário

---

## Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── salas/          # GET (lista) · POST (cria)
│   │   │   └── [id]/       # GET · PUT · DELETE
│   │   ├── reservas/       # GET (lista + filtro por sala) · POST (cria + regras)
│   │   │   └── [id]/       # GET · PUT (edita + regras) · DELETE
│   │   └── dashboard/      # GET (métricas agregadas)
│   ├── salas/              # Página de salas
│   ├── reservas/           # Página de reservas (filtros + listagem)
│   ├── layout.tsx          # Layout raiz com Navbar e Providers
│   └── page.tsx            # Dashboard
│
├── components/             # Componentes compartilhados de UI
│   ├── ui/                 # Shadcn/UI (button, dialog, form, table, calendar, checkbox…)
│   ├── navbar.tsx          # Sidebar desktop + bottom nav mobile
│   ├── page-header.tsx
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── loading-state.tsx
│   ├── confirm-dialog.tsx
│   └── providers.tsx       # QueryClientProvider + Toaster
│
├── features/
│   ├── rooms/components/
│   │   ├── room-form.tsx
│   │   ├── room-dialog.tsx
│   │   ├── room-actions.tsx     # Menu de ações (editar/excluir) da linha da tabela
│   │   └── rooms-table.tsx
│   ├── reservations/components/
│   │   ├── reservation-form.tsx         # Formulário com hint de capacidade e erro inline
│   │   ├── reservation-dialog.tsx       # Modal de criar/editar reserva
│   │   ├── reservation-actions.tsx      # Menu de ações (editar/excluir) da linha da tabela
│   │   ├── reservation-status-badge.tsx # Badge colorido de status
│   │   ├── reservations-filters.tsx     # Filtros: sala · período · status · ordenação
│   │   └── reservations-table.tsx
│   └── dashboard/components/
│       ├── stats-card.tsx
│       └── upcoming-reservations.tsx
│
├── hooks/
│   ├── use-rooms.ts        # useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom
│   └── use-reservations.ts # useReservations, useDashboard, useCreate/Update/DeleteReservation
│
├── services/
│   ├── rooms.ts            # Fetch functions para /api/salas
│   └── reservations.ts     # Fetch functions para /api/reservas e /api/dashboard
│
├── repositories/
│   ├── rooms.ts            # Queries Supabase para salas
│   └── reservations.ts     # Queries Supabase para reservas + detecção de conflito
│
├── schemas/
│   ├── room.ts             # Zod schema de sala
│   └── reservation.ts      # Zod schema de reserva (fim > início; regras de horário no servidor)
│
├── types/
│   └── index.ts            # Interfaces TypeScript: Room, Reservation, DashboardStats…
│
└── lib/
    ├── supabase.ts         # Clientes Supabase (browser e server)
    ├── query-client.ts     # Instância QueryClient + query keys tipadas
    └── utils.ts            # cn, formatDate, getReservationStatus, statusLabel…
```

### Fluxo de uma reserva

```
Formulário (React Hook Form + Zod)
  → useMutation (TanStack Query)
    → POST /api/reservas (Route Handler)
      → Valida schema Zod (campos obrigatórios, fim > início)
      → Verifica capacidade da sala (Regra 2)
      → Verifica disponibilidade da sala (madrugada / fim de semana) (Regra 4)
      → Detecta conflito de horário (Regra 1)
      → Persiste no Supabase / retorna erro 409
    → Invalida cache → UI atualizada
    → Toast + alerta inline se houver erro do servidor
```

---

## Regras de negócio

### Regra 1 — Conflito de horário

Duas reservas na mesma sala no mesmo dia não podem ter sobreposição de horários, incluindo reservas que se encostam.

A detecção usa interseção de intervalos com desigualdade **não-estrita**: `A.inicio <= B.fim AND A.fim >= B.inicio`.

Ao editar uma reserva, a própria reserva é excluída da verificação de conflito (parâmetro `excludeId`), permitindo salvar sem alterar horário.

### Regra 2 — Capacidade

`quantidade_participantes` não pode ser maior que `sala.capacidade`. Optou-se por **bloqueio rígido** (HTTP 409) — aviso sem bloqueio permitiria persistir dados incoerentes no banco. O formulário exibe a capacidade máxima da sala selecionada para que o usuário saiba o limite antes de errar.

### Regra 3 — Horário válido

`horario_fim > horario_inicio` é validado no schema Zod (cliente + servidor). Por padrão, reservas só podem começar a partir das **07:00** — mas salas com `disponivel_madrugada = true` aceitam reservas desde as 00:00. A validação de horário mínimo ocorre no servidor com base no campo da sala. Todos os campos são obrigatórios.

### Regra 4 — Disponibilidade por sala

Cada sala tem dois flags configuráveis pelo admin:

- **`disponivel_madrugada`**: se `false` (padrão), reservas com `horario_inicio < '07:00'` são rejeitadas com HTTP 409.
- **`disponivel_fim_de_semana`**: se `false` (padrão), reservas em sábado ou domingo são rejeitadas com HTTP 409.

O formulário de reserva exibe apenas os horários e datas permitidos pela sala selecionada.

---

## Decisões de produto

O enunciado deixa quatro questões em aberto intencionalmente. Decisões tomadas e justificativas:

**1. Reservas que encostam são conflito?**
Sim. Uma reserva que termina às 15h00 e outra que começa às 15h00 na mesma sala **são conflito**. A pessoa ainda pode estar na sala quando a próxima reserva começa. A detecção usa desigualdade não-estrita (`inicio <= fim` e `fim >= inicio`), bloqueando qualquer toque entre intervalos.

**2. Existe horário de funcionamento?**
Sim, com configuração por sala. Por padrão cada sala opera entre **07:00 e 23:59**. O admin pode habilitar `disponivel_madrugada` para liberar reservas a partir das 00:00, e `disponivel_fim_de_semana` para permitir reservas aos sábados e domingos. A validação é feita no servidor e o formulário adapta o seletor de horários e o calendário automaticamente. Reservas que cruzam a meia-noite (ex.: 23:00–00:00) não são suportadas pois o tipo `time` do PostgreSQL não representa "dia seguinte"; recomenda-se encerrar até 23:59.

**3. O que acontece ao editar uma reserva para um horário que conflita?**
A edição é **bloqueada** com HTTP 409, da mesma forma que a criação. O sistema exclui a própria reserva da verificação (`excludeId`) para não conflitar consigo mesma ao salvar sem mudança de horário, mas qualquer sobreposição com outra reserva é impedida.

**4. Como o frontend comunica um conflito?**
Em dois níveis simultâneos: (a) um **toast** (notificação temporária no canto) com a mensagem exata do servidor, e (b) um **alerta vermelho inline** dentro do próprio formulário que permanece visível enquanto o modal estiver aberto. A mensagem descreve o conflito com o horário específico (ex.: *"Conflito de horário: já existe uma reserva nesta sala das 14:00 às 15:00."*), deixando claro ao usuário qual horário ajustar.

---

## Banco de dados

### Modelagem

```
salas
  id                       uuid PK
  nome                     varchar(100) UNIQUE (case-insensitive)
  capacidade               integer >= 1
  disponivel_madrugada     boolean default false
  disponivel_fim_de_semana boolean default false
  created_at               timestamptz
  updated_at               timestamptz

reservas
  id                       uuid PK
  sala_id                  uuid FK → salas(id) ON DELETE CASCADE
  titulo                   varchar(150)
  participante_responsavel varchar(100)
  quantidade_participantes integer >= 1
  data                     date
  horario_inicio           time
  horario_fim              time  CHECK (horario_fim > horario_inicio)
  created_at               timestamptz
  updated_at               timestamptz
```

### Índices

| Índice | Finalidade |
|---|---|
| `salas_nome_unique` | Impede salas com mesmo nome (case-insensitive) |
| `reservas_sala_id_idx` | Busca de reservas por sala |
| `reservas_data_idx` | Busca por data (dashboard) |
| `reservas_sala_data_idx` | Detecção de conflito (sala + data) |

O SQL completo está em [`supabase/schema.sql`](supabase/schema.sql).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Runtime | React 19 |
| Banco de dados | PostgreSQL via Supabase |
| ORM/Query | Supabase JS Client v2 |
| Validação | Zod v4 |
| Formulários | React Hook Form + @hookform/resolvers |
| Estado servidor | TanStack Query v5 |
| UI Components | Shadcn/UI + @base-ui/react |
| Estilização | Tailwind CSS v4 |
| Calendário | react-day-picker v10 |
| Datas | date-fns v4 (locale pt-BR) |
| Notificações | Sonner |
| Ícones | Lucide React |

---

## Como rodar localmente

### Pré-requisitos

- Node.js >= 20
- Conta no [Supabase](https://supabase.com) (plano gratuito)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd <nome-da-pasta>
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase/schema.sql`

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

As chaves estão em **Project Settings → API** no painel do Supabase.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Como suportar reservas recorrentes no futuro

A arquitetura atual comporta a extensão para reservas recorrentes sem quebrar o modelo existente. A abordagem recomendada:

### Modelagem

Adicionar uma tabela `recorrencias` que define a regra de repetição, sem alterar a tabela `reservas`:

```sql
create table recorrencias (
  id                       uuid primary key default gen_random_uuid(),
  sala_id                  uuid not null references salas(id),
  titulo                   varchar(150) not null,
  participante_responsavel varchar(100) not null,
  quantidade_participantes integer not null,
  horario_inicio           time not null,
  horario_fim              time not null,
  frequencia               text not null,  -- 'diaria' | 'semanal' | 'mensal'
  dias_semana              integer[],      -- [1,3,5] = seg, qua, sex
  data_inicio              date not null,
  data_fim                 date,
  created_at               timestamptz default now()
);

-- Cada reserva pode referenciar sua regra de recorrência
alter table reservas add column recorrencia_id uuid references recorrencias(id);
```

### Estratégia de geração

**Geração antecipada (eager):** ao criar uma recorrência, gerar todas as instâncias dentro de um horizonte (ex.: 6 meses) como linhas individuais em `reservas`. Simples de implementar e preserva toda a lógica de conflito já existente sem nenhuma alteração.

**Geração sob demanda (lazy):** armazenar apenas a regra e gerar as instâncias ao consultar. Mais eficiente para regras longas, mas exige adaptar a detecção de conflito para comparar contra instâncias virtuais.

A geração antecipada é recomendada para começar — toda a validação de conflito (`findConflicts`) funciona sem alteração, pois as instâncias já existem como reservas normais.

### Edição de instâncias

Ao editar uma reserva recorrente, oferecer três opções: *somente esta*, *esta e as seguintes*, *todas*. Isso pode ser implementado com um campo `excecoes` (array de datas) na tabela `recorrencias` para marcar instâncias canceladas ou modificadas individualmente.
