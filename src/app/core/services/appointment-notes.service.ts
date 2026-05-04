import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppointmentNote {
  id: number;
  appointmentId: number;
  content: string;
  isPrivate: boolean;
  authorName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentNotesService {
  private http = inject(HttpClient);

  getAll(tenantId: number, appointmentId: number): Observable<AppointmentNote[]> {
    return this.http.get<AppointmentNote[]>(
      `${environment.apiUrl}/tenants/${tenantId}/appointments/${appointmentId}/notes`
    );
  }

  create(tenantId: number, appointmentId: number, content: string, isPrivate = false): Observable<AppointmentNote> {
    return this.http.post<AppointmentNote>(
      `${environment.apiUrl}/tenants/${tenantId}/appointments/${appointmentId}/notes`,
      { content, isPrivate }
    );
  }

  delete(tenantId: number, appointmentId: number, noteId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/tenants/${tenantId}/appointments/${appointmentId}/notes/${noteId}`
    );
  }
}
