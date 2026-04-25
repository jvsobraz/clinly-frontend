# Clinly — Frontend

Interface web da plataforma SaaS de agendamento para clínicas, construída com **Angular 21** e **Angular Material**. Inclui backoffice completo para administradores (agendamentos, pacientes, financeiro, relatórios), **Inteligência 360° do Paciente** (LTV, churn prediction), **Smart Gap Engine** (confirmação de slot por magic-link), pesquisa NPS pós-consulta, portal do paciente e agendamento público por slug da clínica.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando localmente](#executando-localmente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Rotas](#rotas)
- [Autenticação](#autenticação)
- [Features implementadas](#features-implementadas)

---

## Arquitetura

O projeto usa **Angular 21** com standalone components, lazy loading e Angular Signals para estado reativo:

```
src/app/
├── core/
│   ├── guards/           # authGuard (protege rotas privadas), guestGuard (redireciona logados)
│   ├── interceptors/     # authInterceptor — injeta JWT e trata 401 com auto-refresh
│   ├── models/           # Interfaces TypeScript dos recursos da API
│   └── services/         # Serviços HTTP e TenantContextService
├── features/             # Módulos de funcionalidade (lazy loaded)
│   ├── auth/             # Login, Register, Forgot/Reset Password
│   ├── appointments/     # Lista e ações de agendamentos
│   ├── professionals/    # CRUD de profissionais
│   ├── patients/         # CRUD de pacientes + Patient 360° Intelligence
│   ├── clinic-services/  # Serviços e procedimentos da clínica
│   ├── rooms/            # Salas físicas
│   ├── dashboard/        # Métricas, agenda do dia e widget de churn
│   ├── financial/        # Relatório financeiro e registro de pagamentos
│   ├── nps/              # Pesquisa de satisfação NPS (público)
│   ├── offer/            # Confirmação de slot via magic-link (público)
│   ├── patient-portal/   # Portal do Paciente (próximas consultas + histórico)
│   ├── settings/         # Configurações da clínica
│   ├── subscription/     # Planos e checkout Stripe
│   ├── waitlist/         # Lista de espera
│   ├── packages/         # Pacotes de tratamento
│   └── booking/          # Agendamento público via slug
└── layout/
    ├── admin-layout/     # Layout com sidebar colapsável + header
    ├── patient-layout/   # Header dedicado para o Portal do Paciente
    └── auth-layout/      # Layout centralizado para páginas de autenticação
```

**Tecnologias principais:**

| Tecnologia | Uso |
|---|---|
| Angular 21 | Framework frontend |
| Angular Material | Componentes UI (formulários, tabelas, menus, ícones) |
| Tailwind CSS v4 | Utilitários de estilo e layout |
| Angular Signals | Estado reativo sem NgRx |
| Angular Router | Lazy loading + guards |
| RxJS | HTTP e operadores reativos |

---

## Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [Angular CLI](https://angular.dev/cli) 21+: `npm install -g @angular/cli`
- Backend Clinly rodando localmente em `http://localhost:5000`

---

## Configuração

Edite `src/environments/environment.ts` para apontar para o backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

Para produção, edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api', // proxy reverso na mesma origem
};
```

---

## Executando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar o servidor de desenvolvimento
ng serve

# A aplicação estará disponível em http://localhost:4200
```

Para build de produção:

```bash
ng build
# Output em dist/frontend/
```

---

## Estrutura de pastas

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # authGuard + guestGuard
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Injeta Bearer token, auto-refresh em 401
│   │   ├── models/
│   │   │   ├── appointment.model.ts   # Tipos + STATUS_LABELS + STATUS_COLORS
│   │   │   ├── auth.model.ts
│   │   │   ├── dashboard.model.ts
│   │   │   ├── financial.model.ts     # FinancialReport, PaymentItem
│   │   │   ├── intelligence.model.ts  # PatientIntelligence, WaitlistOffer
│   │   │   ├── notification.model.ts
│   │   │   ├── patient.model.ts
│   │   │   ├── professional.model.ts
│   │   │   └── tenant.model.ts
│   │   └── services/
│   │       ├── auth.service.ts            # Login, register, refresh, logout (signal-based)
│   │       ├── appointment.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── financial.service.ts       # Relatório financeiro e pagamentos
│   │       ├── intelligence.service.ts    # Inteligência 360° e Smart Gap Engine
│   │       ├── notification.service.ts
│   │       ├── nps.service.ts             # Pesquisa NPS (getContext, submit)
│   │       ├── patient.service.ts
│   │       ├── patient-portal.service.ts  # Upcoming + histórico para pacientes
│   │       ├── professional.service.ts
│   │       ├── room.service.ts            # CRUD de salas
│   │       ├── specialty.service.ts       # Listagem de especialidades
│   │       └── tenant-context.service.ts  # tenantId e tenantName reativos
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── appointments/
│   │   ├── booking/
│   │   ├── clinic-services/
│   │   ├── dashboard/
│   │   ├── financial/
│   │   ├── nps/
│   │   ├── offer/
│   │   ├── patient-portal/
│   │   │   ├── portal-home.component.ts         # Próximas consultas
│   │   │   └── portal-appointments.component.ts # Histórico completo + NPS
│   │   ├── patients/
│   │   │   └── patient-detail/  # Patient 360° Intelligence
│   │   ├── professionals/
│   │   ├── rooms/
│   │   ├── settings/
│   │   ├── subscription/
│   │   ├── waitlist/
│   │   └── packages/
│   ├── layout/
│   │   ├── admin-layout/
│   │   ├── patient-layout/
│   │   └── auth-layout/
│   ├── app.config.ts   # Providers: Router, HttpClient, Animations
│   ├── app.routes.ts   # Roteamento lazy loaded
│   └── app.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.scss         # Angular Material theme (mat.$azure-palette)
└── tailwind.css        # Tailwind v4 entry point
```

---

## Rotas

| Rota | Componente | Guard | Descrição |
|---|---|---|---|
| `/` | — | — | Redireciona para `/dashboard` |
| `/auth/login` | `LoginComponent` | `guestGuard` | Tela de login |
| `/auth/register` | `RegisterComponent` | `guestGuard` | Cadastro + criação da clínica |
| `/auth/forgot-password` | `ForgotPasswordComponent` | `guestGuard` | Solicitar reset de senha |
| `/auth/reset-password` | `ResetPasswordComponent` | `guestGuard` | Redefinir senha via token |
| `/dashboard` | `DashboardComponent` | `authGuard` | Métricas, agenda do dia e widget de pacientes em risco de churn |
| `/dashboard/appointments` | `AppointmentsComponent` | `authGuard` | Lista de agendamentos com filtro por data |
| `/dashboard/professionals` | `ProfessionalsComponent` | `authGuard` | Cards de profissionais com especialidades |
| `/dashboard/patients` | `PatientsComponent` | `authGuard` | Tabela de pacientes com busca em tempo real e ícone de insights |
| `/dashboard/patients/:id/intelligence` | `PatientDetailComponent` | `authGuard` | Inteligência 360°: LTV, retenção, perfil comportamental e insights |
| `/dashboard/services` | `ClinicServicesComponent` | `authGuard` | Serviços e procedimentos |
| `/dashboard/rooms` | `RoomsComponent` | `authGuard` | Salas físicas |
| `/dashboard/waitlist` | `WaitlistComponent` | `authGuard` | Lista de espera com fila ordenada e notificação por e-mail |
| `/dashboard/packages` | `PackagesComponent` | `authGuard` | Pacotes de tratamento (CRUD + atribuição a pacientes) |
| `/dashboard/financial` | `FinancialComponent` | `authGuard` | Relatório financeiro com filtro por período e registro de pagamentos |
| `/dashboard/settings` | `SettingsComponent` | `authGuard` | Configurações da clínica |
| `/dashboard/subscription` | `SubscriptionComponent` | `authGuard` | Planos Free/Basic/Pro + checkout Stripe |
| `/patient` | `PortalHomeComponent` | `authGuard` | Portal do Paciente — próximas consultas |
| `/patient/appointments` | `PortalAppointmentsComponent` | `authGuard` | Portal do Paciente — histórico completo com NPS |
| `/booking/:slug` | `BookingComponent` | — | Agendamento público (sem login) |
| `/offer/:token` | `OfferComponent` | — | Confirmação de slot via Smart Gap Engine (magic-link) |
| `/nps/:token` | `NpsComponent` | — | Pesquisa de satisfação NPS pós-consulta (magic-link) |

---

## Autenticação

O fluxo de autenticação usa **JWT + Refresh Token** com armazenamento no `localStorage`:

| Chave | Conteúdo |
|---|---|
| `clinly_token` | Access token JWT |
| `clinly_refresh` | Refresh token |
| `clinly_user` | Dados do usuário (`id`, `name`, `email`, `role`) |
| `clinly_tenant_id` | ID do tenant ativo |

**`AuthService`** expõe signals reativos:
- `user()` — usuário logado
- `token()` — token atual
- `isLoggedIn()` — computed booleano
- `isAdmin()` — computed true para SuperAdmin/ClinicAdmin

**`authInterceptor`** injeta automaticamente o `Bearer` token em todas as requisições e, ao receber um `401`, tenta renovar o token via `refreshToken()` antes de fazer logout. Quando múltiplas requisições retornam `401` simultaneamente, apenas uma dispara o refresh — as demais aguardam via `BehaviorSubject` para evitar race conditions que invalidariam o token rotacionado.

---

## Features implementadas

### Dashboard
- Total de agendamentos do dia (total, confirmados, concluídos, cancelados)
- Métricas do mês (total, cancelamentos, taxa de não comparecimento)
- Agenda do dia com status colorido

### Agendamentos
- Lista com filtro por data
- **Dialog de criação** com seleção de paciente, profissional, serviço (opcional), sala (opcional), data/hora e duração — duração pré-preenchida automaticamente ao selecionar o profissional
- Ações rápidas via menu: Confirmar, Concluir, Cancelar
- Badge de status com cores semânticas (Pendente, Confirmado, Cancelado, Concluído, Não compareceu)
- **Badge de risco de no-show** (Baixo/Médio/Alto) calculado por score baseado em histórico, antecedência, dia da semana e horário

### Profissionais
- Cards com avatar, CRM, especialidades e duração padrão de consulta
- Badge de status ativo/inativo
- **Dialog de criação/edição** com seleção múltipla de especialidades, bio, CRM, duração padrão e flag de aceita novos pacientes

### Pacientes
- Tabela com busca em tempo real (debounce de 400ms)
- Campos: nome, e-mail, telefone, plano de saúde
- **Dialog de criação/edição** com campos: nome, e-mail, telefone, CPF, data de nascimento, gênero, plano de saúde e observações
- Ícone de insights em cada linha com link para a página de Inteligência 360°

### Patient 360° Intelligence
- Painel de retenção com badge colorido: **Ativo** / **Em Risco** / **Churned**
- Cards de métricas: LTV (Lifetime Value), taxa de comparecimento, dias desde a última visita, tendência de risco
- Perfil comportamental: dia e horário preferidos, antecedência média de agendamento, contagem de faltas
- Histórico clínico: data da última e próxima consulta, barra de progresso de pacotes ativos
- Insights automáticos por nível (info / warning / danger)
- Widget "Pacientes em Risco de Churn" no Dashboard com link para cada inteligência

### Serviços da Clínica
- Cards com duração e preço formatado em BRL
- **Dialog de criação/edição** com nome, descrição, duração e preço
- Exclusão com confirmação

### Salas
- Cards com capacidade
- **Dialog de criação/edição** com nome, descrição e capacidade
- Exclusão com confirmação

### Lista de Espera
- Tabela ordenada por tempo de espera com posição na fila
- Status colorido (Aguardando, Notificado, Agendado, Expirado)
- Botão "Notificar Próximo" — envia e-mail ao primeiro paciente na fila
- Remoção individual de registros

### Pacotes de Tratamento
- Listagem de pacotes com nome, total de sessões, preço e validade
- CRUD completo com formulário inline (criar/editar)
- Soft-delete (desativação sem exclusão física)

### Financeiro
- Filtro por período com seletores de data (padrão: mês corrente)
- Cards de resumo: receita total, a receber, consultas pagas e não pagas
- Breakdown de receita por profissional e por serviço
- Tabela detalhada de pagamentos com botão "Marcar Pago" para consultas pendentes

### Smart Gap Engine — Oferta de Slot
- Página pública `/offer/:token` sem necessidade de login
- Estados: carregando / disponível / confirmado / expirado / erro
- Exibe contagem regressiva de minutos até expirar
- `POST /confirm` cria o agendamento; resposta `409` redireciona para tela de "slot já ocupado"

### NPS Pós-Consulta
- Página pública `/nps/:token` acessível via link do e-mail
- Grade interativa de 0 a 10 com seleção por toque/clique
- Campo de comentário opcional
- Contexto exibido: nome da clínica, serviço e data da consulta

### Portal do Paciente
- Layout dedicado (`patient-layout`) com header "Clinly | Portal do Paciente"
- `/patient` — Card de boas-vindas com nome do paciente + próximas consultas (visual de calendário com dia/mês)
- `/patient/appointments` — Histórico completo com badges de status, nota NPS quando já respondida e botão "Avaliar" para pesquisas pendentes
- Pacientes fazem login pela mesma tela (`/auth/login`) com role `Patient`

### Configurações
- Edição de nome, telefone, endereço, mensagem de boas-vindas e cor primária

### Assinatura
- Toggle mensal/anual (desconto de 20% no anual)
- Cards dos 3 planos (Free, Basic, Pro) com features comparativas
- Checkout direto para o Stripe

### Booking Público
- Busca da clínica por slug
- Lista de profissionais disponíveis com especialidades
- Fluxo de seleção de profissional

### Autenticação
- Login com validação de formulário
- Cadastro com geração automática de slug a partir do nome da clínica
- Recuperação e redefinição de senha
- Logout com invalidação do refresh token no backend

---

## Segurança

| Medida | Onde | Descrição |
|---|---|---|
| Refresh token serializado | `auth.interceptor.ts` | Um `BehaviorSubject` garante que apenas uma chamada `/auth/refresh-token` ocorre por vez; requisições concorrentes aguardam o resultado em vez de disparar refreshes paralelos que rotacionariam o token |
| `X-Requested-With` | `auth.interceptor.ts` | Header enviado em todas as requisições como sinal anti-CSRF para o backend |
| Guards de rota | `auth.guard.ts` | `authGuard` bloqueia acesso a rotas privadas; `guestGuard` redireciona usuários logados |
| Tokens em `localStorage` | `auth.service.ts` | Tokens são removidos no logout e na falha de refresh |
