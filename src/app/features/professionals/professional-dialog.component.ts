import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfessionalService } from '../../core/services/professional.service';
import { SpecialtyService, Specialty } from '../../core/services/specialty.service';
import { Professional } from '../../core/models/professional.model';

interface DialogData {
  tenantId: number;
  professional?: Professional;
}

@Component({
  selector: 'app-professional-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCheckboxModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.professional ? 'Editar Profissional' : 'Novo Profissional' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[440px]">
        <mat-form-field appearance="outline">
          <mat-label>Nome completo *</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>CRM / Registro profissional</mat-label>
          <input matInput formControlName="crm" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bio</mat-label>
          <textarea matInput formControlName="bio" rows="3"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Duração padrão da consulta (min) *</mat-label>
          <input matInput type="number" formControlName="defaultAppointmentDurationMinutes" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Especialidades</mat-label>
          @if (loadingSpecialties()) {
            <mat-select formControlName="specialtyIds" multiple [disabled]="true">
              <mat-option>Carregando...</mat-option>
            </mat-select>
          } @else {
            <mat-select formControlName="specialtyIds" multiple>
              @for (s of specialties(); track s.id) {
                <mat-option [value]="s.id">{{ s.name }}</mat-option>
              }
            </mat-select>
          }
        </mat-form-field>
        <mat-checkbox formControlName="acceptsNewPatients">Aceita novos pacientes</mat-checkbox>
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
export class ProfessionalDialogComponent implements OnInit {
  private ref = inject(MatDialogRef<ProfessionalDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private professionalService = inject(ProfessionalService);
  private specialtyService = inject(SpecialtyService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  specialties = signal<Specialty[]>([]);
  loadingSpecialties = signal(true);
  saving = signal(false);

  form = this.fb.group({
    name: [this.data.professional?.name ?? '', [Validators.required, Validators.minLength(2)]],
    crm: [this.data.professional?.crm ?? ''],
    bio: [this.data.professional?.bio ?? ''],
    defaultAppointmentDurationMinutes: [
      this.data.professional?.defaultAppointmentDurationMinutes ?? 60,
      [Validators.required, Validators.min(5)],
    ],
    specialtyIds: [[] as number[]],
    acceptsNewPatients: [this.data.professional?.acceptsNewPatients ?? true],
  });

  ngOnInit() {
    this.specialtyService.getAll(this.data.tenantId).subscribe({
      next: list => {
        this.specialties.set(list);
        this.loadingSpecialties.set(false);
        if (this.data.professional?.specialties.length) {
          const ids = list
            .filter(s => this.data.professional!.specialties.includes(s.name))
            .map(s => s.id);
          this.form.patchValue({ specialtyIds: ids });
        }
      },
      error: () => this.loadingSpecialties.set(false),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.value as any;
    const req$ = this.data.professional
      ? this.professionalService.update(this.data.tenantId, this.data.professional.id, body)
      : this.professionalService.create(this.data.tenantId, body);

    req$.subscribe({
      next: result => {
        this.saving.set(false);
        this.snackBar.open('Profissional salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Erro ao salvar profissional.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
