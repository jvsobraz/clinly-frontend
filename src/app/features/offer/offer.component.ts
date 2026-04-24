import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IntelligenceService } from '../../core/services/intelligence.service';
import { WaitlistOffer } from '../../core/models/intelligence.model';

type PageState = 'loading' | 'available' | 'confirmed' | 'expired' | 'error';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md shadow-xl">
        @if (state() === 'loading') {
          <mat-card-content class="p-8 text-center">
            <mat-progress-bar mode="indeterminate" />
            <p class="mt-4 text-gray-500">Verificando disponibilidade da vaga...</p>
          </mat-card-content>
        }

        @if (state() === 'available' && offer()) {
          <mat-card-content class="p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-indigo-600 text-3xl">event_available</mat-icon>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">Vaga Disponível!</h1>
              <p class="text-gray-500 text-sm mt-1">{{ offer()!.clinicName }}</p>
            </div>

            <div class="bg-indigo-50 rounded-xl p-4 mb-6 flex flex-col gap-3">
              <div class="flex items-center gap-3 text-sm">
                <mat-icon class="text-indigo-500 text-lg">calendar_today</mat-icon>
                <div>
                  <div class="font-semibold text-gray-800">{{ offer()!.slotStart | date:'EEEE, dd/MM/yyyy' }}</div>
                  <div class="text-gray-500">{{ offer()!.slotStart | date:'HH:mm' }} — {{ offer()!.slotEnd | date:'HH:mm' }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <mat-icon class="text-indigo-500 text-lg">person</mat-icon>
                <span>{{ offer()!.professionalName }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <mat-icon class="text-indigo-500 text-lg">medical_services</mat-icon>
                <span>{{ offer()!.serviceName }}</span>
              </div>
            </div>

            <div class="text-center text-xs text-orange-600 mb-4">
              <mat-icon class="text-sm align-middle">timer</mat-icon>
              Oferta expira em {{ expiresInMinutes() }} minutos
            </div>

            <button mat-flat-button color="primary" class="w-full" [disabled]="confirming()" (click)="confirm()">
              @if (confirming()) { <mat-icon>hourglass_empty</mat-icon> Confirmando... }
              @else { <mat-icon>check_circle</mat-icon> Confirmar Vaga }
            </button>
          </mat-card-content>
        }

        @if (state() === 'confirmed') {
          <mat-card-content class="p-8 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon class="text-green-600 text-3xl">check_circle</mat-icon>
            </div>
            <h1 class="text-xl font-bold text-gray-900 mb-2">Consulta Confirmada!</h1>
            <p class="text-gray-500 text-sm">Você receberá um lembrete próximo à data. Nos vemos em breve!</p>
          </mat-card-content>
        }

        @if (state() === 'expired') {
          <mat-card-content class="p-8 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon class="text-gray-400 text-3xl">schedule</mat-icon>
            </div>
            <h1 class="text-xl font-bold text-gray-900 mb-2">Vaga não disponível</h1>
            <p class="text-gray-500 text-sm">Esta oferta expirou ou a vaga foi preenchida por outro paciente. Fique atento ao seu e-mail para novas oportunidades!</p>
          </mat-card-content>
        }

        @if (state() === 'error') {
          <mat-card-content class="p-8 text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon class="text-red-500 text-3xl">error_outline</mat-icon>
            </div>
            <h1 class="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
            <p class="text-gray-500 text-sm">Este link não existe ou já foi utilizado.</p>
          </mat-card-content>
        }
      </mat-card>
    </div>
  `
})
export class OfferComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private intelligenceService = inject(IntelligenceService);

  state = signal<PageState>('loading');
  offer = signal<WaitlistOffer | null>(null);
  confirming = signal(false);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';

    this.intelligenceService.getOffer(token).subscribe({
      next: o => {
        this.offer.set(o);
        if (o.status === 'Confirmed') this.state.set('confirmed');
        else if (o.status === 'Expired' || o.status === 'Skipped') this.state.set('expired');
        else this.state.set('available');
      },
      error: () => this.state.set('error')
    });
  }

  confirm() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.confirming.set(true);
    this.intelligenceService.confirmOffer(token).subscribe({
      next: () => { this.state.set('confirmed'); this.confirming.set(false); },
      error: () => { this.state.set('expired'); this.confirming.set(false); }
    });
  }

  expiresInMinutes(): number {
    if (!this.offer()) return 0;
    const diff = new Date(this.offer()!.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 60000));
  }
}
