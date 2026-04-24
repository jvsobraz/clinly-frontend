import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientPortalService, PortalAppointment } from '../../core/services/patient-portal.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-6">
      <div class="bg-indigo-600 text-white rounded-2xl p-6">
        <p class="text-indigo-200 text-sm">Bem-vindo(a),</p>
        <h1 class="text-2xl font-bold">{{ user()?.name }}</h1>
      </div>

      <div>
        <h2 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-500">upcoming</mat-icon> Próximas Consultas
        </h2>
        @if (loading()) { <mat-spinner diameter="32" /> }
        @if (!loading() && upcoming().length === 0) {
          <mat-card class="p-4 text-center text-gray-400 text-sm">Nenhuma consulta agendada.</mat-card>
        }
        @for (apt of upcoming(); track apt.id) {
          <mat-card class="mb-3">
            <mat-card-content class="p-4 flex items-center gap-4">
              <div class="bg-indigo-50 rounded-xl p-3 text-center min-w-[56px]">
                <div class="text-2xl font-bold text-indigo-700">{{ apt.scheduledAt | date:'dd' }}</div>
                <div class="text-xs text-indigo-500 uppercase">{{ apt.scheduledAt | date:'MMM' }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800">{{ apt.serviceName }}</p>
                <p class="text-sm text-gray-500">{{ apt.professionalName }} · {{ apt.clinicName }}</p>
                <p class="text-xs text-gray-400">{{ apt.scheduledAt | date:'HH:mm' }}</p>
              </div>
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{{ apt.status === 'Confirmed' ? 'Confirmado' : 'Pendente' }}</span>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <a routerLink="/patient/appointments" mat-stroked-button class="w-full">
        <mat-icon>history</mat-icon> Ver histórico completo
      </a>
    </div>
  `
})
export class PortalHomeComponent implements OnInit {
  private portalService = inject(PatientPortalService);
  private authService = inject(AuthService);
  upcoming = signal<PortalAppointment[]>([]);
  loading = signal(true);
  user = this.authService.user;

  ngOnInit() {
    this.portalService.getUpcoming().subscribe({
      next: a => { this.upcoming.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
