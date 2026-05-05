import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export interface OnboardingDialogData {
  tenantId: number;
}

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatIconModule, TranslateModule,
  ],
  templateUrl: './onboarding-wizard.component.html',
})
export class OnboardingWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<OnboardingWizardComponent>);
  readonly dialogData = inject<OnboardingDialogData>(MAT_DIALOG_DATA);

  step = signal(0);
  saving = signal(false);
  private currentTenant: any = null;

  readonly dots = [1, 2, 3];

  clinicForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    address: [''],
  });

  professionalForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    defaultAppointmentDurationMinutes: [30, [Validators.required, Validators.min(5)]],
  });

  serviceForm = this.fb.group({
    name: ['', Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(5)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/tenants/${this.dialogData.tenantId}`).subscribe({
      next: (t) => {
        this.currentTenant = t;
        this.clinicForm.patchValue({ name: t.name ?? '', phone: t.phone ?? '', address: t.address ?? '' });
      },
    });
  }

  start() { this.step.set(1); }

  next() {
    const s = this.step();
    if (s === 1) { this.saveClinic(); return; }
    if (s === 2) { this.saveProfessional(); return; }
    if (s === 3) { this.saveService(); return; }
  }

  skipStep() {
    const s = this.step();
    this.step.set(s >= 3 ? 4 : s + 1);
  }

  finish() {
    localStorage.setItem(`clinly_onboarding_done_${this.dialogData.tenantId}`, '1');
    this.dialogRef.close(true);
  }

  private saveClinic() {
    if (this.clinicForm.invalid) { this.step.set(2); return; }
    this.saving.set(true);
    const body = { ...(this.currentTenant ?? {}), ...this.clinicForm.getRawValue() };
    this.http.put(`${environment.apiUrl}/tenants/${this.dialogData.tenantId}`, body).subscribe({
      next: () => { this.saving.set(false); this.step.set(2); },
      error: () => { this.saving.set(false); this.step.set(2); },
    });
  }

  private saveProfessional() {
    if (this.professionalForm.invalid) { this.step.set(3); return; }
    this.saving.set(true);
    this.http.post(
      `${environment.apiUrl}/tenants/${this.dialogData.tenantId}/professionals/register`,
      this.professionalForm.getRawValue()
    ).subscribe({
      next: () => { this.saving.set(false); this.step.set(3); },
      error: () => { this.saving.set(false); this.step.set(3); },
    });
  }

  private saveService() {
    if (this.serviceForm.invalid) { this.step.set(4); return; }
    this.saving.set(true);
    this.http.post(
      `${environment.apiUrl}/tenants/${this.dialogData.tenantId}/services`,
      this.serviceForm.getRawValue()
    ).subscribe({
      next: () => { this.saving.set(false); this.step.set(4); },
      error: () => { this.saving.set(false); this.step.set(4); },
    });
  }
}
