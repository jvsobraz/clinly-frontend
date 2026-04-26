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
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.professional ? ('professionals.dialog.titleEdit' | translate) : ('professionals.dialog.titleNew' | translate) }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[440px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        @if (!data.professional) {
          <mat-form-field appearance="outline">
            <mat-label>{{ 'professionals.dialog.email' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-hint>{{ 'professionals.dialog.emailHint' | translate }}</mat-hint>
          </mat-form-field>
        }
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.phone' | translate }}</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.crm' | translate }}</mat-label>
          <input matInput formControlName="crm" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.bio' | translate }}</mat-label>
          <textarea matInput formControlName="bio" rows="3"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.duration' | translate }}</mat-label>
          <input matInput type="number" formControlName="defaultAppointmentDurationMinutes" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'professionals.dialog.specialties' | translate }}</mat-label>
          @if (loadingSpecialties()) {
            <mat-select formControlName="specialtyIds" multiple [disabled]="true">
              <mat-option>{{ 'professionals.dialog.loadingSpecialties' | translate }}</mat-option>
            </mat-select>
          } @else {
            <mat-select formControlName="specialtyIds" multiple>
              @for (s of specialties(); track s.id) {
                <mat-option [value]="s.id">{{ s.name }}</mat-option>
              }
            </mat-select>
          }
        </mat-form-field>
        <mat-checkbox formControlName="acceptsNewPatients">{{ 'professionals.dialog.acceptsNew' | translate }}</mat-checkbox>
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

  isEdit = !!this.data.professional;

  form = this.fb.group({
    name: [this.data.professional?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [
      '',
      this.isEdit ? [] : [Validators.required, Validators.email],
    ],
    phone: [this.data.professional?.phone ?? ''],
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
        if (this.data.professional?.specialties?.length) {
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
    const v = this.form.value;

    const req$ = this.isEdit
      ? this.professionalService.update(this.data.tenantId, this.data.professional!.id, {
          crm: v.crm,
          bio: v.bio,
          defaultAppointmentDurationMinutes: v.defaultAppointmentDurationMinutes,
          acceptsNewPatients: v.acceptsNewPatients,
          specialtyIds: v.specialtyIds,
        })
      : this.professionalService.register(this.data.tenantId, {
          name: v.name,
          email: v.email,
          phone: v.phone,
          crm: v.crm,
          bio: v.bio,
          defaultAppointmentDurationMinutes: v.defaultAppointmentDurationMinutes,
          acceptsNewPatients: v.acceptsNewPatients,
          specialtyIds: v.specialtyIds,
        });

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
