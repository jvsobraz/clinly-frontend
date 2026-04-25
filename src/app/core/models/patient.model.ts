export interface Patient {
  id: number;
  tenantId: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  healthInsurance?: string;
  healthInsuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}
