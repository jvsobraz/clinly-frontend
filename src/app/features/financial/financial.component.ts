import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FinancialService } from '../../core/services/financial.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { FinancialReport } from '../../core/models/financial.model';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule,
    TranslateModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ 'financial.title' | translate }}</h1>
          <p class="text-slate-500 text-sm">{{ 'financial.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm" [(ngModel)]="fromDate" (change)="load()" />
          <span class="text-slate-400">{{ 'financial.to' | translate }}</span>
          <input type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm" [(ngModel)]="toDate" (change)="load()" />
        </div>
      </div>

      @if (loading()) { <div class="flex justify-center py-16"><mat-spinner diameter="40" /></div> }

      @if (report(); as r) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-green-600">{{ r.totalRevenue | currency:'BRL':'symbol':'1.0-2' }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ 'financial.totalRevenue' | translate }}</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-orange-500">{{ r.totalPending | currency:'BRL':'symbol':'1.0-2' }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ 'financial.pending' | translate }}</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-indigo-600">{{ r.paidCount }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ 'financial.paid' | translate }}</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-slate-500">{{ r.unpaidCount }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ 'financial.unpaid' | translate }}</div>
          </mat-card>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <mat-card>
            <mat-card-header><mat-card-title class="text-base">{{ 'financial.byProfessional' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content class="pt-4">
              @if (r.byProfessional.length === 0) {
                <p class="text-sm text-slate-400 text-center py-6">{{ 'financial.noData' | translate }}</p>
              } @else {
                <canvas id="chart-fin-prof"></canvas>
              }
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title class="text-base">{{ 'financial.byService' | translate }}</mat-card-title></mat-card-header>
            <mat-card-content class="pt-4">
              @if (r.byService.length === 0) {
                <p class="text-sm text-slate-400 text-center py-6">{{ 'financial.noData' | translate }}</p>
              } @else {
                <canvas id="chart-fin-svc"></canvas>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card>
          <mat-card-header><mat-card-title class="text-base">{{ 'financial.payments' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="overflow-x-auto">
              <table class="w-full text-sm mt-2">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">{{ 'financial.columns.patient' | translate }}</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600 hidden md:table-cell">{{ 'financial.columns.professional' | translate }}</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600 hidden lg:table-cell">{{ 'financial.columns.date' | translate }}</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">{{ 'financial.columns.amount' | translate }}</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">{{ 'financial.columns.status' | translate }}</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of r.payments; track p.appointmentId) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-3 py-2 font-medium">{{ p.patientName }}</td>
                      <td class="px-3 py-2 text-slate-500 hidden md:table-cell">{{ p.professionalName }}</td>
                      <td class="px-3 py-2 text-slate-500 hidden lg:table-cell">{{ p.scheduledAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-3 py-2">{{ (p.amountPaid ?? 0) | currency:'BRL':'symbol':'1.0-2' }}</td>
                      <td class="px-3 py-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="paymentClass(p.paymentStatus)">
                          {{ paymentLabel(p.paymentStatus) }}
                        </span>
                      </td>
                      <td class="px-3 py-2">
                        @if (p.paymentStatus === 'Unpaid') {
                          <button mat-stroked-button class="text-xs" (click)="markPaid(p.appointmentId)">{{ 'financial.markPaid' | translate }}</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class FinancialComponent implements OnInit, OnDestroy {
  private service = inject(FinancialService);
  private tenantCtx = inject(TenantContextService);
  private translate = inject(TranslateService);

  report = signal<FinancialReport | null>(null);
  loading = signal(false);
  fromDate = this.firstOfMonth();
  toDate = new Date().toISOString().split('T')[0];

  private chartProf: Chart | null = null;
  private chartSvc: Chart | null = null;

  constructor() {
    effect(() => {
      const r = this.report();
      if (!r) return;
      setTimeout(() => this.renderCharts(r), 0);
    });
  }

  ngOnInit() { this.load(); }

  ngOnDestroy() {
    this.chartProf?.destroy();
    this.chartSvc?.destroy();
  }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getReport(id, new Date(this.fromDate), new Date(this.toDate + 'T23:59:59')).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  markPaid(appointmentId: number) {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.service.recordPayment(id, appointmentId, 'Paid', undefined, 'Dinheiro').subscribe(() => this.load());
  }

  paymentClass(s: string) {
    return { 'Paid': 'bg-green-100 text-green-700', 'Unpaid': 'bg-orange-100 text-orange-700', 'Waived': 'bg-gray-100 text-gray-500' }[s] ?? '';
  }

  paymentLabel(s: string) {
    const key = `financial.status.${s.toLowerCase()}`;
    const result = this.translate.instant(key);
    return result !== key ? result : s;
  }

  private renderCharts(r: FinancialReport) {
    this.chartProf?.destroy();
    this.chartSvc?.destroy();
    this.chartProf = this.makeBarChart('chart-fin-prof', r.byProfessional, '#6366f1');
    this.chartSvc = this.makeBarChart('chart-fin-svc', r.byService, '#22c55e');
  }

  private makeBarChart(id: string, data: { name: string; revenue: number }[], color: string): Chart | null {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas || data.length === 0) return null;
    canvas.style.height = `${Math.max(120, data.length * 44)}px`;
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.revenue),
          backgroundColor: color + '33',
          borderColor: color,
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` R$ ${(ctx.parsed.x as number).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (val) => `R$ ${Number(val).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
            }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  private firstOfMonth() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }
}
