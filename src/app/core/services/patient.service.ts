import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, CreatePatientRequest } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/patients`;
  }

  getAll(tenantId: number, search?: string): Observable<Patient[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Patient[]>(this.url(tenantId), { params });
  }

  getById(tenantId: number, id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.url(tenantId)}/${id}`);
  }

  register(tenantId: number, body: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(`${this.url(tenantId)}/register`, body);
  }

  create(tenantId: number, body: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.url(tenantId), body);
  }

  update(tenantId: number, id: number, body: CreatePatientRequest): Observable<Patient> {
    return this.http.put<Patient>(`${this.url(tenantId)}/${id}`, body);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(tenantId)}/${id}`);
  }
}
