import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule, RouterLink, CommonModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 class="text-2xl font-semibold text-slate-800 mb-1">Recuperar senha</h2>
    <p class="text-slate-500 text-sm mb-6">Enviaremos um link para seu e-mail</p>

    @if (sent()) {
      <div class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
        E-mail enviado! Verifique sua caixa de entrada.
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>E-mail</mat-label>
        <input matInput type="email" formControlName="email" />
        <mat-icon matSuffix>email</mat-icon>
      </mat-form-field>

      <button mat-flat-button type="submit" [disabled]="loading() || form.invalid" class="w-full h-11">
        @if (loading()) { <mat-spinner diameter="20" class="inline-block" /> }
        @else { Enviar link }
      </button>
    </form>

    <p class="text-center text-sm text-slate-500 mt-6">
      <a routerLink="/auth/login" class="text-indigo-600 font-medium hover:underline">Voltar ao login</a>
    </p>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = signal(false);
  sent = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.forgotPassword(this.form.getRawValue() as any).subscribe({
      next: () => { this.sent.set(true); this.loading.set(false); },
      error: () => { this.sent.set(true); this.loading.set(false); },
    });
  }
}
