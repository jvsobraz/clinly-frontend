export type PatientPackageStatus = 'Active' | 'Completed' | 'Expired' | 'Cancelled';

export interface TreatmentPackage {
  id: number;
  tenantId: number;
  serviceId?: number;
  serviceName?: string;
  name: string;
  description?: string;
  totalSessions: number;
  price: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface PatientPackage {
  id: number;
  tenantId: number;
  patientId: number;
  patientName: string;
  treatmentPackageId: number;
  packageName: string;
  totalSessions: number;
  sessionsUsed: number;
  paidAmount: number;
  status: PatientPackageStatus;
  purchasedAt: string;
  expiresAt: string;
}

export interface CreateTreatmentPackageRequest {
  name: string;
  description?: string;
  serviceId?: number;
  totalSessions: number;
  price: number;
  validityDays: number;
}

export interface AssignPackageRequest {
  patientId: number;
  treatmentPackageId: number;
  paidAmount: number;
}
