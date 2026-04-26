import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PatientPortalService, PortalAppointment } from '../../core/services/patient-portal.service';

const STATUS_CLS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  NoShow: 'bg-gray-100 text-gray-600',
};

const STATUS_KEY: Record<string, string> = {
  Pending: 'portal.status.pending',
  Confirmed: 'portal.status.confirmed',
  Completed: 'portal.status.completed',
  Cancelled: 'portal.status.cancelled',
  NoShow: 'portal.status.noShow',
};

@Component({
  selector: 'app-portal-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ 'portal.history.title' | translate }}</h1>
        <p class="text-sm text-gray-500">{{ 'portal.history.subtitle' | translate }}</p>
      </div>

      @if (loading()) { <div class="flex justify-center py-12"><mat-spinner diameter="40" /></div> }

      @for (apt of appointments(); track apt.id) {
        <mat-card class="overflow-hidden">
          <mat-card-content class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-gray-800">{{ apt.serviceName }}</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusCls(apt.status)">
                    {{ statusLabel(apt.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  <mat-icon class="text-sm align-middle">person</mat-icon> {{ apt.professionalName }}
                  · <mat-icon class="text-sm align-middle">business</mat-icon> {{ apt.clinicName }}
                </p>
                <p class="text-sm text-gray-400 mt-0.5">
                  <mat-icon class="text-sm align-middle">calendar_today</mat-icon>
                  {{ apt.scheduledAt | date:'dd/MM/yyyy' }} às {{ apt.scheduledAt | date:'HH:mm' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                @if (apt.npsScore !== null) {
                  <div class="text-xs text-gray-400">{{ 'portal.history.yourScore' | translate }}</div>
                  <div class="text-2xl font-bold text-indigo-600">{{ apt.npsScore }}/10</div>
                }
                @if (apt.hasNpsPending) {
                  <a [routerLink]="['/nps', apt.npsToken]"
                     class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 no-underline">
                    {{ 'portal.history.rate' | translate }}
                  </a>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      @if (!loading() && appointments().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <mat-icon class="text-5xl">event_busy</mat-icon>
          <p class="mt-2">{{ 'portal.history.empty' | translate }}</p>
        </div>
      }
    </div>
  `
})
export class PortalAppointmentsComponent implements OnInit {
  private portalService = inject(PatientPortalService);
  private translate = inject(TranslateService);
  appointments = signal<PortalAppointment[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.portalService.getAppointments().subscribe({
      next: a => { this.appointments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(s: string) {
    const key = STATUS_KEY[s];
    return key ? this.translate.instant(key) : s;
  }

  statusCls(s: string) { return STATUS_CLS[s] ?? ''; }
}
