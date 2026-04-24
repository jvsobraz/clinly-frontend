export interface FinancialReport {
  totalRevenue: number;
  totalPending: number;
  paidCount: number;
  unpaidCount: number;
  waivedCount: number;
  byProfessional: { name: string; revenue: number; count: number }[];
  byService: { name: string; revenue: number; count: number }[];
  payments: PaymentItem[];
}

export interface PaymentItem {
  appointmentId: number;
  patientName: string;
  professionalName: string;
  serviceName: string;
  scheduledAt: string;
  amountPaid: number | null;
  paymentMethod: string | null;
  paymentStatus: string;
}
