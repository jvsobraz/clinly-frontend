export interface Patient {
  id: number;
  tenantId: number;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  healthInsurance?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  healthInsurance?: string;
  emergencyContact?: string;
  notes?: string;
}
