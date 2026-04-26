import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { environment } from '../../../environments/environment';
import { ServiceDialogComponent, ClinicService } from './service-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clinic-services',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './clinic-services.component.html',
})
export class ClinicServicesComponent implements OnInit {
  private http = inject(HttpClient);
  private tenantCtx = inject(TenantContextService);
  private dialog = inject(MatDialog);

  services = signal<ClinicService[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.http.get<ClinicService[]>(`${environment.apiUrl}/tenants/${id}/services`).subscribe({
      next: (list) => { this.services.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDialog(service?: ClinicService) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.dialog.open(ServiceDialogComponent, {
      data: { tenantId, service },
      width: '480px',
    }).afterClosed().subscribe(result => {
      if (result) this.load();
    });
  }

  delete(id: number) {
    if (!confirm('Remover este serviço?')) return;
    const tenantId = this.tenantCtx.tenantId()!;
    this.http.delete(`${environment.apiUrl}/tenants/${tenantId}/services/${id}`).subscribe(() => {
      this.services.update(list => list.filter(s => s.id !== id));
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
