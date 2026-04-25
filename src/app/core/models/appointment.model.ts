export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'NoShow' | 'Completed';

export interface AppointmentPatient {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface AppointmentProfessional {
  id: number;
  name: string;
  crm?: string;
  avatarUrl?: string;
}

export interface AppointmentService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: number;
  tenantId: number;
  scheduledAt: string;
  endsAt: string;
  status: AppointmentStatus;
  patientNotes?: string;
  cancellationReason?: string;
  noShowRiskScore: number;
  roomName?: string;
  createdAt: string;
  patient: AppointmentPatient;
  professional: AppointmentProfessional;
  service: AppointmentService;
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
