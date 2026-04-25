import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppointmentService } from '../../core/services/appointment.service';
import { PatientService } from '../../core/services/patient.service';
import { ProfessionalService } from '../../core/services/professional.service';
import { RoomService, Room } from '../../core/services/room.service';
import { Patient } from '../../core/models/patient.model';
import { Professional } from '../../core/models/professional.model';

interface ClinicService { id: number; name: string; durationMinutes: number; }

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Novo Agendamento</h2>
    <mat-dialog-content>
      @if (loadingData()) {
        <div class="flex justify-center py-10 min-w-[480px]">
          <mat-spinner diameter="36" />
        </div>
      } @else {
        <form [formGroup]="form" class="flex flex-col gap-3 pt-2 min-w-[480px]">
          <mat-form-field appearance="outline">
            <mat-label>Paciente *</mat-label>
            <mat-select formControlName="patientId">
              @for (p of patients(); track p.id) {
                <mat-option [value]="p.id">{{ p.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Profissional *</mat-label>
            <mat-select formControlName="professionalId">
              @for (p of professionals(); track p.id) {
                <mat-option [value]="p.id">{{ p.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Serviço *</mat-label>
            <mat-select formControlName="serviceId" (selectionChange)="onServiceChange($event.value)">
              @for (s of services(); track s.id) {
                <mat-option [value]="s.id">{{ s.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (selectedServiceDuration()) {
            <p class="text-sm text-slate-500 -mt-1 px-1">
              Duração: <span class="font-medium text-slate-700">{{ selectedServiceDuration() }} min</span>
            </p>
          }

          @if (rooms().length > 0) {
            <mat-form-field appearance="outline">
              <mat-label>Sala</mat-label>
              <mat-select formControlName="roomId">
                <mat-option [value]="null">— Nenhuma —</mat-option>
                @for (r of rooms(); track r.id) {
                  <mat-option [value]="r.id">{{ r.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>Data e hora *</mat-label>
            <input matInput type="datetime-local" formControlName="scheduledAt" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Observações</mat-label>
            <textarea matInput formControlName="patientNotes" rows="2"></textarea>
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2 px-6 pb-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [disabled]="form.invalid || saving() || loadingData()" (click)="save()">
        {{ saving() ? 'Salvando…' : 'Agendar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AppointmentDialogComponent implements OnInit {
  private ref = inject(MatDialogRef<AppointmentDialogComponent>);
  data = inject<{ tenantId: number }>(MAT_DIALOG_DATA);
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private professionalService = inject(ProfessionalService);
  private roomService = inject(RoomService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  patients = signal<Patient[]>([]);
  professionals = signal<Professional[]>([]);
  services = signal<ClinicService[]>([]);
  rooms = signal<Room[]>([]);
  selectedServiceDuration = signal<number | null>(null);
  loadingData = signal(true);
  saving = signal(false);

  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    professionalId: [null as number | null, Validators.required],
    serviceId: [null as number | null, Validators.required],
    roomId: [null as number | null],
    scheduledAt: ['', Validators.required],
    patientNotes: [''],
  });

  ngOnInit() {
    const id = this.data.tenantId;
    forkJoin({
      patients: this.patientService.getAll(id),
      professionals: this.professionalService.getAll(id),
      services: this.http.get<ClinicService[]>(`${environment.apiUrl}/tenants/${id}/services`),
      rooms: this.roomService.getAll(id),
    }).subscribe({
      next: ({ patients, professionals, services, rooms }) => {
        this.patients.set(patients);
        this.professionals.set(professionals);
        this.services.set(services);
        this.rooms.set(rooms);
        this.loadingData.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 4000 });
        this.loadingData.set(false);
      },
    });
  }

  onServiceChange(serviceId: number) {
    const svc = this.services().find(s => s.id === serviceId);
    this.selectedServiceDuration.set(svc?.durationMinutes ?? null);
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const body = {
      patientId: v.patientId!,
      professionalId: v.professionalId!,
      serviceId: v.serviceId!,
      roomId: v.roomId ?? undefined,
      scheduledAt: new Date(v.scheduledAt!).toISOString(),
      patientNotes: v.patientNotes || undefined,
    };
    this.appointmentService.create(this.data.tenantId, body).subscribe({
      next: result => {
        this.saving.set(false);
        this.snackBar.open('Agendamento criado!', 'Fechar', { duration: 3000 });
        this.ref.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error ?? 'Erro ao criar agendamento.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
