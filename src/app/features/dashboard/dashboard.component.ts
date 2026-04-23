import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { DashboardData, AgendaItem } from '../../core/models/dashboard.model';
import { STATUS_LABELS, STATUS_COLORS } from '../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private tenantCtx = inject(TenantContextService);

  data = signal<DashboardData | null>(null);
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
}
