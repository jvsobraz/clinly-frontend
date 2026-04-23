import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { AppointmentService } from '../../core/services/appointment.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { Appointment, STATUS_LABELS, STATUS_COLORS } from '../../core/models/appointment.model';

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './appointments.component.html',
})
export class AppointmentsComponent implements OnInit {
  private service = inject(AppointmentService);
  private tenantCtx = inject(TenantContextService);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  selectedDate = signal(new Date().toISOString().split('T')[0]);

  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id, this.selectedDate()).subscribe({
      next: (list) => { this.appointments.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  confirm(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.confirm(tenantId, id).subscribe(() => this.load());
  }

  cancel(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.cancel(tenantId, id, { reason: 'Cancelado pelo administrador' }).subscribe(() => this.load());
  }

  complete(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.complete(tenantId, id).subscribe(() => this.load());
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  statusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] ?? status;
  }

  statusColor(status: string): string {
    return this.statusColors[status as keyof typeof this.statusColors] ?? '';
  }
}
