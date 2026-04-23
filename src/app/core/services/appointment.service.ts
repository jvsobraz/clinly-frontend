import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment, CreateAppointmentRequest,
  UpdateAppointmentRequest, CancelAppointmentRequest,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/appointments`;
  }

  getAll(tenantId: number, date?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<Appointment[]>(this.url(tenantId), { params });
  }

  getById(tenantId: number, id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.url(tenantId)}/${id}`);
  }

  create(tenantId: number, body: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.url(tenantId), body);
  }

  update(tenantId: number, id: number, body: UpdateAppointmentRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.url(tenantId)}/${id}`, body);
  }

  confirm(tenantId: number, id: number): Observable<void> {
    return this.http.patch<void>(`${this.url(tenantId)}/${id}/confirm`, {});
  }

  cancel(tenantId: number, id: number, body: CancelAppointmentRequest): Observable<void> {
    return this.http.patch<void>(`${this.url(tenantId)}/${id}/cancel`, body);
  }

  complete(tenantId: number, id: number): Observable<void> {
    return this.http.patch<void>(`${this.url(tenantId)}/${id}/complete`, {});
  }

  noShow(tenantId: number, id: number): Observable<void> {
    return this.http.patch<void>(`${this.url(tenantId)}/${id}/no-show`, {});
  }
}
