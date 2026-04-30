import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { IntelligenceService } from '../../core/services/intelligence.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { STATUS_LABELS, STATUS_COLORS } from '../../core/models/appointment.model';
import { PatientIntelligence } from '../../core/models/intelligence.model';
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private tenantCtx = inject(TenantContextService);
  private intelligenceService = inject(IntelligenceService);
  private translate = inject(TranslateService);

  data = signal<DashboardData | null>(null);
  atRisk = signal<PatientIntelligence[]>([]);
  loading = signal(true);

  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;

  private donut: Chart | null = null;

  constructor() {
    effect(() => {
      const d = this.data();
      if (!d) return;
      setTimeout(() => this.renderDonut(d), 0);
    });
  }

  ngOnInit() {
    const tenantId = this.tenantCtx.tenantId();
    if (!tenantId) return;

    this.dashboardService.get(tenantId).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    this.intelligenceService.getAtRiskPatients(tenantId, 5).subscribe({
      next: (r) => this.atRisk.set(r),
      error: () => {}
    });
  }

  ngOnDestroy() {
    this.donut?.destroy();
  }

  private renderDonut(d: DashboardData) {
    const canvas = document.getElementById('chart-today-status') as HTMLCanvasElement;
    if (!canvas) return;
    this.donut?.destroy();
    this.donut = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('dashboard.confirmed'),
          this.translate.instant('dashboard.completed'),
          this.translate.instant('dashboard.cancelled'),
          this.translate.instant('dashboard.pending'),
        ],
        datasets: [{
          data: [d.todayConfirmed, d.todayCompleted, d.todayCancelled, d.todayPending],
          backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 2,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } }
        }
      }
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  statusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] ?? status;
  }

  statusColor(status: string): string {
    return this.statusColors[status as keyof typeof this.statusColors] ?? '';
  }

  retentionClass(s: string) {
    return {
      'AtRisk': 'bg-yellow-100 text-yellow-700',
      'Churned': 'bg-red-100 text-red-700'
    }[s] ?? 'bg-gray-100 text-gray-700';
  }

  retentionLabel(s: string) {
    return { 'AtRisk': 'Em Risco', 'Churned': 'Inativo' }[s] ?? s;
  }
}
