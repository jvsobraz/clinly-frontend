import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentNotesService, AppointmentNote } from '../../core/services/appointment-notes.service';

interface DialogData {
  tenantId: number;
  appointmentId: number;
  patientName: string;
}

@Component({
  selector: 'app-appointment-notes-dialog',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatInputModule, MatFormFieldModule, MatTooltipModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon class="text-indigo-500">medical_information</mat-icon>
      {{ 'notes.title' | translate }} — {{ data.patientName }}
    </h2>

    <mat-dialog-content class="min-w-[520px] max-h-[60vh]">
      @if (loading()) {
        <div class="flex justify-center py-10"><mat-spinner diameter="36" /></div>
      } @else {
        <div class="flex flex-col gap-3 py-2">
          @if (notes().length === 0) {
            <div class="text-center py-8 text-slate-400">
              <mat-icon class="text-5xl !text-4xl">note_alt</mat-icon>
              <p class="mt-2 text-sm">{{ 'notes.empty' | translate }}</p>
            </div>
          }
          @for (note of notes(); track note.id) {
            <div class="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div class="flex items-start gap-2">
                <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap flex-1">{{ note.content }}</p>
                <button mat-icon-button class="text-slate-300 hover:text-red-500 shrink-0 -mt-2 -mr-2"
                  (click)="delete(note)" [matTooltip]="'common.delete' | translate">
                  <mat-icon class="!text-[18px]">delete</mat-icon>
                </button>
              </div>
              <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                <mat-icon class="!text-[14px]">person</mat-icon>
                <span>{{ note.authorName }}</span>
                <span>·</span>
                <span>{{ note.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          }
        </div>

        <div class="border-t border-slate-100 pt-4 mt-2">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'notes.newNote' | translate }}</mat-label>
            <textarea matInput [(ngModel)]="newContent" rows="3"
              [placeholder]="'notes.placeholder' | translate"></textarea>
          </mat-form-field>
          <div class="flex justify-end -mt-1">
            <button mat-flat-button [disabled]="!newContent.trim() || saving()" (click)="addNote()">
              {{ saving() ? ('common.savingEllipsis' | translate) : ('notes.add' | translate) }}
            </button>
          </div>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="px-6 pb-4">
      <button mat-button mat-dialog-close>{{ 'common.close' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class AppointmentNotesDialogComponent implements OnInit {
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private notesService = inject(AppointmentNotesService);
  private snackBar = inject(MatSnackBar);

  notes = signal<AppointmentNote[]>([]);
  loading = signal(true);
  saving = signal(false);
  newContent = '';

  ngOnInit() { this.load(); }

  load() {
    this.notesService.getAll(this.data.tenantId, this.data.appointmentId).subscribe({
      next: n => { this.notes.set(n); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addNote() {
    if (!this.newContent.trim()) return;
    this.saving.set(true);
    this.notesService.create(this.data.tenantId, this.data.appointmentId, this.newContent.trim()).subscribe({
      next: note => {
        this.notes.update(list => [...list, note]);
        this.newContent = '';
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Erro ao adicionar nota', 'X', { duration: 3000 });
      },
    });
  }

  delete(note: AppointmentNote) {
    if (!confirm('Remover esta nota clínica?')) return;
    this.notesService.delete(this.data.tenantId, this.data.appointmentId, note.id).subscribe({
      next: () => this.notes.update(list => list.filter(n => n.id !== note.id)),
      error: () => this.snackBar.open('Erro ao remover nota', 'X', { duration: 3000 }),
    });
  }
}
