import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NpsContext { patientName: string; clinicName: string; serviceName: string; scheduledAt: string; }

@Injectable({ providedIn: 'root' })
export class NpsService {
  private http = inject(HttpClient);
  getContext(token: string): Observable<NpsContext> { return this.http.get<NpsContext>(`${environment.apiUrl}/nps/${token}`); }
  submit(token: string, score: number, comment?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/nps/${token}`, { score, comment });
  }
}
