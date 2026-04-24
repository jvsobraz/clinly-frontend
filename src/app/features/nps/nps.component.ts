import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NpsService, NpsContext } from '../../core/services/nps.service';

@Component({
  selector: 'app-nps',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-lg shadow-xl">
        @if (state() === 'loading') {
          <mat-card-content class="p-8 text-center text-gray-500">Carregando...</mat-card-content>
        }
        @if (state() === 'survey' && ctx()) {
          <mat-card-content class="p-8">
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Como foi sua experiência?</h1>
              <p class="text-sm text-gray-500 mt-1">{{ ctx()!.clinicName }} · {{ ctx()!.scheduledAt | date:'dd/MM/yyyy' }}</p>
            </div>
            <p class="text-center text-gray-600 mb-6 text-sm">
              Em uma escala de 0 a 10, o quanto você recomendaria <strong>{{ ctx()!.clinicName }}</strong> para um amigo?
            </p>
            <div class="grid grid-cols-11 gap-1 mb-6">
              @for (n of scores; track n) {
                <button class="py-3 rounded-lg font-bold text-sm transition-all border-2"
                  [class]="selectedScore() === n ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'"
                  (click)="selectedScore.set(n)">{{ n }}</button>
              }
            </div>
            <div class="flex justify-between text-xs text-slate-400 mb-6">
              <span>Não recomendaria</span><span>Recomendaria com certeza</span>
            </div>
            <textarea rows="3" placeholder="Comentário opcional..."
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4"
              [(ngModel)]="comment"></textarea>
            <button mat-flat-button color="primary" class="w-full" [disabled]="selectedScore() === null || submitting()" (click)="submit()">
              Enviar Avaliação
            </button>
          </mat-card-content>
        }
        @if (state() === 'done') {
          <mat-card-content class="p-8 text-center">
            <mat-icon class="text-green-500 text-5xl">favorite</mat-icon>
            <h2 class="text-xl font-bold mt-4">Obrigado pelo feedback!</h2>
            <p class="text-gray-500 text-sm mt-2">Sua avaliação nos ajuda a melhorar continuamente. Até a próxima!</p>
          </mat-card-content>
        }
        @if (state() === 'error') {
          <mat-card-content class="p-8 text-center">
            <mat-icon class="text-gray-400 text-5xl">sentiment_dissatisfied</mat-icon>
            <h2 class="text-xl font-bold mt-4">Link inválido</h2>
            <p class="text-gray-500 text-sm mt-2">Este link não existe ou a avaliação já foi realizada.</p>
          </mat-card-content>
        }
      </mat-card>
    </div>
  `
})
export class NpsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private npsService = inject(NpsService);

  state = signal<'loading' | 'survey' | 'done' | 'error'>('loading');
  ctx = signal<NpsContext | null>(null);
  selectedScore = signal<number | null>(null);
  submitting = signal(false);
  comment = '';
  scores = Array.from({ length: 11 }, (_, i) => i);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.npsService.getContext(token).subscribe({
      next: c => { this.ctx.set(c); this.state.set('survey'); },
      error: () => this.state.set('error')
    });
  }

  submit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    const score = this.selectedScore();
    if (score === null) return;
    this.submitting.set(true);
    this.npsService.submit(token, score, this.comment || undefined).subscribe({
      next: () => { this.state.set('done'); this.submitting.set(false); },
      error: () => { this.state.set('error'); this.submitting.set(false); }
    });
  }
}
