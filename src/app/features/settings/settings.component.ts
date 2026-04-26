import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private tenantCtx = inject(TenantContextService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    address: [''],
    primaryColor: ['#6366f1'],
    welcomeMessage: [''],
  });

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  seeding = signal(false);
  clearing = signal(false);
  seedMsg = signal<string | null>(null);
  seedError = signal(false);

  ngOnInit() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.http.get<any>(`${environment.apiUrl}/tenants/${id}`).subscribe({
      next: (t) => {
        this.form.patchValue(t);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (this.form.invalid) return;
    const id = this.tenantCtx.tenantId()!;
    this.saving.set(true);
    this.http.put(`${environment.apiUrl}/tenants/${id}`, this.form.getRawValue()).subscribe({
      next: () => { this.saved.set(true); this.saving.set(false); setTimeout(() => this.saved.set(false), 3000); },
      error: () => this.saving.set(false),
    });
  }

  seedDemo() {
    const id = this.tenantCtx.tenantId()!;
    this.seeding.set(true);
    this.seedMsg.set(null);
    this.http.post<any>(`${environment.apiUrl}/tenants/${id}/seed/demo`, {}).subscribe({
      next: (res) => {
        this.seeding.set(false);
        this.seedError.set(false);
        this.seedMsg.set(res.message);
      },
      error: () => {
        this.seeding.set(false);
        this.seedError.set(true);
        this.seedMsg.set('Erro ao gerar dados demo.');
      },
    });
  }

  clearDemo() {
    const id = this.tenantCtx.tenantId()!;
    this.clearing.set(true);
    this.seedMsg.set(null);
    this.http.delete<any>(`${environment.apiUrl}/tenants/${id}/seed/demo`).subscribe({
      next: (res) => {
        this.clearing.set(false);
        this.seedError.set(false);
        this.seedMsg.set(res.message);
      },
      error: () => {
        this.clearing.set(false);
        this.seedError.set(true);
        this.seedMsg.set('Erro ao remover dados demo.');
      },
    });
  }
}
