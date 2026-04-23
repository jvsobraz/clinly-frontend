import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { environment } from '../../../environments/environment';

interface ClinicService { id: number; name: string; description?: string; durationMinutes: number; price: number; }

@Component({
  selector: 'app-clinic-services',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './clinic-services.component.html',
})
export class ClinicServicesComponent implements OnInit {
  private http = inject(HttpClient);
  private tenantCtx = inject(TenantContextService);

  services = signal<ClinicService[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.http.get<ClinicService[]>(`${environment.apiUrl}/tenants/${id}/services`).subscribe({
      next: (list) => { this.services.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
