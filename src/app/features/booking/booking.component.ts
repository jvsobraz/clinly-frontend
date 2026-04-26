import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking',
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    TranslateModule,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start justify-center p-4 pt-10">
      <div class="w-full max-w-2xl">

        @if (loading()) {
          <div class="flex justify-center py-20"><mat-spinner diameter="48" /></div>
        }

        @if (!loading() && !clinic()) {
          <div class="text-center py-20 text-slate-500">
            <mat-icon class="text-5xl">search_off</mat-icon>
            <p class="mt-3 text-lg font-medium">{{ 'booking.notFound' | translate }}</p>
          </div>
        }

        @if (clinic(); as c) {
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-slate-800">{{ c.name }}</h1>
            <p class="text-slate-500 mt-1">{{ c.welcomeMessage || ('booking.defaultWelcome' | translate) }}</p>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <mat-icon class="text-indigo-600">event</mat-icon>
              </div>
              <div>
                <h2 class="font-semibold text-slate-800">{{ 'booking.new' | translate }}</h2>
                <p class="text-sm text-slate-400">{{ 'booking.selectProfessional' | translate }}</p>
              </div>
            </div>

            <div class="space-y-4">
              @for (prof of professionals(); track prof.id) {
                <button
                  class="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors hover:border-indigo-300"
                  [class]="selectedProfessional()?.id === prof.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'"
                  (click)="selectedProfessional.set(prof)">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <mat-icon class="text-slate-500">person</mat-icon>
                  </div>
                  <div class="text-left">
                    <p class="font-medium text-slate-800">{{ prof.name }}</p>
                    @if (prof.specialties?.length) {
                      <p class="text-sm text-slate-500">{{ prof.specialties.join(', ') }}</p>
                    }
                  </div>
                </button>
              }
            </div>

            @if (selectedProfessional()) {
              <div class="mt-6 pt-6 border-t border-slate-100 text-center">
                <p class="text-slate-500 text-sm mb-4">{{ 'booking.comingSoon' | translate }}</p>
                <a routerLink="/" mat-flat-button>{{ 'booking.back' | translate }}</a>
              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  clinic = signal<any | null>(null);
  professionals = signal<any[]>([]);
  selectedProfessional = signal<any | null>(null);
  loading = signal(true);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.http.get<any>(`${environment.apiUrl}/booking/${slug}/clinic`).subscribe({
      next: (c) => {
        this.clinic.set(c);
        this.http.get<any[]>(`${environment.apiUrl}/booking/${slug}/professionals`).subscribe({
          next: (list) => { this.professionals.set(list); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => { this.clinic.set(null); this.loading.set(false); },
    });
  }
}
