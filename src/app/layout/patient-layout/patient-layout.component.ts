import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-indigo-600 font-bold text-xl">Clinly</span>
          <span class="text-slate-300">|</span>
          <span class="text-sm text-slate-500">Portal do Paciente</span>
        </div>
        <div class="flex items-center gap-4">
          <a routerLink="/patient" routerLinkActive="text-indigo-600" [routerLinkActiveOptions]="{exact:true}"
             class="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1 no-underline">
            <mat-icon class="text-[18px]">upcoming</mat-icon> Próximas
          </a>
          <a routerLink="/patient/appointments" routerLinkActive="text-indigo-600"
             class="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1 no-underline">
            <mat-icon class="text-[18px]">history</mat-icon> Histórico
          </a>
          <button mat-icon-button (click)="logout()" title="Sair">
            <mat-icon class="text-slate-400">logout</mat-icon>
          </button>
        </div>
      </header>
      <main><router-outlet /></main>
    </div>
  `
})
export class PatientLayoutComponent {
  private auth = inject(AuthService);
  logout() { this.auth.logout(); }
}
