import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FinancialReport } from '../models/financial.model';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private http = inject(HttpClient);

  getReport(tenantId: number, from: Date, to: Date): Observable<FinancialReport> {
    return this.http.get<FinancialReport>(
      `${environment.apiUrl}/tenants/${tenantId}/financial/report?from=${from.toISOString()}&to=${to.toISOString()}`
    );
  }

  recordPayment(tenantId: number, appointmentId: number, status: string, amount?: number, method?: string): Observable<void> {
    return this.http.patch<void>(
      `${environment.apiUrl}/tenants/${tenantId}/appointments/${appointmentId}/payment`,
      { paymentStatus: status, amountPaid: amount, paymentMethod: method }
    );
  }
}
