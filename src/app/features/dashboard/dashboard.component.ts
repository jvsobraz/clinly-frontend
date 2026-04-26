import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { IntelligenceService } from '../../core/services/intelligence.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { STATUS_LABELS, STATUS_COLORS } from '../../core/models/appointment.model';
import { PatientIntelligence } from '../../core/models/intelligence.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private tenantCtx = inject(TenantContextService);
  private intelligenceService = inject(IntelligenceService);

  data = signal<DashboardData | null>(null);
  atRisk = signal<PatientIntelligence[]>([]);
  loading = signal(true);

  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;

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
