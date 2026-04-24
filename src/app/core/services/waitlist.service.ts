import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WaitlistEntry, CreateWaitlistEntryRequest } from '../models/waitlist.model';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/waitlist`;
  }

  getAll(tenantId: number): Observable<WaitlistEntry[]> {
    return this.http.get<WaitlistEntry[]>(this.url(tenantId));
  }

  add(tenantId: number, body: CreateWaitlistEntryRequest): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(this.url(tenantId), body);
  }

  remove(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(tenantId)}/${id}`);
  }

  notifyNext(tenantId: number, professionalId?: number, serviceId?: number): Observable<void> {
    let params = new HttpParams();
    if (professionalId) params = params.set('professionalId', professionalId);
    if (serviceId) params = params.set('serviceId', serviceId);
    return this.http.post<void>(`${this.url(tenantId)}/notify-next`, {}, { params });
  }
}
