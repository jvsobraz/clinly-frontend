import { AppointmentStatus } from './appointment.model';

export interface DashboardData {
  todayTotal: number;
  todayPending: number;
  todayConfirmed: number;
  todayCancelled: number;
  todayCompleted: number;
  monthTotal: number;
  monthCancelled: number;
  noShowRate: number;
  todayAgenda: AgendaItem[];
}

export interface AgendaItem {
  appointmentId: number;
  patientName: string;
  professionalName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  serviceName?: string;
}
