export interface Professional {
  id: number;
  tenantId: number;
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  crm?: string;
  bio?: string;
  avatarUrl?: string;
  defaultAppointmentDurationMinutes: number;
  acceptsNewPatients: boolean;
  isActive: boolean;
  specialties: string[];
}
