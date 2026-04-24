import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WaitlistService } from '../../core/services/waitlist.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { WaitlistEntry, WAITLIST_STATUS_LABELS } from '../../core/models/waitlist.model';

@Component({
  selector: 'app-waitlist',
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './waitlist.component.html',
})
export class WaitlistComponent implements OnInit {
  private service = inject(WaitlistService);
  private tenantCtx = inject(TenantContextService);

  entries = signal<WaitlistEntry[]>([]);
  loading = signal(true);
  notifying = signal(false);

  statusLabels = WAITLIST_STATUS_LABELS;

  ngOnInit() { this.load(); }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id).subscribe({
      next: (list) => { this.entries.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  remove(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.remove(tenantId, id).subscribe(() => this.load());
  }

  notifyNext() {
    const tenantId = this.tenantCtx.tenantId()!;
    this.notifying.set(true);
    this.service.notifyNext(tenantId).subscribe({
      next: () => { this.notifying.set(false); this.load(); },
      error: () => this.notifying.set(false),
    });
  }

  statusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] ?? status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      Waiting: 'bg-yellow-100 text-yellow-800',
      Notified: 'bg-blue-100 text-blue-800',
      Booked: 'bg-green-100 text-green-800',
      Expired: 'bg-gray-100 text-gray-700',
    };
    return map[status] ?? '';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  waitingCount(): number {
    return this.entries().filter(e => e.status === 'Waiting').length;
  }
}
