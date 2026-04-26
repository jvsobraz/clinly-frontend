import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { TranslateModule } from '@ngx-translate/core';

interface Plan {
  id: number; name: string; description: string;
  monthlyPrice: number; annualPrice: number;
  maxProfessionals: number; maxAppointmentsPerMonth: number;
  hasAnalytics: boolean; hasEmailReminders: boolean; hasMultipleRooms: boolean;
}

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './subscription.component.html',
})
export class SubscriptionComponent implements OnInit {
  private http = inject(HttpClient);
  private tenantCtx = inject(TenantContextService);

  plans = signal<Plan[]>([]);
  loading = signal(true);
  annual = signal(false);

  ngOnInit() {
    this.http.get<Plan[]>(`${environment.apiUrl}/subscriptions/plans`).subscribe({
      next: (list) => { this.plans.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  checkout(planId: number) {
    const id = this.tenantCtx.tenantId()!;
    const interval = this.annual() ? 'Annual' : 'Monthly';
    this.http.post<{ url: string }>(`${environment.apiUrl}/subscriptions/checkout`, { planId, interval, tenantId: id })
      .subscribe(res => window.location.href = res.url);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
