import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '../../core/services/appointment.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { Appointment, STATUS_LABELS, STATUS_COLORS } from '../../core/models/appointment.model';
import { AppointmentDialogComponent } from './appointment-dialog.component';
import { AppointmentNotesDialogComponent } from './appointment-notes-dialog.component';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOUR_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule, MatTooltipModule, TranslateModule],
  templateUrl: './appointments.component.html',
})
export class AppointmentsComponent implements OnInit {
  private service = inject(AppointmentService);
  private tenantCtx = inject(TenantContextService);
  private dialog = inject(MatDialog);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  viewMode = signal<'list' | 'week'>('list');

  // week view state
  weekStart = signal(this.getMondayOf(new Date()));

  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;
  hourSlots = HOUR_SLOTS;

  weekDays = computed(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.weekStart());
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  });

  weekLabel = computed(() => {
    const days = this.weekDays();
    const first = days[0];
    const last = days[6];
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${first.toLocaleDateString('pt-BR', opts)} – ${last.toLocaleDateString('pt-BR', opts)}`;
  });

  ngOnInit() { this.load(); }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);

    if (this.viewMode() === 'week') {
      const from = this.toIso(this.weekDays()[0]);
      const to = this.toIso(this.weekDays()[6], true);
      this.service.getWeek(id, from, to).subscribe({
        next: (list) => { this.appointments.set(list); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.service.getAll(id, this.selectedDate()).subscribe({
        next: (list) => { this.appointments.set(list); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  setView(mode: 'list' | 'week') {
    this.viewMode.set(mode);
    this.load();
  }

  prevWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.load();
  }

  nextWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.load();
  }

  goToday() {
    this.weekStart.set(this.getMondayOf(new Date()));
    this.load();
  }

  appointmentsForCell(day: Date, hour: number): Appointment[] {
    return this.appointments().filter(a => {
      const d = new Date(a.scheduledAt);
      return d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear() &&
        d.getHours() === hour;
    });
  }

  isToday(day: Date): boolean {
    const t = new Date();
    return day.getDate() === t.getDate() && day.getMonth() === t.getMonth() && day.getFullYear() === t.getFullYear();
  }

  confirm(id: number) { this.service.confirm(this.tenantCtx.tenantId()!, id).subscribe(() => this.load()); }
  cancel(id: number) { this.service.cancel(this.tenantCtx.tenantId()!, id, { reason: 'Cancelado pelo administrador' }).subscribe(() => this.load()); }
  complete(id: number) { this.service.complete(this.tenantCtx.tenantId()!, id).subscribe(() => this.load()); }
  noShow(id: number) { this.service.noShow(this.tenantCtx.tenantId()!, id).subscribe(() => this.load()); }

  openNotes(apt: { id: number; patient?: { name: string } }) {
    this.dialog.open(AppointmentNotesDialogComponent, {
      data: {
        tenantId: this.tenantCtx.tenantId()!,
        appointmentId: apt.id,
        patientName: apt.patient?.name ?? '—',
      },
      width: '600px',
      maxHeight: '85vh',
    });
  }

  openDialog() {
    this.dialog.open(AppointmentDialogComponent, {
      data: { tenantId: this.tenantCtx.tenantId()! },
      width: '560px',
      maxHeight: '90vh',
    }).afterClosed().subscribe(result => { if (result) this.load(); });
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  statusLabel(status: string): string { return this.statusLabels[status as keyof typeof this.statusLabels] ?? status; }
  statusColor(status: string): string { return this.statusColors[status as keyof typeof this.statusColors] ?? ''; }

  calendarStatusColor(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      Confirmed: 'bg-blue-100 border-blue-300 text-blue-900',
      Completed: 'bg-green-100 border-green-300 text-green-900',
      Cancelled: 'bg-gray-100 border-gray-300 text-gray-500',
      NoShow: 'bg-red-100 border-red-300 text-red-900',
    };
    return map[status] ?? 'bg-slate-100 border-slate-300 text-slate-800';
  }

  private getMondayOf(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toIso(date: Date, endOfDay = false): string {
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  dayLabel(date: Date): string {
    return DAY_LABELS[date.getDay()];
  }

  firstWord(name: string | undefined): string {
    return name?.split(' ')[0] ?? '';
  }
}
