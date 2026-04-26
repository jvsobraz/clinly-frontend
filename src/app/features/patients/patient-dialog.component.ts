import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient.model';

interface DialogData {
  tenantId: number;
  patient?: Patient;
}

@Component({
  selector: 'app-patient-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.patient ? ('patients.dialog.titleEdit' | translate) : ('patients.dialog.titleNew' | translate) }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[440px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'patients.dialog.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.email' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.phone' | translate }}</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.cpf' | translate }}</mat-label>
            <input matInput formControlName="cpf" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.birthDate' | translate }}</mat-label>
            <input matInput type="date" formControlName="birthDate" />
          </mat-form-field>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.gender' | translate }}</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="">{{ 'patients.dialog.genderNone' | translate }}</mat-option>
              <mat-option value="Masculino">{{ 'patients.dialog.genderM' | translate }}</mat-option>
              <mat-option value="Feminino">{{ 'patients.dialog.genderF' | translate }}</mat-option>
              <mat-option value="Não binário">{{ 'patients.dialog.genderNB' | translate }}</mat-option>
              <mat-option value="Prefiro não informar">{{ 'patients.dialog.genderNA' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'patients.dialog.healthInsurance' | translate }}</mat-label>
            <input matInput formControlName="healthInsurance" />
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'patients.dialog.notes' | translate }}</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2 px-6 pb-4">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button [disabled]="form.invalid || saving()" (click)="save()">
        {{ saving() ? ('common.savingEllipsis' | translate) : ('common.save' | translate) }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PatientDialogComponent {
  private ref = inject(MatDialogRef<PatientDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private service = inject(PatientService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);

  form = this.fb.group({
    name: [this.data.patient?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.data.patient?.email ?? ''],
    phone: [this.data.patient?.phone ?? ''],
    cpf: [this.data.patient?.cpf ?? ''],
    birthDate: [this.data.patient?.birthDate?.split('T')[0] ?? ''],
    gender: [this.data.patient?.gender ?? ''],
    healthInsurance: [this.data.patient?.healthInsurance ?? ''],
    notes: [this.data.patient?.notes ?? ''],
  });

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.value as any;
    const req$ = this.data.patient
      ? this.service.update(this.data.tenantId, this.data.patient.id, body)
      : this.service.register(this.data.tenantId, body);

    req$.subscribe({
      next: result => {
        this.saving.set(false);
        this.snackBar.open('OK', 'X', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Error', 'X', { duration: 4000 });
      },
    });
  }
}
