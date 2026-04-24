import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PortalAppointment {
  id: number; scheduledAt: string; endsAt: string; status: string;
  professionalName: string; serviceName: string; clinicName: string;
  cancellationReason: string | null; npsScore: number | null;
  hasNpsPending: boolean; npsToken: string | null;
  paymentStatus: string; amountPaid: number | null;
}

@Injectable({ providedIn: 'root' })
export class PatientPortalService {
  private http = inject(HttpClient);
  getAppointments(): Observable<PortalAppointment[]> { return this.http.get<PortalAppointment[]>(`${environment.apiUrl}/patient-portal/appointments`); }
  getUpcoming(): Observable<PortalAppointment[]> { return this.http.get<PortalAppointment[]>(`${environment.apiUrl}/patient-portal/upcoming`); }
}
