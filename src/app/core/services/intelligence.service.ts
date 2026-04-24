import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientIntelligence, WaitlistOffer } from '../models/intelligence.model';

@Injectable({ providedIn: 'root' })
export class IntelligenceService {
  private http = inject(HttpClient);

  getPatientIntelligence(tenantId: number, patientId: number): Observable<PatientIntelligence> {
    return this.http.get<PatientIntelligence>(
      `${environment.apiUrl}/tenants/${tenantId}/patients/${patientId}/intelligence`
    );
  }

  getAtRiskPatients(tenantId: number, limit = 10): Observable<PatientIntelligence[]> {
    return this.http.get<PatientIntelligence[]>(
      `${environment.apiUrl}/tenants/${tenantId}/patients/at-risk?limit=${limit}`
    );
  }

  getOffer(token: string): Observable<WaitlistOffer> {
    return this.http.get<WaitlistOffer>(`${environment.apiUrl}/offer/${token}`);
  }

  confirmOffer(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/offer/${token}/confirm`, {});
  }
}
