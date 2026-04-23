# Clinly — Frontend

Interface web da plataforma SaaS de agendamento para clínicas, construída com **Angular 21** e **Angular Material**. Permite que administradores gerenciem agendamentos, profissionais e pacientes, além de oferecer uma página pública de booking por slug da clínica.

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
│   ├── patients/         # CRUD de pacientes com busca
│   ├── clinic-services/  # Serviços e procedimentos da clínica
│   ├── rooms/            # Salas físicas
│   ├── dashboard/        # Métricas e agenda do dia
│   ├── settings/         # Configurações da clínica
│   ├── subscription/     # Planos e checkout Stripe
│   └── booking/          # Agendamento público via slug
└── layout/
    ├── admin-layout/     # Layout com sidebar colapsável + header
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
│   │   │   ├── notification.model.ts
│   │   │   ├── patient.model.ts
│   │   │   ├── professional.model.ts
│   │   │   └── tenant.model.ts
│   │   └── services/
│   │       ├── auth.service.ts            # Login, register, refresh, logout (signal-based)
│   │       ├── appointment.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── notification.service.ts
│   │       ├── patient.service.ts
│   │       ├── professional.service.ts
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
│   │   ├── patients/
│   │   ├── professionals/
│   │   ├── rooms/
│   │   ├── settings/
│   │   └── subscription/
│   ├── layout/
│   │   ├── admin-layout/
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
| `/dashboard` | `DashboardComponent` | `authGuard` | Métricas e agenda do dia |
| `/dashboard/appointments` | `AppointmentsComponent` | `authGuard` | Lista de agendamentos com filtro por data |
| `/dashboard/professionals` | `ProfessionalsComponent` | `authGuard` | Cards de profissionais com especialidades |
| `/dashboard/patients` | `PatientsComponent` | `authGuard` | Tabela de pacientes com busca em tempo real |
| `/dashboard/services` | `ClinicServicesComponent` | `authGuard` | Serviços e procedimentos |
| `/dashboard/rooms` | `RoomsComponent` | `authGuard` | Salas físicas |
| `/dashboard/settings` | `SettingsComponent` | `authGuard` | Configurações da clínica |
| `/dashboard/subscription` | `SubscriptionComponent` | `authGuard` | Planos Free/Basic/Pro + checkout Stripe |
| `/booking/:slug` | `BookingComponent` | — | Agendamento público (sem login) |

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

**`authInterceptor`** injeta automaticamente o `Bearer` token em todas as requisições e, ao receber um `401`, tenta renovar o token via `refreshToken()` antes de fazer logout.

---

## Features implementadas

### Dashboard
- Total de agendamentos do dia (total, confirmados, concluídos, cancelados)
- Métricas do mês (total, cancelamentos, taxa de não comparecimento)
- Agenda do dia com status colorido

### Agendamentos
- Lista com filtro por data
- Ações rápidas via menu: Confirmar, Concluir, Cancelar
- Badge de status com cores semânticas (Pendente, Confirmado, Cancelado, Concluído, Não compareceu)

### Profissionais
- Cards com avatar, CRM, especialidades e duração padrão de consulta
- Badge de status ativo/inativo

### Pacientes
- Tabela com busca em tempo real (debounce de 400ms)
- Campos: nome, e-mail, telefone, plano de saúde

### Serviços da Clínica
- Cards com duração e preço formatado em BRL

### Salas
- Cards com capacidade

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
