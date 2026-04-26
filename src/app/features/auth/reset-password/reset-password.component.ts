import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule, RouterLink, CommonModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <h2 class="text-2xl font-semibold text-slate-800 mb-1">{{ 'auth.resetPassword.title' | translate }}</h2>
    <p class="text-slate-500 text-sm mb-6">{{ 'auth.resetPassword.subtitle' | translate }}</p>

    @if (success()) {
      <div class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
        {{ 'auth.resetPassword.success' | translate }}
        <a routerLink="/auth/login" class="font-medium underline">{{ 'auth.resetPassword.login' | translate }}</a>
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'auth.resetPassword.newPassword' | translate }}</mat-label>
          <input matInput type="password" formControlName="newPassword" />
        </mat-form-field>
        <button mat-flat-button type="submit" [disabled]="loading() || form.invalid" class="w-full h-11">
          @if (loading()) { <mat-spinner diameter="20" class="inline-block" /> }
          @else { {{ 'auth.resetPassword.submit' | translate }} }
        </button>
      </form>
    }
  `,
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });
  loading = signal(false);
  success = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.auth.resetPassword({ token, email, newPassword: this.form.value.newPassword! }).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
