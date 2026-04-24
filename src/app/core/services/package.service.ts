import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TreatmentPackage, PatientPackage,
  CreateTreatmentPackageRequest, AssignPackageRequest,
} from '../models/package.model';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/packages`;
  }

  getAll(tenantId: number): Observable<TreatmentPackage[]> {
    return this.http.get<TreatmentPackage[]>(this.url(tenantId));
  }

  getById(tenantId: number, id: number): Observable<TreatmentPackage> {
    return this.http.get<TreatmentPackage>(`${this.url(tenantId)}/${id}`);
  }

  create(tenantId: number, body: CreateTreatmentPackageRequest): Observable<TreatmentPackage> {
    return this.http.post<TreatmentPackage>(this.url(tenantId), body);
  }

  update(tenantId: number, id: number, body: CreateTreatmentPackageRequest): Observable<TreatmentPackage> {
    return this.http.put<TreatmentPackage>(`${this.url(tenantId)}/${id}`, body);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(tenantId)}/${id}`);
  }

  assignToPatient(tenantId: number, body: AssignPackageRequest): Observable<PatientPackage> {
    return this.http.post<PatientPackage>(`${this.url(tenantId)}/assign`, body);
  }

  getPatientPackages(tenantId: number, patientId: number): Observable<PatientPackage[]> {
    return this.http.get<PatientPackage[]>(`${this.url(tenantId)}/patient/${patientId}`);
  }

  useSession(tenantId: number, patientPackageId: number): Observable<PatientPackage> {
    return this.http.post<PatientPackage>(`${this.url(tenantId)}/patient/${patientPackageId}/use-session`, {});
  }
}
