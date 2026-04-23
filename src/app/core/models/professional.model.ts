export interface Professional {
  id: number;
  tenantId: number;
  userId?: number;
  name: string;
  crm?: string;
  bio?: string;
  avatarUrl?: string;
  defaultAppointmentDurationMinutes: number;
  acceptsNewPatients: boolean;
  isActive: boolean;
  specialties: string[];
}

export interface CreateProfessionalRequest {
  name: string;
  crm?: string;
  bio?: string;
  defaultAppointmentDurationMinutes: number;
  acceptsNewPatients: boolean;
  specialtyIds: number[];
}
