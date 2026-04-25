import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Professional } from '../models/professional.model';

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/professionals`;
  }

  getAll(tenantId: number): Observable<Professional[]> {
    return this.http.get<Professional[]>(this.url(tenantId));
  }

  getById(tenantId: number, id: number): Observable<Professional> {
    return this.http.get<Professional>(`${this.url(tenantId)}/${id}`);
  }

  register(tenantId: number, body: object): Observable<Professional> {
    return this.http.post<Professional>(`${this.url(tenantId)}/register`, body);
  }

  update(tenantId: number, id: number, body: object): Observable<Professional> {
    return this.http.put<Professional>(`${this.url(tenantId)}/${id}`, body);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(tenantId)}/${id}`);
  }
}
