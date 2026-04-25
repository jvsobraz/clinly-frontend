import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  ],
  template: `
    <h2 mat-dialog-title>{{ data.patient ? 'Editar Paciente' : 'Novo Paciente' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[440px]">
        <mat-form-field appearance="outline">
          <mat-label>Nome completo *</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>CPF</mat-label>
            <input matInput formControlName="cpf" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Data de nascimento</mat-label>
            <input matInput type="date" formControlName="birthDate" />
          </mat-form-field>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Gênero</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="">— Não informar —</mat-option>
              <mat-option value="Masculino">Masculino</mat-option>
              <mat-option value="Feminino">Feminino</mat-option>
              <mat-option value="Não binário">Não binário</mat-option>
              <mat-option value="Prefiro não informar">Prefiro não informar</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Plano de saúde</mat-label>
            <input matInput formControlName="healthInsurance" />
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2 px-6 pb-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="form.invalid || saving()" (click)="save()">
        {{ saving() ? 'Salvando…' : 'Salvar' }}
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
        this.snackBar.open('Paciente salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Erro ao salvar paciente.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
