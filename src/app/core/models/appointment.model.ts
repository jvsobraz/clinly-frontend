export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'NoShow' | 'Completed';

export interface Appointment {
  id: number;
  tenantId: number;
  patientId: number;
  patientName: string;
  professionalId: number;
  professionalName: string;
  serviceId?: number;
  serviceName?: string;
  roomId?: number;
  roomName?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  noShowRiskScore: number;
  createdAt: string;
}

export interface NoShowRisk {
  score: number;
  label: 'Low' | 'Medium' | 'High';
}

export interface CreateAppointmentRequest {
  patientId: number;
  professionalId: number;
  serviceId: number;
  roomId?: number;
  scheduledAt: string;
  patientNotes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt: string;
  serviceId?: number;
  roomId?: number;
  patientNotes?: string;
}

export interface CancelAppointmentRequest {
  reason?: string;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  Pending: 'Pendente',
  Confirmed: 'Confirmado',
  Cancelled: 'Cancelado',
  NoShow: 'Não compareceu',
  Completed: 'Concluído',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-red-100 text-red-800',
  NoShow: 'bg-gray-100 text-gray-800',
  Completed: 'bg-green-100 text-green-800',
};
