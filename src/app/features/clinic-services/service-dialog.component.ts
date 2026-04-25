import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ClinicService {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

interface DialogData {
  tenantId: number;
  service?: ClinicService;
}

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.service ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[420px]">
        <mat-form-field appearance="outline">
          <mat-label>Nome do serviço *</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Duração (min) *</mat-label>
            <input matInput type="number" formControlName="durationMinutes" min="5" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Preço (R$) *</mat-label>
            <input matInput type="number" formControlName="price" min="0" step="0.01" />
          </mat-form-field>
        </div>
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
export class ServiceDialogComponent {
  private ref = inject(MatDialogRef<ServiceDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);

  form = this.fb.group({
    name: [this.data.service?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.service?.description ?? ''],
    durationMinutes: [this.data.service?.durationMinutes ?? 60, [Validators.required, Validators.min(5)]],
    price: [this.data.service?.price ?? 0, [Validators.required, Validators.min(0)]],
  });

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.value;
    const url = `${environment.apiUrl}/tenants/${this.data.tenantId}/services`;
    const req$ = this.data.service
      ? this.http.put<ClinicService>(`${url}/${this.data.service.id}`, body)
      : this.http.post<ClinicService>(url, body);

    req$.subscribe({
      next: result => {
        this.saving.set(false);
        this.snackBar.open('Serviço salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Erro ao salvar serviço.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
