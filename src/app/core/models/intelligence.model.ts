export interface PatientInsight {
  level: 'info' | 'warning' | 'danger';
  message: string;
}

export interface PatientIntelligence {
  patientId: number;
  patientName: string;
  lifetimeValue: number;
  totalAppointments: number;
  completedAppointments: number;
  noShowCount: number;
  cancelledCount: number;
  attendanceRate: number;
  retentionStatus: 'Active' | 'AtRisk' | 'Churned';
  lastAppointmentDate: string | null;
  nextAppointmentDate: string | null;
  daysSinceLastVisit: number;
  preferredDayOfWeek: string | null;
  preferredTimeWindow: string | null;
  averageBookingLeadDays: number;
  hasActivePackage: boolean;
  packageAdherence: number | null;
  packageSessionsRemaining: number | null;
  riskTrend: 'Improving' | 'Stable' | 'Deteriorating';
  insights: PatientInsight[];
}

export interface WaitlistOffer {
  token: string;
  clinicName: string;
  patientName: string;
  professionalName: string;
  serviceName: string;
  slotStart: string;
  slotEnd: string;
  expiresAt: string;
  status: string;
}
