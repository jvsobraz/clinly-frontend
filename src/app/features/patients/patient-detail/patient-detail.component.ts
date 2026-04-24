import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntelligenceService } from '../../../core/services/intelligence.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { PatientIntelligence } from '../../../core/models/intelligence.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, PercentPipe,
    MatCardModule, MatButtonModule, MatChipsModule,
    MatIconModule, MatDividerModule, MatProgressBarModule, MatTooltipModule
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ intel()?.patientName ?? 'Paciente' }}</h1>
          <p class="text-sm text-gray-500">Perfil de Inteligência 360°</p>
        </div>
        @if (intel(); as i) {
          <div class="ml-auto">
            <span class="px-3 py-1 rounded-full text-sm font-medium" [ngClass]="retentionClass(i.retentionStatus)">
              {{ retentionLabel(i.retentionStatus) }}
            </span>
          </div>
        }
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (intel(); as i) {
        <!-- Insights alerts -->
        @if (i.insights.length > 0) {
          <div class="mb-6 flex flex-col gap-2">
            @for (insight of i.insights; track insight.message) {
              <div class="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
                   [ngClass]="insightBg(insight.level)">
                <mat-icon class="text-lg shrink-0" [ngClass]="insightIcon(insight.level)">
                  {{ insightIconName(insight.level) }}
                </mat-icon>
                <span>{{ insight.message }}</span>
              </div>
            }
          </div>
        }

        <!-- Metrics grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <mat-card class="text-center p-4">
            <div class="text-3xl font-bold text-indigo-600">{{ i.lifetimeValue | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="text-xs text-gray-500 mt-1">Valor Vitalício (LTV)</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-3xl font-bold" [ngClass]="attendanceColor(i.attendanceRate)">{{ i.attendanceRate | percent:'1.0-0' }}</div>
            <div class="text-xs text-gray-500 mt-1">Taxa de Comparecimento</div>
            <div class="text-xs text-gray-400">{{ i.completedAppointments }}/{{ i.totalAppointments }} consultas</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-3xl font-bold text-gray-700">{{ i.daysSinceLastVisit < 0 ? '—' : i.daysSinceLastVisit }}</div>
            <div class="text-xs text-gray-500 mt-1">Dias desde última visita</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-3xl font-bold" [ngClass]="trendColor(i.riskTrend)">
              <mat-icon>{{ trendIcon(i.riskTrend) }}</mat-icon>
            </div>
            <div class="text-xs text-gray-500 mt-1">Tendência</div>
            <div class="text-xs text-gray-400">{{ trendLabel(i.riskTrend) }}</div>
          </mat-card>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Comportamento -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-base">Comportamento de Agendamento</mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <div class="flex flex-col gap-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Dia preferido</span>
                  <span class="font-medium">{{ i.preferredDayOfWeek ?? '—' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Período preferido</span>
                  <span class="font-medium">{{ i.preferredTimeWindow ?? '—' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Antecedência média</span>
                  <span class="font-medium">{{ i.averageBookingLeadDays }} dias</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Não comparecimentos</span>
                  <span class="font-medium text-red-600">{{ i.noShowCount }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Cancelamentos</span>
                  <span class="font-medium text-orange-600">{{ i.cancelledCount }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Histórico e próxima consulta -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-base">Histórico Clínico</mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <div class="flex flex-col gap-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Última consulta</span>
                  <span class="font-medium">{{ i.lastAppointmentDate ? (i.lastAppointmentDate | date:'dd/MM/yyyy') : '—' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Próxima consulta</span>
                  <span class="font-medium text-indigo-600">{{ i.nextAppointmentDate ? (i.nextAppointmentDate | date:'dd/MM/yyyy') : 'Nenhuma agendada' }}</span>
                </div>
                <mat-divider />
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Pacote ativo</span>
                  @if (i.hasActivePackage) {
                    <span class="font-medium text-green-600">Sim — {{ i.packageSessionsRemaining }} sessões restantes</span>
                  } @else {
                    <span class="text-gray-400">Não</span>
                  }
                </div>
                @if (i.hasActivePackage && i.packageAdherence !== null) {
                  <div>
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Aderência ao pacote</span>
                      <span>{{ i.packageAdherence | percent:'1.0-0' }}</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="(i.packageAdherence ?? 0) * 100" />
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private intelligenceService = inject(IntelligenceService);
  private tenantCtx = inject(TenantContextService);

  intel = signal<PatientIntelligence | null>(null);
  loading = signal(false);

  ngOnInit() {
    const patientId = Number(this.route.snapshot.paramMap.get('id'));
    const tenantId = this.tenantCtx.tenantId();
    if (!tenantId) return;

    this.loading.set(true);
    this.intelligenceService.getPatientIntelligence(tenantId, patientId).subscribe({
      next: data => { this.intel.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goBack() { this.router.navigate(['/dashboard/patients']); }

  retentionClass(s: string) {
    return {
      'Active': 'bg-green-100 text-green-700',
      'AtRisk': 'bg-yellow-100 text-yellow-700',
      'Churned': 'bg-red-100 text-red-700'
    }[s] ?? 'bg-gray-100 text-gray-700';
  }

  retentionLabel(s: string) {
    return { 'Active': 'Ativo', 'AtRisk': 'Em Risco', 'Churned': 'Inativo' }[s] ?? s;
  }

  attendanceColor(rate: number) {
    if (rate >= 0.75) return 'text-green-600';
    if (rate >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }

  trendColor(t: string) {
    return { 'Improving': 'text-green-600', 'Stable': 'text-gray-500', 'Deteriorating': 'text-red-600' }[t] ?? '';
  }

  trendIcon(t: string) {
    return { 'Improving': 'trending_up', 'Stable': 'trending_flat', 'Deteriorating': 'trending_down' }[t] ?? 'trending_flat';
  }

  trendLabel(t: string) {
    return { 'Improving': 'Melhorando', 'Stable': 'Estável', 'Deteriorating': 'Piorando' }[t] ?? t;
  }

  insightBg(l: string) {
    return { 'info': 'bg-blue-50 text-blue-800', 'warning': 'bg-yellow-50 text-yellow-800', 'danger': 'bg-red-50 text-red-800' }[l] ?? '';
  }

  insightIcon(l: string) {
    return { 'info': 'text-blue-500', 'warning': 'text-yellow-500', 'danger': 'text-red-500' }[l] ?? '';
  }

  insightIconName(l: string) {
    return { 'info': 'info', 'warning': 'warning', 'danger': 'error' }[l] ?? 'info';
  }
}
