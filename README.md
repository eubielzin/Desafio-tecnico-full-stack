# ReservaFácil — Gerenciamento de Salas de Reunião

Sistema web full-stack para cadastro de salas e gerenciamento de reservas de horários, com prevenção de conflitos de agenda e validação de capacidade.

---

## Visão geral

A aplicação permite que equipes cadastrem salas de reunião e realizem reservas de horários com segurança. Todas as regras de negócio — conflito de horário, capacidade máxima e validação de campos — são aplicadas no servidor via Route Handlers do Next.js, garantindo consistência independente do cliente.

### Funcionalidades

- **Dashboard** — totais de salas, reservas, reservas em andamento e próximas reservas (atualização automática a cada 1 minuto)
- **CRUD de Salas** — criar, editar, excluir e listar salas com nome e capacidade
- **CRUD de Reservas** — criar, editar, excluir e listar com filtro por sala e ordenação por data/horário
- **Status em tempo real** — cada reserva é classificada automaticamente como *Em andamento*, *Próxima* ou *Encerrada*
- **Prevenção de conflitos** — bloqueio no servidor de reservas sobrepostas na mesma sala
- **Validação de capacidade** — impede reservas com mais participantes do que a sala comporta

---

## Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── salas/          # GET (lista) · POST (cria)
│   │   │   └── [id]/       # GET · PUT · DELETE
│   │   ├── reservas/       # GET (lista + filtro) · POST (cria + regras)
│   │   │   └── [id]/       # GET · PUT (edita + regras) · DELETE
│   │   └── dashboard/      # GET (métricas agregadas)
│   ├── salas/              # Página de salas
│   ├── reservas/           # Página de reservas
│   ├── layout.tsx          # Layout raiz com Navbar e Providers
│   └── page.tsx            # Dashboard
│
├── components/             # Componentes compartilhados de UI
│   ├── ui/                 # Shadcn/UI (button, dialog, form, table…)
│   ├── navbar.tsx          # Sidebar desktop + bottom nav mobile
│   ├── page-header.tsx
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── loading-state.tsx
│   ├── confirm-dialog.tsx
│   └── providers.tsx       # QueryClientProvider + Toaster
│
├── features/
│   ├── rooms/components/        # RoomForm, RoomDialog, RoomActions, RoomsTable
│   ├── reservations/components/ # ReservationForm, ReservationDialog, ReservationsTable…
│   └── dashboard/components/    # StatsCard, UpcomingReservations
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
│   └── reservation.ts      # Zod schema de reserva (com refinement horário_fim > início)
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
      → Valida schema Zod
      → Verifica capacidade da sala (Regra 2)
      → Detecta conflito de horário (Regra 1)
      → Persiste no Supabase / retorna erro 409
    → Invalida cache → UI atualizada
```

---

## Regras de negócio

### Regra 1 — Conflito de horário

Duas reservas na mesma sala no mesmo dia não podem ter sobreposição de horários.

A detecção usa interseção de intervalos abertos: `A.inicio < B.fim AND A.fim > B.inicio`.

**Decisão de produto:** reservas consecutivas (14:00–15:00 e 15:00–16:00) **não** são conflito — a desigualdade é estrita.

Ao editar uma reserva, a própria reserva é excluída da verificação de conflito (parâmetro `excludeId`), permitindo salvar sem alterar horário.

### Regra 2 — Capacidade

`quantidade_participantes` não pode ser maior que `sala.capacidade`. Retorna HTTP 409 com mensagem explicativa.

### Regra 3 — Horário válido

`horario_fim > horario_inicio` é validado no schema Zod (client + server). Todos os campos são obrigatórios.

---

## Banco de dados

### Modelagem

```
salas
  id            uuid PK
  nome          varchar(100) UNIQUE (case-insensitive)
  capacidade    integer >= 1
  created_at    timestamptz
  updated_at    timestamptz

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
| `salas_nome_unique` | Impede salas com mesmo nome |
| `reservas_sala_id_idx` | Busca de reservas por sala |
| `reservas_data_idx` | Busca por data (dashboard) |
| `reservas_sala_data_idx` | Detecção de conflito (sala + data) |

O SQL completo está em [`supabase/schema.sql`](supabase/schema.sql).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Supabase |
| ORM/Query | Supabase JS Client |
| Validação | Zod |
| Formulários | React Hook Form + @hookform/resolvers |
| Estado servidor | TanStack Query v5 |
| UI | Shadcn/UI + Tailwind CSS |
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
