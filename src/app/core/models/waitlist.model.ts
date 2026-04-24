export type WaitlistStatus = 'Waiting' | 'Notified' | 'Booked' | 'Expired';

export interface WaitlistEntry {
  id: number;
  tenantId: number;
  patientId: number;
  patientName: string;
  professionalId?: number;
  professionalName?: string;
  serviceId?: number;
  serviceName?: string;
  status: WaitlistStatus;
  notes?: string;
  notifiedAt?: string;
  createdAt: string;
}

export interface CreateWaitlistEntryRequest {
  patientId: number;
  professionalId?: number;
  serviceId?: number;
  notes?: string;
}

export const WAITLIST_STATUS_LABELS: Record<WaitlistStatus, string> = {
  Waiting: 'Aguardando',
  Notified: 'Notificado',
  Booked: 'Agendado',
  Expired: 'Expirado',
};
