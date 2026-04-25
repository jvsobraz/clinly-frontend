import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ── NAV ────────────────────────────────────────────────────────────── -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span class="text-2xl font-bold text-indigo-600">Clinly</span>
        <div class="flex items-center gap-6">
          <a href="#features" class="text-sm text-slate-600 hover:text-indigo-600 transition-colors hidden md:block">Funcionalidades</a>
          <a href="#pricing" class="text-sm text-slate-600 hover:text-indigo-600 transition-colors hidden md:block">Planos</a>
          <a routerLink="/auth/login" class="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Entrar</a>
          <a routerLink="/auth/register"
             class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Começar grátis
          </a>
        </div>
      </div>
    </nav>

    <!-- ── HERO ───────────────────────────────────────────────────────────── -->
    <section class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block"></span>
          SaaS de agendamento para clínicas brasileiras
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Sua clínica mais<br>
          <span class="text-indigo-600">organizada e lucrativa</span>
        </h1>
        <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Agendamentos inteligentes, inteligência de pacientes 360°, previsão de faltas com IA, gestão financeira e muito mais — tudo em um só lugar.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/auth/register"
             class="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Criar conta grátis
          </a>
          <a href="#features"
             class="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            Ver funcionalidades
          </a>
        </div>
        <p class="mt-6 text-sm text-slate-400">Sem cartão de crédito · Plano Free disponível</p>
      </div>
    </section>

    <!-- ── STATS ──────────────────────────────────────────────────────────── -->
    <section class="bg-indigo-600 py-12 px-6">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        @for (stat of stats; track stat.label) {
          <div>
            <div class="text-3xl font-bold">{{ stat.value }}</div>
            <div class="text-indigo-200 text-sm mt-1">{{ stat.label }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ── FEATURES ───────────────────────────────────────────────────────── -->
    <section id="features" class="py-24 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Tudo que sua clínica precisa</h2>
          <p class="text-slate-500 max-w-xl mx-auto">Do agendamento ao faturamento, em uma plataforma moderna e fácil de usar.</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (f of features; track f.title) {
            <div class="p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                   [ngClass]="f.iconBg">
                {{ f.icon }}
              </div>
              <h3 class="font-semibold text-slate-800 mb-2">{{ f.title }}</h3>
              <p class="text-slate-500 text-sm leading-relaxed">{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ── PRICING ────────────────────────────────────────────────────────── -->
    <section id="pricing" class="py-24 px-6 bg-slate-50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Planos simples e transparentes</h2>
          <p class="text-slate-500">Comece grátis, cresça conforme precisar.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          @for (plan of plans; track plan.name) {
            <div class="bg-white rounded-2xl p-8 border transition-all"
                 [class.border-indigo-500]="plan.highlighted"
                 [class.shadow-xl]="plan.highlighted"
                 [class.shadow-indigo-100]="plan.highlighted"
                 [class.border-slate-200]="!plan.highlighted"
                 [class.relative]="plan.highlighted">
              @if (plan.highlighted) {
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">Mais popular</div>
              }
              <div class="text-sm font-medium text-slate-500 mb-1">{{ plan.name }}</div>
              <div class="text-4xl font-bold text-slate-900 mb-1">
                {{ plan.price === 0 ? 'Grátis' : 'R$ ' + plan.price }}
                @if (plan.price > 0) { <span class="text-base font-normal text-slate-400">/mês</span> }
              </div>
              <p class="text-slate-500 text-sm mb-6">{{ plan.desc }}</p>
              <ul class="space-y-2 mb-8">
                @for (feature of plan.features; track feature) {
                  <li class="flex items-center gap-2 text-sm text-slate-600">
                    <span class="text-green-500">✓</span> {{ feature }}
                  </li>
                }
              </ul>
              <a routerLink="/auth/register"
                 class="block text-center py-3 rounded-xl font-medium transition-colors text-sm"
                 [class.bg-indigo-600]="plan.highlighted"
                 [class.text-white]="plan.highlighted"
                 [class.hover:bg-indigo-700]="plan.highlighted"
                 [class.bg-slate-100]="!plan.highlighted"
                 [class.text-slate-700]="!plan.highlighted"
                 [class.hover:bg-slate-200]="!plan.highlighted">
                Começar agora
              </a>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ── CTA ────────────────────────────────────────────────────────────── -->
    <section class="py-24 px-6 bg-indigo-600">
      <div class="max-w-3xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-4">Pronto para transformar sua clínica?</h2>
        <p class="text-indigo-200 mb-8 text-lg">Crie sua conta em menos de 2 minutos. Sem contrato, sem burocracia.</p>
        <a routerLink="/auth/register"
           class="inline-block px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
          Criar conta grátis agora
        </a>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────────────────── -->
    <footer class="bg-slate-900 text-slate-400 py-12 px-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span class="text-white font-bold text-xl">Clinly</span>
          <p class="text-sm mt-1">Gestão inteligente para clínicas brasileiras</p>
        </div>
        <div class="flex gap-6 text-sm">
          <a routerLink="/auth/login" class="hover:text-white transition-colors">Entrar</a>
          <a routerLink="/auth/register" class="hover:text-white transition-colors">Cadastrar</a>
        </div>
        <p class="text-sm">© {{ currentYear }} Clinly. Todos os direitos reservados.</p>
      </div>
    </footer>
  `
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  stats = [
    { value: '100%', label: 'Multi-tenant' },
    { value: '360°', label: 'Inteligência de paciente' },
    { value: '< 2 min', label: 'Para criar conta' },
    { value: 'Free', label: 'Para começar' },
  ];

  features = [
    {
      icon: '📅',
      iconBg: 'bg-blue-50',
      title: 'Agendamento inteligente',
      desc: 'Calendário semanal e lista diária. Confirmação automática, reagendamento simples, fila de espera automática.',
    },
    {
      icon: '🧠',
      iconBg: 'bg-purple-50',
      title: 'Inteligência 360° do paciente',
      desc: 'LTV, taxa de comparecimento, tendência de risco, dia e horário preferidos, histórico completo por paciente.',
    },
    {
      icon: '⚠️',
      iconBg: 'bg-yellow-50',
      title: 'Predição de faltas (No-show)',
      desc: 'Algoritmo de risco que identifica pacientes com alta probabilidade de falta antes da consulta.',
    },
    {
      icon: '💬',
      iconBg: 'bg-green-50',
      title: 'E-mails automáticos',
      desc: 'Confirmação de agendamento, lembretes 24h antes, pesquisa NPS pós-consulta e lembrete de retorno.',
    },
    {
      icon: '💰',
      iconBg: 'bg-emerald-50',
      title: 'Gestão financeira',
      desc: 'Controle de pagamentos, receita por período, pacotes de sessões e relatórios de faturamento.',
    },
    {
      icon: '🔗',
      iconBg: 'bg-indigo-50',
      title: 'Portal do paciente',
      desc: 'Link de agendamento online (booking) por slug da clínica. Paciente confirma ou cancela sozinho.',
    },
  ];

  plans = [
    {
      name: 'Free',
      price: 0,
      desc: 'Ideal para começar',
      highlighted: false,
      features: [
        '1 profissional',
        'Até 50 agendamentos/mês',
        'Portal de agendamento online',
        'Gestão de pacientes',
      ],
    },
    {
      name: 'Basic',
      price: 99,
      desc: 'Para clínicas em crescimento',
      highlighted: true,
      features: [
        'Até 5 profissionais',
        'Agendamentos ilimitados',
        'E-mails automáticos',
        'Múltiplos consultórios',
        'Pacotes de sessões',
        'Fila de espera inteligente',
      ],
    },
    {
      name: 'Pro',
      price: 249,
      desc: 'Para clínicas consolidadas',
      highlighted: false,
      features: [
        'Profissionais ilimitados',
        'Inteligência 360° de pacientes',
        'Predição de no-show',
        'Relatórios financeiros avançados',
        'API access',
        'Suporte prioritário',
      ],
    },
  ];
}
