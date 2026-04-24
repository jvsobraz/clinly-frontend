import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FinancialService } from '../../core/services/financial.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { FinancialReport } from '../../core/models/financial.model';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Financeiro</h1>
          <p class="text-slate-500 text-sm">Receita e pagamentos por período</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm" [(ngModel)]="fromDate" (change)="load()" />
          <span class="text-slate-400">até</span>
          <input type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm" [(ngModel)]="toDate" (change)="load()" />
        </div>
      </div>

      @if (loading()) { <div class="flex justify-center py-16"><mat-spinner diameter="40" /></div> }

      @if (report(); as r) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-green-600">{{ r.totalRevenue | currency:'BRL':'symbol':'1.0-2' }}</div>
            <div class="text-xs text-gray-500 mt-1">Receita Total</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-orange-500">{{ r.totalPending | currency:'BRL':'symbol':'1.0-2' }}</div>
            <div class="text-xs text-gray-500 mt-1">A Receber</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-indigo-600">{{ r.paidCount }}</div>
            <div class="text-xs text-gray-500 mt-1">Pagos</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-slate-500">{{ r.unpaidCount }}</div>
            <div class="text-xs text-gray-500 mt-1">Pendentes</div>
          </mat-card>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <mat-card>
            <mat-card-header><mat-card-title class="text-base">Por Profissional</mat-card-title></mat-card-header>
            <mat-card-content class="pt-4">
              @for (p of r.byProfessional; track p.name) {
                <div class="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                  <span class="text-slate-700">{{ p.name }}</span>
                  <div class="text-right">
                    <div class="font-semibold text-green-600">{{ p.revenue | currency:'BRL':'symbol':'1.0-2' }}</div>
                    <div class="text-xs text-slate-400">{{ p.count }} consultas</div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title class="text-base">Por Serviço</mat-card-title></mat-card-header>
            <mat-card-content class="pt-4">
              @for (s of r.byService; track s.name) {
                <div class="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                  <span class="text-slate-700">{{ s.name }}</span>
                  <div class="text-right">
                    <div class="font-semibold text-green-600">{{ s.revenue | currency:'BRL':'symbol':'1.0-2' }}</div>
                    <div class="text-xs text-slate-400">{{ s.count }} consultas</div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card>
          <mat-card-header><mat-card-title class="text-base">Pagamentos</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="overflow-x-auto">
              <table class="w-full text-sm mt-2">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">Paciente</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600 hidden md:table-cell">Profissional</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600 hidden lg:table-cell">Data</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">Valor</th>
                    <th class="text-left px-3 py-2 font-medium text-slate-600">Status</th>
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
                          <button mat-stroked-button class="text-xs" (click)="markPaid(p.appointmentId)">Marcar Pago</button>
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
export class FinancialComponent implements OnInit {
  private service = inject(FinancialService);
  private tenantCtx = inject(TenantContextService);

  report = signal<FinancialReport | null>(null);
  loading = signal(false);
  fromDate = this.firstOfMonth();
  toDate = new Date().toISOString().split('T')[0];

  ngOnInit() { this.load(); }

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
    return { 'Paid': 'Pago', 'Unpaid': 'Pendente', 'Waived': 'Isento' }[s] ?? s;
  }

  private firstOfMonth() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }
}
