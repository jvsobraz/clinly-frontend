import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService, Room } from '../../core/services/room.service';

interface DialogData {
  tenantId: number;
  room?: Room;
}

@Component({
  selector: 'app-room-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.room ? 'Editar Sala' : 'Nova Sala' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[380px]">
        <mat-form-field appearance="outline">
          <mat-label>Nome da sala *</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Capacidade *</mat-label>
          <input matInput type="number" formControlName="capacity" min="1" />
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
export class RoomDialogComponent {
  private ref = inject(MatDialogRef<RoomDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private service = inject(RoomService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);

  form = this.fb.group({
    name: [this.data.room?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.room?.description ?? ''],
    capacity: [this.data.room?.capacity ?? 1, [Validators.required, Validators.min(1)]],
  });

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.value as any;
    const req$ = this.data.room
      ? this.service.update(this.data.tenantId, this.data.room.id, body)
      : this.service.create(this.data.tenantId, body);

    req$.subscribe({
      next: result => {
        this.saving.set(false);
        this.snackBar.open('Sala salva com sucesso!', 'Fechar', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Erro ao salvar sala.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
